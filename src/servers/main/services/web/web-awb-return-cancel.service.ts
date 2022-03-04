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
import { getManager } from 'typeorm';

export class WebAwbReturnCancelService {
  static ExportHeaderReturnList = [
    'Resi',
    'Status',
    'Tanggal Retur',
    'Gerai Manifest',
    'Gerai Asal Retur',
    'Gerai Terakhir Retur',
    // 'Partner',
    'Resi Retur',
    'Jenis Return',
    'Pengirim',
  ];

  private static strReplaceFunc = str => {
    return str
      ? str
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/;/g, '|')
          .replace(/,/g, '.')
      : null;
  }

  private static streamTransformReturList(d) {
    const values = [
      `'${d.originAwbNumber}`,
      WebAwbReturnCancelService.strReplaceFunc(d.awbStatus),
      d.createdTime ?  moment(d.createdTime).format('YYYY-MM-DD') : '-',
      WebAwbReturnCancelService.strReplaceFunc(d.branchManifest),
      WebAwbReturnCancelService.strReplaceFunc(d.branchFrom),
      WebAwbReturnCancelService.strReplaceFunc(d.branchTo),
      // WebAwbReturnService.strReplaceFunc(d.partnerName),
      d.returnAwbNumber ? WebAwbReturnCancelService.strReplaceFunc(`'${d.returnAwbNumber}`) : '-',
      d.userIdDriver ? 'Manual' : (d.isPartnerLogistic ? d.partnerLogisticName : 'Internal'),
      WebAwbReturnCancelService.strReplaceFunc(d.consignerName),
    ];
    return `${values.join(',')} \n`;
  }

  static async createAwbReturnCancel(payload: WebAwbReturnCancelCreatePayload): Promise<WebAwbReturnCancelCreateResponse> {
    const uuidv1 = require('uuid/v1');
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const result = new WebAwbReturnCancelCreateResponse();
    const timeNow = moment().toDate();
    const dataItem = [];
    const awbCancelReturnArr = new Array();
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
            awbCancelReturnArr.push(awbReturnCancel);

            response.status = 'ok';
            response.message = `success`;
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
      for(const data of awbCancelReturnArr){
        //extract and update
        transactional.insert(AwbReturnCancel, data);
        transactional.update(AwbReturn,{
          originAwbNumber : data.awbNumber
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

      payload.fieldResolverMap['awbReturnId'] = 't1.awb_return_id';
      payload.fieldResolverMap['originAwbId'] = 't1.origin_awb_id';
      payload.fieldResolverMap['originAwbNumber'] = 't1.origin_awb_number';
      payload.fieldResolverMap['returnAwbId'] = 't1.return_awb_id';
      payload.fieldResolverMap['partnerLogisticAwb'] = 't1.partner_logistic_awb';
      payload.fieldResolverMap['returnAwbNumber'] = 't1.return_awb_number';
      payload.fieldResolverMap['isPartnerLogistic'] = 't1.is_partner_logistic';
      payload.fieldResolverMap['partnerLogisticName'] = 't1.partner_logistic_name';
      payload.fieldResolverMap['branchIdTo'] = 't1.branch_id';
      payload.fieldResolverMap['branchTo'] = 't3.branch_name';
      payload.fieldResolverMap['createdTime'] = 't1.created_time';
      payload.fieldResolverMap['updatedTime'] = 't1.updated_time';
      payload.fieldResolverMap['awbReplacementTime'] = 't1.awb_replacement_time';
      payload.fieldResolverMap['awbStatus'] = 't2.awb_status_name';
      payload.fieldResolverMap['awbStatusId'] = 't2.awb_status_id';
      payload.fieldResolverMap['partnerLogisticId'] = 't1.partner_logistic_id';
      payload.fieldResolverMap['branchManifest'] = 't4.branch_name';
      payload.fieldResolverMap['branchIdManifest'] = 't4.branch_id';
      payload.fieldResolverMap['branchIdFrom'] = 't6.branch_id';
      payload.fieldResolverMap['branchFrom'] = 't6.branch_name';
      payload.fieldResolverMap['consignerName'] = 't7.ref_prev_customer_account_id';
      payload.fieldResolverMap['userUpdatedName'] = '"userUpdatedName"';
      payload.fieldResolverMap['replacementAwbStatusLast'] = '"replacementAwbStatusLast"';

      payload.globalSearchFields = [
        {
          field: 'originAwbNumber',
        },
      ];

      const repo = new OrionRepositoryService(AwbReturn, 't1');
      const q = repo.findAllRaw();

      payload.applyToOrionRepositoryQuery(q);

      q.selectRaw(
        [`''''||t1.origin_awb_number`, 'Resi'],
        ['t2.awb_status_name', 'Status'],
        ['t9.awb_status_name', 'Status Resi Pengganti'],
        ['TO_CHAR(t1.created_time, \'YYYY-MM-DD\')', 'Tanggal Retur'],
        ['TO_CHAR(t1.updated_time, \'YYYY-MM-DD\')', 'Tanggal Update Retur'],
        ['TO_CHAR(t1.awb_replacement_time, \'YYYY-MM-DD\')', 'Tanggal Status Resi Pengganti'],
        ['t4.branch_name', 'Gerai Manifest'],
        ['t6.branch_name', 'Gerai Asal Retur'],
        ['t3.branch_name', 'Gerai Terakhir Retur'],
        [`CAST(t7.total_cod_value AS NUMERIC(20,2))`, 'Nilai COD'],
        [`COALESCE(''''||t1.return_awb_number, '-')`, 'Resi Retur'],
        [`CASE
            WHEN t1.user_id_driver IS NOT NULL THEN 'Manual'
            WHEN t1.partner_logistic_name IS NOT NULL THEN t1.partner_logistic_name
            ELSE 'Internal'
          END`, 'Jenis Retur'],
        [
          `COALESCE(t7.ref_prev_customer_account_id, t7.ref_customer_account_id,'')`,
          'Pengirim',
        ],
        [`t8.nik||' - '||t8.fullname`, 'User Update'],
      );

      q.innerJoin(e => e.originAwb.awbStatus, 't2', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q.innerJoin(e => e.branch, 't3', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q.innerJoin(e => e.awb, 't7', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q.leftJoin(e => e.awb.branch, 't4', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q.leftJoin(e => e.branchFrom, 't6', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q.leftJoin(e => e.userUpdated.employee, 't8', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q.leftJoin(e => e.returnAwb.awbStatus, 't9', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      
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
    q.innerJoin(e => e.employee, 't2');
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
    q.innerJoin(e => e.employee, 't2');
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebReturCancelListResponse();
    result.data = [];
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
