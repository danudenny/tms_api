import { Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ReturnFindAllResponseVm, DoReturnAdminFindAllResponseVm, DoReturnCtFindAllResponseVm, DoReturnCollectionFindAllResponseVm } from '../../models/do-return.response.vm';
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
import { DoReturnCtToCollection } from '../../../../shared/orm-entity/do_return_ct_to_collection';
import { DoReturnCollectionToCust } from '../../../../shared/orm-entity/do_return_collection_to_cust';
import { DoReturnDeliveryOrderCtCreateVm, DoReturnDeliveryOrderCustCreateVm, DoReturnDeliveryOrderCustReceivedCreateVm } from '../../models/do-return-surat-jalan-ct-create.vm';
import { AttachmentTms } from '../../../../shared/orm-entity/attachment-tms';
import { AttachmentService } from '../../../../shared/services/attachment.service';
import { file } from '@babel/types';
import { ReturnHistoryPayloadVm } from '../../models/do-return-history-payload.vm';
import { ReturnHistoryResponseVm } from '../../models/do-return-history-response.vm';
import { createQueryBuilder } from 'typeorm';
import { AuthMetadata } from '../../../auth/models/auth-metadata.model';

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
      ['do_return_admin.do_return_admin_to_ct', 'doCode'],
      ['do_return_ct.do_return_ct_to_collection', 'doCodeCt'],
      ['do_return_collection.do_return_collection_to_cust', 'doCodeCollection'],
      [`CONCAT(user_driver.first_name, ' ', user_driver.last_name)`, 'userDriver'],
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
    q.leftJoin(e => e.doReturnHistory.user, 'user_driver', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.doReturnAdmin, 'do_return_admin', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.doReturnCt, 'do_return_ct', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.doReturnCollection, 'do_return_collection', j =>
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
          userIdDriver : payload.userIdDriver,
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
  ): Promise<DoReturnAdminFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['doCode'] = 't1.do_return_admin_to_ct';
    payload.fieldResolverMap['awbNumberNew'] = 't1.awb_number_new';
    payload.fieldResolverMap['branchId'] = 't1.branch_id';
    const repo = new OrionRepositoryService(DoReturnAdmintoCt, 't1');

    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_return_admin_to_ct_id', 'doReturnAdminId'],
      ['t1.do_return_admin_to_ct', 'doCode'],
      ['t1.count_awb', 'countAwb'],
      ['t1.is_partner_logistic', 'isPartnerLogistic'],
      ['t1.awb_number_new', 'awbNumberNew'],
      ['t1.partner_logistic_id', 'partnerLogisticId'],
      ['t1.created_time', 'createdTime'],
      ['t2.url', 'attachUrl'],
      ['t3.partner_logistic_name', 'partnerLogisticName'],
      ['t4.branch_name', 'branchName'],
      ['t1.branch_id', 'branchId'],
    );
    q.leftJoin(e => e.attDetail, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.partnerLogistic, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new DoReturnAdminFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async findAllDoListCt(
    payload: BaseMetaPayloadVm,
  ): Promise<DoReturnCtFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['doCode'] = 't1.do_return_ct_to_collection';
    const repo = new OrionRepositoryService(DoReturnCtToCollection, 't1');

    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_return_ct_to_collection_id', 'doReturnAdminId'],
      ['t1.do_return_ct_to_collection', 'doCode'],
      ['t1.count_awb', 'countAwb'],
      ['t1.created_time', 'createdTime'],
      [`CONCAT(t2.first_name, ' ', t2.last_name)`, 'userCreated'],
    );
    q.innerJoin(e => e.user, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new DoReturnCtFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async findAllDoListCollection(
    payload: BaseMetaPayloadVm,
  ): Promise<DoReturnCollectionFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['doCode'] = 't1.do_return_collection_to_cust';
    const repo = new OrionRepositoryService(DoReturnCollectionToCust, 't1');

    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_return_collection_to_cust_id', 'doReturnAdminId'],
      ['t1.do_return_collection_to_cust', 'doCode'],
      ['t1.count_awb', 'countAwb'],
      ['t1.created_time', 'createdTime'],
      [`CONCAT(t2.first_name, ' ', t2.last_name)`, 'userCreated'],
    );
    q.innerJoin(e => e.user, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new DoReturnCollectionFindAllResponseVm();
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

  static async historyStatus(
    payload: ReturnHistoryPayloadVm,
  ): Promise<ReturnHistoryResponseVm> {
    const result = new ReturnHistoryResponseVm();
    result.awbNumber = '';
    result.awbNumberNew = '';
    result.customerName = '';
    result.doReturnNumber = '';

    const qb = createQueryBuilder();
    qb.addSelect('b.awb_number', 'awbNumber');
    qb.addSelect('b.do_return_awb_number', 'doReturnNumber');
    qb.addSelect('d.awb_number_new', 'awbNumberNew');
    qb.addSelect('g.customer_name', 'customerName');
    qb.addSelect('a.created_time', 'dateTime');
    qb.addSelect('c.do_return_master_code', 'statusCode');
    qb.addSelect('c.do_return_master_desc', 'status');
    qb.addSelect(`CONCAT(h.first_name, ' ', h.last_name, ' (', i.nik, ')')`, 'userName');
    qb.addSelect(`(CASE
      WHEN c.do_return_master_code = '9005' THEN f.do_return_collection_to_cust
      WHEN c.do_return_master_code = '9003' THEN e.do_return_ct_to_collection
      WHEN c.do_return_master_code = '9001' THEN d.do_return_admin_to_ct
      ELSE '-'
    END)`, 'doCode');
    qb.from('do_return_history', 'a');
    qb.innerJoin('do_return_awb', 'b', 'a.do_return_awb_id = b.do_return_awb_id AND a.is_deleted = false');
    qb.innerJoin('do_return_master', 'c', 'c.is_deleted = false AND c.do_return_master_id = a.do_return_master_id');
    qb.leftJoin('do_return_admin_to_ct', 'd', 'd.do_return_admin_to_ct_id = b.do_return_admin_to_ct_id AND d.is_deleted = false');
    qb.leftJoin('do_return_ct_to_collection', 'e', 'e.do_return_ct_to_collection_id = b.do_return_ct_to_collection_id AND e.is_deleted = false');
    qb.leftJoin('do_return_collection_to_cust', 'f', 'f.do_return_collection_to_cust_id = b.do_return_collection_to_cust_id AND f.is_deleted = false');
    qb.leftJoin('customer', 'g', 'g.customer_id = b.customer_id AND g.is_deleted = false');
    qb.leftJoin('users', 'h', 'h.user_id = a.user_id_created AND h.is_deleted = false');
    qb.leftJoin('employee', 'i', 'i.employee_id = h.employee_id AND i.is_deleted = false');
    qb.where('a.deleted = false');
    qb.andWhere('a.do_return_awb_id = :doReturnAwbId', { doReturnAwbId: payload.doReturnAwbId });
    qb.addOrderBy('a.created_time', 'DESC');
    const data = await qb.getRawMany();
    result.data = data;
    if (data) {
      result.awbNumber = data[0].awbNumber;
      result.awbNumberNew = data[0].awbNumberNew;
      result.customerName = data[0].customerName;
      result.doReturnNumber = data[0].doReturnNumber;
    }

    return result;
  }

  static async deliveryOrderCreate(
    payload: DoReturnDeliveryOrderCreateVm,
    file,
  ): Promise<ReturnUpdateFindAllResponseVm> {
    const result = new ReturnUpdateFindAllResponseVm();
    const authMeta         = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const status = 'ok';
    const message = 'success';
    let attachmentId = null;
    const timeNow = moment().toDate();

    const attachment = await AttachmentService.uploadFileBufferToS3(
      file.buffer,
      file.originalname,
      file.mimetype,
      'DO-Balik',
    );
    if (attachment) {
      attachmentId = attachment.attachmentTmsId;
    }
    // insert to DoReturnAdmintoCt
    const generateCode = await CustomCounterCode.doReturn(timeNow);
    const adminCt = DoReturnAdmintoCt.create();
    adminCt.partnerLogisticId = payload.partnerLogisticId === '' ? null : payload.partnerLogisticId;
    adminCt.isPartnerLogistic = payload.isPartnerLogistic;
    adminCt.awbNumberNew = payload.awbNumberNew;
    adminCt.attachmentId = attachmentId;
    adminCt.doReturnAdminToCt = generateCode;
    adminCt.branchId = permissonPayload.branchId;
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
    result.doId = admin.doReturnAdminToCtId;

    return result;
  }

  static async deliveryOrderCtCreate(
    payload: DoReturnDeliveryOrderCtCreateVm,
  ): Promise<ReturnUpdateFindAllResponseVm> {
    const result = new ReturnUpdateFindAllResponseVm();
    // const permissonPayload = AuthService.getPermissionTokenPayload();
    const authMeta = AuthService.getAuthData();
    const status = 'ok';
    const message = 'success';
    const timeNow = moment().toDate();
    // insert to DoReturnAdmintoCt
    const generateCode = await CustomCounterCode.doReturnToCollection(timeNow);
    const ctToCollection = DoReturnCtToCollection.create();

    ctToCollection.doReturnCtToCollection = generateCode;
    ctToCollection.countAwb = payload.countAwb;
    ctToCollection.userIdCreated = authMeta.userId;
    ctToCollection.userIdUpdated = authMeta.userId;
    ctToCollection.createdTime = timeNow;
    ctToCollection.updatedTime = timeNow;

    const admin = await DoReturnCtToCollection.save(ctToCollection);

    const doReturnMaster = await DoReturnMaster.findOne({
      where: {
        doReturnMasterCode : 9003,
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
          doReturnCtToCollectionId : ctToCollection.doReturnCtToCollectionId,
          userIdUpdated : authMeta.userId,
          updatedTime : timeNow,
        },
      );
    }
  }
    result.status = status;
    result.message = message;
    result.doId = admin.doReturnCtToCollectionId;

    return result;
  }

  static async deliveryOrderCustCreate(
    payload: DoReturnDeliveryOrderCustCreateVm,
  ): Promise<ReturnUpdateFindAllResponseVm> {
    const result = new ReturnUpdateFindAllResponseVm();
    // const permissonPayload = AuthService.getPermissionTokenPayload();
    const status = 'ok';
    const authMeta = AuthService.getAuthData();
    const message = 'success';
    const timeNow = moment().toDate();
    // insert to DoReturnAdmintoCt
    const generateCode = await CustomCounterCode.doReturnToCust(timeNow);
    const collectionToCust = DoReturnCollectionToCust.create();

    collectionToCust.doReturnCollectionToCust = generateCode;
    collectionToCust.countAwb = payload.countAwb;
    collectionToCust.userIdCreated = authMeta.userId;
    collectionToCust.userIdUpdated = authMeta.userId;
    collectionToCust.createdTime = timeNow;

    const admin = await DoReturnCollectionToCust.save(collectionToCust);

    const doReturnMaster = await DoReturnMaster.findOne({
      where: {
        doReturnMasterCode : 9005,
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
          doReturnCollectionToCustId : collectionToCust.doReturnCollectionToCustId,
          userIdUpdated : authMeta.userId,
          updatedTime : timeNow,
        },
      );
    }
  }
    result.status = status;
    result.message = message;
    result.doId = admin.doReturnCollectionToCustId;

    return result;
  }

  static async deliveryOrderCustReceivedCreate(
    payload: DoReturnDeliveryOrderCustReceivedCreateVm,
  ): Promise<ReturnUpdateFindAllResponseVm> {
    const result = new ReturnUpdateFindAllResponseVm();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const status = 'ok';
    const message = 'success';
    const timeNow = moment().toDate();
    const authMeta = AuthService.getAuthData();

    const doReturnMaster = await DoReturnMaster.findOne({
      where: {
        doReturnMasterCode : 9006,
      },
    });
    const returnAwb = await DoReturnAwb.find({
      where: {
        doReturnCollectionToCustId: payload.doReturnCollectionToCust,
      },
    });
  //  insert to do return awb history
    if (doReturnMaster) {
    for (const returnAwbId of payload.doReturnCollectionToCust) {
      const returnHist = DoReturnHistory.create();
      returnHist.userIdCreated = authMeta.userId;
      returnHist.userIdUpdated = authMeta.userId;
      returnHist.createdTime = timeNow;
      returnHist.doReturnMasterId =  doReturnMaster.doReturnMasterId;
      returnHist.doReturnAwbId = returnAwbId;
      const history = await DoReturnHistory.save(returnHist);

      const historyId = history.doReturnHistoryId;

      if (returnAwb) {
    // Update do return awb
        await DoReturnAwb.update(
          returnAwbId, {
            doReturnHistoryIdLast : historyId,
            userIdUpdated : authMeta.userId,
            updatedTime : timeNow,
          },
        );
      }
    }
  }
    result.status = status;
    result.message = message;
    // result.doReturnCollectionToCustId = admin.doReturnCollectionToCustId;

    return result;
  }

}
