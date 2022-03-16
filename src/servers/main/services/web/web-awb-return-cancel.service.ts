import { WebAwbReturnCancelCreatePayload } from '../../models/web-awb-return-cancel.vm';
import { AwbService } from '../v1/awb.service';
import { WebReturCancelListResponse, WebAwbReturnCancelCreateResponse, ScanAwbVm } from '../../models/web-retur-cancel-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AwbReturn } from '../../../../shared/orm-entity/awb-return';
import { AwbReturnCancel } from '../../../../shared/orm-entity/awb-return-cancel';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { MetaService } from '../../../../shared/services/meta.service';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import { CsvHelper } from '../../../../shared/helpers/csv-helpers';
import { QueryServiceApi } from '../../../../shared/services/query.service.api';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { HttpStatus } from '@nestjs/common';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { getManager, In } from 'typeorm';
import e = require('express');

export class WebAwbReturnCancelService {

  static async createAwbReturnCancel(payload: WebAwbReturnCancelCreatePayload): Promise<WebAwbReturnCancelCreateResponse> {
    const uuidv1 = require('uuid/v1');
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const result = new WebAwbReturnCancelCreateResponse();
    const timeNow = moment().toDate();
    const dataItem = [];
    const awbCancelReturnArr = new Array();
    const dataAwb = [];
    let totalSuccses = 0;

    if (payload.scanValue.length > 20) {
      RequestErrorService.throwObj(
        {
          message: 'Cannot scan more than 20 AWB number',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    for (const awbNumber of payload.scanValue) {
      const awb = await AwbService.validAwbNumber(awbNumber);
      const response = new ScanAwbVm();
      if (awb) {
        if (awb.awbStatusIdLast == AWB_STATUS.RTS || awb.awbStatusIdLast == AWB_STATUS.DLV) {
          response.status = 'error';
          response.message = `Resi ${awbNumber} Status final tidak dapat di proses`;
        } else if (awb.awbStatusIdLast == AWB_STATUS.CANCEL_RETURN) {
          response.status = 'error';
          response.message = `Resi ${awbNumber} sudah diproses`;
        } else {
          let awbReturn = await AwbReturn.findOne({
            where: {
              originAwbNumber: awbNumber,
              isDeleted: false
            }
          })

          if (awbReturn) {
            // insert to array
            const awbReturnCancel = AwbReturnCancel.create();
            awbReturnCancel.id = uuidv1();
            awbReturnCancel.awbItemId = awb.awbItemId;
            awbReturnCancel.awbNumber = awbNumber;
            awbReturnCancel.notes = payload.notes;
            awbReturnCancel.branchId = permissonPayload.branchId;
            awbReturnCancel.createdTime = timeNow;
            awbReturnCancel.userIdCreated = authMeta.userId;
            awbReturnCancel.updatedTime = timeNow;
            awbReturnCancel.userIdUpdated = authMeta.userId;
            awbReturnCancel.isDeleted = false;

            dataAwb.push(awbNumber);
            awbCancelReturnArr.push(awbReturnCancel);

            response.status = 'ok';
            response.message = `success`;
            totalSuccses++;
          } else {
            response.status = 'error';
            response.message = `Resi ${awbNumber} bukan resi return`;
          }
        }
      } else {
        response.status = 'error';
        response.message = `Resi ${awbNumber} Tidak di Temukan`;
      }

      dataItem.push({
        awbNumber,
        ...response,
      });
    }

    await getManager().transaction(async transactional => {
      if (awbCancelReturnArr.length > 0 && totalSuccses > 0) {
        await transactional.insert(AwbReturnCancel, awbCancelReturnArr);
        await transactional.update(AwbReturn, {
          originAwbNumber: In(dataAwb)
        }, {
          isDeleted: true
        })
      }
    });

    //send to bull
    for (const item of awbCancelReturnArr) {
      DoPodDetailPostMetaQueueService.createJobByAwbReturnCancel(
        item.awbItemId,
        AWB_STATUS.CANCEL_RETURN,
        item.branchId,
        item.userIdCreated,
        item.notes
      );
    }

    result.data = dataItem;

    return result;
  }

  static async exportReturnCancelList(payload: BaseMetaPayloadVm) {
    try {
      const fileName = `POD_return_cancel_list${new Date().getTime()}.csv`;
      payload.fieldResolverMap['awbReturnCancelId'] = 't1.id';
      payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
      payload.fieldResolverMap['awbItemId'] = 't1.awb_item_id';
      payload.fieldResolverMap['branchId'] = 't1.branch_id';
      payload.fieldResolverMap['createdTime'] = 't1.created_time';
      payload.fieldResolverMap['updatedTime'] = 't1.updated_time';
      payload.fieldResolverMap['nik'] = 't2.nik';
      payload.fieldResolverMap['employeeName'] = 't2.fullname';
      payload.fieldResolverMap['notes'] = 't1.notes';

      // mapping search field and operator default ilike
      payload.globalSearchFields = [
        {
          field: 'createdTime',
        },
        {
          field: 'branchId',
        },
      ];

      const repo = new OrionRepositoryService(AwbReturnCancel, 't1');
      const q = repo.findAllRaw();

      payload.applyToOrionRepositoryQuery(q);

      q.selectRaw(
        [`TO_CHAR(t1.created_time, 'YYYY-MM-DD')`, 'Tanggal'],
        [`''''||t1.awb_number||''''`, 'Resi'],
        [`t2.nik||' - '||t2.fullname`, 'User Update'],
        [`t3.branch_code||' - '||t3.branch_name`, 'Cabang/ Gerai'],
        [`t1.notes`, 'Keterangan'],
      );

      q.innerJoin(e => e.user.employee, 't2');
      q.innerJoin(e => e.branch, 't3');
      q.andWhere(e => e.isDeleted, w => w.isFalse());

      return q.getQuery();
      
    } catch (err) {
      throw err;
    }
  }

  static async listReturnCancel(
    payload: BaseMetaPayloadVm,
  ): Promise<WebReturCancelListResponse> {
    // mapping field
    payload.fieldResolverMap['awbReturnCancelId'] = 't1.id';
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['awbItemId'] = 't1.awb_item_id';
    payload.fieldResolverMap['branchId'] = 't1.branch_id';
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['updatedTime'] = 't1.updated_time';
    payload.fieldResolverMap['nik'] = 't2.nik';
    payload.fieldResolverMap['employeeName'] = 't2.fullname';
    payload.fieldResolverMap['branchName'] = 't3.branch_name';
    payload.fieldResolverMap['notes'] = 't1.notes';
    if (payload.sortBy === '') {
      payload.sortBy = 'updatedTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'createdTime',
      },
      {
        field: 'awbNumber',
      },
      {
        field: 'branchId',
      },
    ];

    const repo = new OrionRepositoryService(AwbReturnCancel, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.id', 'awbReturnCancelId'],
      ['t1.awb_number', 'awbNumber'],
      ['t1.awb_item_id', 'awbItemId'],
      ['t1.created_time', 'createdTime'],
      ['t1.updated_time', 'updatedTime'],
      ['t1.branch_id', 'branchId'],
      ['t2.nik', 'nik'],
      ['t2.fullname', 'employeeName'],
      ['t3.branch_name', 'branchName'],
      ['t1.notes', 'notes'],
    );
    q.innerJoin(e => e.user.employee, 't2');
    q.innerJoin(e => e.branch, 't3');
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = 0;

    const result = new WebReturCancelListResponse();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async listReturnCountCancel(
    payload: BaseMetaPayloadVm,
  ): Promise<WebReturCancelListResponse> {
    // mapping field
    payload.fieldResolverMap['awbReturnCancelId'] = 't1.id';
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['awbItemId'] = 't1.awb_item_id';
    payload.fieldResolverMap['branchId'] = 't1.branch_id';
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['updatedTime'] = 't1.updated_time';
    payload.fieldResolverMap['nik'] = 't2.nik';
    payload.fieldResolverMap['employeeName'] = 't2.fullname';
    payload.fieldResolverMap['branchName'] = 't3.branch_name';
    payload.fieldResolverMap['notes'] = 't1.notes';
    payload.sortBy ="";
    payload.page = 1;

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'createdTime',
      },
      {
        field: 'awbNumber',
      },
      {
        field: 'branchId',
      },
    ];

    const repo = new OrionRepositoryService(AwbReturnCancel, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['count(t1.id)', 'cnt'],
    );
    q.innerJoin(e => e.user.employee, 't2');
    q.innerJoin(e => e.branch, 't3');
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    let total = await q.exec();
    total = total[0].cnt;

    const result = new WebReturCancelListResponse();
    result.data = [];
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
