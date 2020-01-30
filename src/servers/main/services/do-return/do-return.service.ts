import { Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ReturnFindAllResponseVm } from '../../models/do-return.response.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { DoReturnAwb } from '../../../../shared/orm-entity/do_return_awb';
import { MetaService } from '../../../../shared/services/meta.service';
import { DoReturnPayloadVm } from '../../models/do-return-update.vm';
import { DoReturnHistory } from '../../../../shared/orm-entity/do_return_history';
import { DoReturnMaster } from '../../../../shared/orm-entity/do_return_master';
import { AuthService } from '../../../../shared/services/auth.service';
import { ReturnUpdateFindAllResponseVm } from '../../models/do-return-update.response.vm';
import { ReturnCreateVm } from '../../models/do-return-create.vm';
import moment = require('moment');
import { DoReturnDeliveryOrderCreateVm } from '../../models/do-return-surat-jalan-create.vm';
import { DoReturnAdmintoCt } from '../../../../shared/orm-entity/do_return_admin_to_ct';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';

@Injectable()
export class DoReturnService {
  static async findAllByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<ReturnFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.fieldResolverMap['podDatetime'] = 'return.pod_datetime';
    payload.fieldResolverMap['branchIdLast'] = 'return.branch_id_last';
    payload.fieldResolverMap['customerId'] = 'return.customer_id';
    payload.fieldResolverMap['doReturnAwbNumber'] = 'return.do_return_awb_number';
    payload.fieldResolverMap['awbNumber'] = 'return.awb_number';
    payload.fieldResolverMap['doReturnMasterCode'] = 'do_return_master.do_return_master_code';
    const repo = new OrionRepositoryService(DoReturnAwb, 'return');

    // const q = repo.findAllRaw();
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['return.do_return_awb_id', 'doReturnAwbId'],
      ['return.awb_number', 'awbNumber'],
      ['return.do_return_awb_number', 'doReturnAwbNumber'],
      ['return.pod_datetime', 'podDatetime'],
      ['return.customer_id', 'customerId'],
      ['branch.branch_name', 'branchName'],
      ['customer.customer_name', 'customerName'],
      ['awb_status.awb_status_title', 'awbStatus'],
      ['return.branch_id_last', 'branchIdLast'],
      ['return.do_return_admin_to_ct_id', 'doReturnAdminToCtId'],
      ['return.do_return_ct_to_collection_id', 'doReturnCtToCollectionId'],
      ['return.do_return_collection_to_cust_id', 'doReturnCollectionToCustId'],
      ['do_return_master.do_return_master_desc', 'doReturnMasterDesc'],
      ['do_return_master.do_return_master_code', 'doReturnMasterCode'],
      ['do_return_admin.', 'do_return_admin_to_ct', 'doCode'],
    );
    q.innerJoin(e => e.branchTo, 'branch', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.customer, 'customer', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awbStatusDetail, 'awb_status', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.doReturnHistory.doReturnMaster, 'do_return_master', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.doReturnAdmin, 'do_return_admin', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new ReturnFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
  static async updateDoReturn(
    payload: DoReturnPayloadVm,
  ): Promise<ReturnUpdateFindAllResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new ReturnUpdateFindAllResponseVm();
    // const permissonPayload = AuthService.getPermissionTokenPayload();
    let status = 'ok';
    let message = 'success';
    const timeNow = moment().toDate();
    const doReturnMaster = await DoReturnMaster.findOne({
      where: {
        doReturnMasterCode : payload.returnStatus,
      },
    });
    if (doReturnMaster) {
      for (const history of payload.returnAwbId) {
       const hist = DoReturnHistory.create({
          doReturnAwbId : history,
          createdTime : timeNow,
          doReturnMasterId : doReturnMaster.doReturnMasterId,

        });
       const update = await DoReturnHistory.save(hist);
       const returnHistId = update.doReturnHistoryId;

       await DoReturnAwb.update(
         history,
         {
           doReturnHistoryIdLast : returnHistId,
           userIdUpdated : authMeta.userId,
           updatedTime :  timeNow,
         });
      }
      status = 'ok';
      message = 'Success';
    } else {
      status = 'error';
      message = 'Status tidak sesuai';
    }
    result.status = status;
    result.message = message;
    return result ;
  }

  static async findAllDoListAdmin(
    payload: BaseMetaPayloadVm,
  ): Promise<ReturnFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.fieldResolverMap['podDatetime'] = 'return.pod_datetime';
    payload.fieldResolverMap['branchIdLast'] = 'return.branch_id_last';
    payload.fieldResolverMap['customerId'] = 'return.customer_id';
    payload.fieldResolverMap['doReturnAwbNumber'] = 'return.do_return_awb_number';
    payload.fieldResolverMap['awbNumber'] = 'return.awb_number';
    payload.fieldResolverMap['doReturnMasterCode'] = 'do_return_master.do_return_master_code';
    const repo = new OrionRepositoryService(DoReturnAwb, 'return');

    // const q = repo.findAllRaw();
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['return.do_return_awb_id', 'doReturnAwbId'],
      ['return.awb_number', 'awbNumber'],
      ['return.do_return_awb_number', 'doReturnAwbNumber'],
      ['return.pod_datetime', 'podDatetime'],
      ['return.customer_id', 'customerId'],
      ['branch.branch_name', 'branchName'],
      ['customer.customer_name', 'customerName'],
      ['awb_status.awb_status_title', 'awbStatus'],
      ['return.branch_id_last', 'branchIdLast'],
      ['return.do_return_admin_to_ct_id', 'doReturnAdminToCtId'],
      ['return.do_return_ct_to_collection_id', 'doReturnCtToCollectionId'],
      ['return.do_return_collection_to_cust_id', 'doReturnCollectionToCustId'],
      ['do_return_master.do_return_master_desc', 'doReturnMasterDesc'],
      ['do_return_master.do_return_master_code', 'doReturnMasterCode'],
      ['do_return_admin.', 'do_return_admin_to_ct', 'doCode'],
    );
    q.innerJoin(e => e.branchTo, 'branch', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.customer, 'customer', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awbStatusDetail, 'awb_status', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.doReturnHistory.doReturnMaster, 'do_return_master', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.doReturnAdmin, 'do_return_admin', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new ReturnFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  // create do retrurn
  static async returnCreate(
    payload: ReturnCreateVm,
  ): Promise<ReturnUpdateFindAllResponseVm> {
    const result = new ReturnUpdateFindAllResponseVm();
    const status = 'ok';
    const message = 'success';
    const timeNow = moment().toDate();
    const authMeta = AuthService.getAuthData();
    // create do_pod (Surat Jalan)
    for (const history of payload.data) {
      const doReturn = DoReturnAwb.create();
      const doPodDateTime = moment(history.podDatetime).toDate();
      doReturn.awbNumber = history.awbNumber;
      doReturn.doReturnAwbNumber = history.doReturnNo;
      doReturn.customerId = history.customerId;
      doReturn.awbStatusIdLast = history.lastStatusAwb;
      doReturn.branchIdLast = history.branchIdLast;
      doReturn.podDatetime = history.podDatetime;
      doReturn.userIdCreated = authMeta.userId;
      doReturn.userIdUpdated = authMeta.userId;
      doReturn.createdTime = timeNow;
      doReturn.updatedTime = timeNow;

      const insert = await DoReturnAwb.save(doReturn);
    }

    result.status = status;
    result.message = message;

    return result;
  }

  static async deliveryOrderCreate(
    payload: DoReturnDeliveryOrderCreateVm,
  ): Promise<ReturnUpdateFindAllResponseVm> {
    const result = new ReturnUpdateFindAllResponseVm();
    const authMeta         = AuthService.getAuthData();
    // const permissonPayload = AuthService.getPermissionTokenPayload();
    const status = 'ok';
    const message = 'success';
    const timeNow = moment().toDate();
    // insert to DoReturnAdmintoCt
    const generateCode = await CustomCounterCode.doReturn(timeNow);
    const adminCt = DoReturnAdmintoCt.create();
    adminCt.partnerLogisticId = payload.partnerLogisticId;
    adminCt.isPartnerLogistic = payload.isPartnerLogistic;
    adminCt.awbNumberNew = payload.awbNumberNew;

    adminCt.doReturnAdminToCt = generateCode;
    adminCt.countAwb = payload.countAwb;
    adminCt.userIdCreated = authMeta.userId;
    adminCt.userIdUpdated = authMeta.userId;
    adminCt.createdTime = timeNow;

    const admin = await DoReturnAdmintoCt.save(adminCt);

    const doReturnMaster = await DoReturnMaster.findOne({
      where: {
        doReturnMasterCode : 9001,
      },
    });

  //  insert to do return awb history
    if (doReturnMaster) {
    for (const returnAwbId of payload.doReturnAwbId) {
      const returnHist = DoReturnHistory.create();
      returnHist.userIdCreated = authMeta.userId;
      returnHist.userIdUpdated = authMeta.userId;
      returnHist.createdTime = timeNow;
      returnHist.doReturnMasterId =  doReturnMaster.doReturnMasterId;
      returnHist.doReturnAwbId = returnAwbId;
      const history = await DoReturnHistory.save(returnHist);

      const historyId = history.doReturnHistoryId;
  // Update do return awb
      await DoReturnAwb.update(
        returnAwbId, {
          doReturnHistoryIdLast : historyId,
          doReturnAdminToCtId : adminCt.doReturnAdminToCtId,
          userIdUpdated : authMeta.userId,
          updatedTime : timeNow,
        },
      );
    }
  }
    result.status = status;
    result.message = message;

    return result;
  }

}
