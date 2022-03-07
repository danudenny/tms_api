import { WebAwbReturnCancelCreatePayload} from '../../models/web-awb-return-cancel.vm';
import { AwbService } from '../v1/awb.service';
import { WebReturCancelListResponse, WebAwbReturnCancelCreateResponse,ScanAwbVm } from '../../models/web-retur-cancel-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AwbReturn } from '../../../../shared/orm-entity/awb-return';
import { AwbReturnCancel } from '../../../../shared/orm-entity/awb-return-cancel';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { MetaService } from '../../../../shared/services/meta.service';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import {DoPodDetailPostMetaQueueService} from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import {CsvHelper} from '../../../../shared/helpers/csv-helpers';
import { QueryServiceApi } from '../../../../shared/services/query.service.api';
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
    for (const awbNumber of payload.scanValue) {
      const awb = await AwbService.validAwbNumber(awbNumber);
      const response = new ScanAwbVm();
      if(awb){
        if(awb.awbStatusIdLast == AWB_STATUS.RTS || awb.awbStatusIdLast == AWB_STATUS.DLV){
          response.status = 'error';
          response.message = `Resi ${awbNumber} Status final tidak dapat di proses`;
        }else{
          let awbReturn = await AwbReturn.findOne({
            where :{
              returnAwbNumber : awbNumber,
              isDeleted : false
            }
          })

          if(awbReturn){
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
          }else{
            response.status = 'error';
            response.message = `Resi ${awbNumber} bukan resi return`;
          }
        }
      }else{
        response.status = 'error';
        response.message = `Resi ${awbNumber} Tidak di Temukan`;
      }

      dataItem.push({
        awbNumber,
        ...response,
      });
    }

    await getManager().transaction(async transactional => {
      if(awbCancelReturnArr.length > 0 && totalSuccses > 0){
        await transactional.insert(AwbReturnCancel, awbCancelReturnArr);
        await transactional.update(AwbReturn,{
          originAwbNumber : In(dataAwb)
        },{
          isDeleted : true
        })
      }
    });

    //send to bull
    for( const item of awbCancelReturnArr) {
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

  static async exportReturnCancelList(payload: BaseMetaPayloadVm, response) {
    try {
      const fileName = `POD_return_cancel_list${new Date().getTime()}.csv`;

      response.setHeader(
        'Content-disposition',
        `attachment; filename=${fileName}`,
      );

      payload.fieldResolverMap['awbReturnCancelId'] = 't1.id';
      payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
      payload.fieldResolverMap['awbItemId'] = 't1.awb_item_id';
      payload.fieldResolverMap['branchId'] = 't1.branch_id';
      payload.fieldResolverMap['createdTime'] = 't1.created_time';
      payload.fieldResolverMap['updatedTime'] = 't1.updated_time';
      payload.fieldResolverMap['nik'] = 't2.nik';
      payload.fieldResolverMap['empolyeeName'] = 't2.fullname';

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
        [`date(t1.created_time)`, 'Tanggal'],
        [`t1.awb_number`, 'Resi'],
        [`concat(t2.nik,' - ',t2.fullname)`, 'User Update'],
        [`concat(t3.branch_code,' - ',t3.branch_name)`, 'Cabang/ Gerai'],
      );

      q.innerJoin(e => e.user.employee, 't2');
      q.innerJoin(e => e.branch, 't3');
      q.andWhere(e => e.isDeleted, w => w.isFalse());

      
      const query = await q.getQuery();
      let data =  await QueryServiceApi.executeQuery(query, false, null);

      await CsvHelper.generateCSV(response, data, fileName);
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
    payload.fieldResolverMap['empolyeeName'] = 't2.fullname';
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
      ['t2.fullname', 'empolyeeName'],
    );
    q.innerJoin(e => e.user.employee, 't2');
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
    payload.fieldResolverMap['empolyeeName'] = 't2.fullname';
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
      ['t1.branch_id', 'branchId'],
      ['t1.created_time', 'createdTime'],
      ['t1.updated_time', 'updatedTime'],
      ['t2.nik', 'nik'],
      ['t2.fullname', 'empolyeeName'],
    );
    q.innerJoin(e => e.user.employee, 't2');
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebReturCancelListResponse();
    result.data = [];
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
