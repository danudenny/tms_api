import { WebAwbReturnGetAwbPayloadVm, WebAwbReturnGetAwbResponseVm, WebAwbReturnCreatePayload, WebAwbReturnCreateResponse } from '../../models/web-awb-return.vm';
import { AwbService } from '../v1/awb.service';
import { CustomerAddress } from '../../../../shared/orm-entity/customer-address';
import { Awb } from '../../../../shared/orm-entity/awb';
import { WebReturListResponseVm } from '../../models/web-retur-list-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AwbReturn } from '../../../../shared/orm-entity/awb-return';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import { AwbItem } from '../../../../shared/orm-entity/awb-item';
import { AttachmentService } from '../../../../shared/services/attachment.service';
import { AwbHistory } from '../../../../shared/orm-entity/awb-history';

export class WebAwbReturnService {
  static async getAwb(
    payload: WebAwbReturnGetAwbPayloadVm,
  ): Promise<WebAwbReturnGetAwbResponseVm> {
    const address = [];
    const result = new WebAwbReturnGetAwbResponseVm();
    const awb = await AwbService.getDataPickupRequest(payload.awbNumber);
    if (awb) {
      if (awb.workOrderId) {
        address.push(awb.consigneeAddress);
      } else {
        // find customer address
        const customerAddress = await CustomerAddress.find({
          where: {
            customerAccountId: awb.customerAccountId,
            isDeleted: false,
          },
        });
        if (customerAddress) {
          customerAddress.map(x => address.push(x.address));
        }
      }

      result.awbId = awb.awbId;
      result.awbNumber = awb.awbNumber;
      result.consigneeName = awb.consigneeName;
      result.consigneeAddress = address;
      result.consigneeZipCode = awb.consigneeZip;
      result.customerAccountId = awb.customerAccountId;
      result.provinceId = awb.provinceId;
      result.provinceCode = awb.provinceCode;
      result.provinceName = awb.provinceName;
      result.cityId = awb.cityId;
      result.cityCode = awb.cityCode;
      result.cityName = awb.cityName;
      result.districtId = awb.districtId;
      result.districtCode = awb.districtCode;
      result.districtName = awb.districtName;
    }
    return result;
  }

  static async createAwbReturn(payload: WebAwbReturnCreatePayload): Promise<WebAwbReturnCreateResponse> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const result = new WebAwbReturnCreateResponse();
    const timeNow = moment().toDate();
    // TODO: create table awb
    const awb = await Awb.findOne({
      where: {
        awbId: payload.awbId,
        isDeleted: false,
      },
    });
    if (awb) {
      const awbReturnNumber = await CustomCounterCode.awbReturn();
      // set data return
      awb.awbId = null;
      awb.awbBookingId = 0;
      awb.customerAccountId = null;
      awb.consigneeTitle = null;
      awb.awbNumber = awbReturnNumber;
      awb.awbCode = awbReturnNumber;
      awb.refAwbNumber = awbReturnNumber;
      awb.awbDate = moment().startOf('day').toDate();
      awb.awbDateReal = timeNow;
      awb.consigneeName = payload.consigneeName;
      awb.consigneeAddress = payload.consigneeAddress;
      awb.consigneeNumber = payload.consigneePhone;
      awb.consigneeZip = payload.consigneeZipCode;
      awb.consigneeDistrict = payload.consigneeDistrict.label;
      awb.packageTypeId = 1; // default REG
      awb.userId = authMeta.userId;
      awb.branchId = permissonPayload.branchId;
      awb.fromType = 40; // code for district
      awb.fromId = permissonPayload.branchId;
      awb.toType = 40; // code for district
      awb.toId = payload.consigneeDistrict.value; // payload district Id

      awb.awbHistoryIdLast = null;
      awb.awbStatusIdLast = null;
      awb.awbStatusIdLastPublic = null;
      awb.userIdLast = null;
      awb.branchIdLast = null;
      awb.historyDateLast = null;
      awb.pickupMerchant = null;
      awb.refAwbNumberJne = null;
      awb.isJne = false;

      awb.createdTime = timeNow;
      awb.updatedTime = timeNow;
      awb.userIdCreated = 1;
      awb.userIdUpdated = 1;
      await Awb.insert(awb);
      // create table awb attr ??

      if (payload.base64Image) {
        const pathImage = `RTN/${awbReturnNumber.substring(0, 7)}/${awbReturnNumber}`;
        const attachment = await AttachmentService.uploadFileBase64(
          payload.base64Image,
          'RTN',
          pathImage,
          false,
        );
        // NOTE: attachment tms image ??
        if (attachment) {
          console.log(attachment);
        }
      }

      // TODO: move to background jobs
      // create table awb item
      const awbItems = await AwbItem.find({
        where: {
          awbId: payload.awbId,
          isDeleted: false,
        },
      });
      if (awbItems && awbItems.length) {
        const awbReturnItems = [];
        // loop data
        for (const item of awbItems) {
          // set data awb item
          item.awbItemId = null;
          item.awbId = awb.awbId;
          item.bagItemIdLast = 0;
          item.doAwbIdDelivery = null;
          item.doAwbIdPickup = null;
          item.attachmentTmsId = null;
          item.packingTypeId = 1; // what this ??
          item.awbStatusIdLast = 1500;
          item.awbStatusIdFinal = 2000;
          item.userIdLast = awb.userIdLast; // user login
          item.branchIdLast = awb.branchIdLast; // branch id login
          item.historyDateLast = null;
          item.tryAttempt = 0;
          item.awbDate = awb.awbDate;
          item.awbDateReal = awb.awbDateReal;
          item.awbHistoryIdLast = null;
          item.userIdCreated = awb.userIdCreated; // user id login
          item.userIdUpdated = awb.userIdUpdated; // user id login
          item.createdTime = timeNow;
          item.updatedTime = timeNow;

          // NOTE: new field
          item.isReturn = true;
          item.partnerLogisticAwb = null; // payload
          // item.awbType = ??
          awbReturnItems.push(item);
        }
        // insert data on awb item
        await AwbItem.insert(awbReturnItems);

        // create table awb history;
        const awbReturnHistories = [];
        // loop data
        for (const item of awbReturnItems) {
          const tempHistory = AwbHistory.create({
            awbItemId: item.awbItemId,
            userId: item.userId,
            branchId: item.branchId,
            historyDate: timeNow,
            awbStatusId: 1500,
            awbNote: payload.description,
            createdTime: timeNow,
            updatedTime: timeNow,
            userIdCreated: item.userIdCreated,
            userIdUpdated: item.userIdUpdated,
            isScanSingle: true,
            isDirectionBack: true,
          });
          awbReturnHistories.push(tempHistory);
        }
        // insert data on awb history
        await AwbHistory.insert(awbReturnHistories);

        // create table awb item attr ??
        // create table awb return;
      }

      result.status = 'ok';
      result.message = `No Resi Retur ${awbReturnNumber}`;
    } else {
      result.status = 'error';
      result.message = `No Resi ${payload.awbNumber} tidak ditemukan`;
    }
    return result;
  }

  static async listReturn(
    payload: BaseMetaPayloadVm,
  ): Promise<WebReturListResponseVm> {
    // mapping field
    payload.fieldResolverMap['awbReturnId'] = 't1.awb_return_id';
    payload.fieldResolverMap['originAwbId'] = 't1.origin_awb_id';
    payload.fieldResolverMap['originAwbNumber'] = 't1.origin_awb_number';
    payload.fieldResolverMap['returnAwbId'] = 't1.return_awb_id';
    payload.fieldResolverMap['returnAwbNumber'] = 't1.return_awb_number';
    payload.fieldResolverMap['isPartnerLogistic'] = 't1.is_partner_logistic';
    payload.fieldResolverMap['partnerLogisticName'] = 't1.partner_logistic_name';
    payload.fieldResolverMap['branchId'] = 't1.branch_id';
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['consigneeAddress'] = 't2.consignee_address';
    payload.fieldResolverMap['refCustomerAccountId'] = 't2.ref_customer_account_id';
    payload.fieldResolverMap['notes'] = 't2.notes';

    const repo = new OrionRepositoryService(AwbReturn, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.awb_return_id', 'awbReturnId'],
      ['t1.origin_awb_id', 'originAwbId'],
      ['t1.origin_awb_number', 'originAwbNumber'],
      ['t1.return_awb_id', 'returnAwbId'],
      ['t1.is_partner_logistic', 'isPartnerLogistic'],
      ['t1.partner_logistic_name', 'partnerLogisticName'],
      ['t1.return_awb_number', 'returnAwbNumber'],
      ['t1.branch_id', 'branchId'],
      ['t1.created_time', 'createdTime'],
      ['t2.consignee_address', 'consigneeAddress'],
      ['t2.ref_customer_account_id', 'refCustomerAccountId'],
      ['t2.notes', 'notes'],
    );

    q.innerJoin(e => e.originAwb, 't2', j =>
    j.andWhere(e => e.isDeleted, w => w.isFalse()),
  );
    q.innerJoin(e => e.customer, 't3', j =>
    j.andWhere(e => e.isDeleted, w => w.isFalse()),
  );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebReturListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
