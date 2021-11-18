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
import { PartnerLogistic } from '../../../../shared/orm-entity/partner-logistic';
import { WebReturUpdateListPayloadVm } from '../../models/web-retur-update-response.vm';
import { WebReturUpdateResponseVm } from '../../models/web-retur-update-list-response.vm';
import { WebReturHistoryFindAllResponseVm } from '../../models/web-retur-history.response.vm';
import { WebReturHistoryPayloadVm } from '../../models/web-retur-history-payload.vm';
import { QueryBuilder, createQueryBuilder } from 'typeorm';
import {CsvHelper} from '../../../../shared/helpers/csv-helpers';

export class WebAwbReturnService {
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
      WebAwbReturnService.strReplaceFunc(d.awbStatus),
      d.createdTime ?  moment(d.createdTime).format('YYYY-MM-DD') : '-',
      WebAwbReturnService.strReplaceFunc(d.branchManifest),
      WebAwbReturnService.strReplaceFunc(d.branchFrom),
      WebAwbReturnService.strReplaceFunc(d.branchTo),
      // WebAwbReturnService.strReplaceFunc(d.partnerName),
      d.returnAwbNumber ? WebAwbReturnService.strReplaceFunc(`'${d.returnAwbNumber}`) : '-',
      d.userIdDriver ? 'Manual' : (d.isPartnerLogistic ? d.partnerLogisticName : 'Internal'),
      WebAwbReturnService.strReplaceFunc(d.consignerName),
    ];
    return `${values.join(',')} \n`;
  }

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

    const awb = await Awb.findOne({
      where: {
        awbId: payload.awbId,
        isDeleted: false,
      },
    });
    if (awb) {
      // TODO: check data awb return
      const hasAwbReturn = await AwbReturn.findOne({
        where: {
          originAwbId: payload.awbId,
          isDeleted: false,
        },
      });
      if (hasAwbReturn) {
        result.status = 'error';
        result.awbReturnNumber = hasAwbReturn.returnAwbNumber;
        result.message = `No Resi ${payload.awbNumber} sudah pernah di retur`;
      } else {
        const awbReturnNumber = await CustomCounterCode.awbReturn();
        let finalAwbNumber = awbReturnNumber;
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
        awb.userIdLast = authMeta.userId;
        awb.branchIdLast = permissonPayload.branchId;
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
            // item.isReturn = true;
            // item.partnerLogisticAwb = null; // payload
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
              userId: item.userIdLast,
              branchId: item.branchIdLast,
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
          let isPartnerLogistic = false;
          let partnerLogisticName = '';

          // check partner logistic
          if (payload.partnerLogisticId != '') {
            isPartnerLogistic = true;
            const partnerLogistic = await PartnerLogistic.findOne({
              where: {
                partnerLogisticId: payload.partnerLogisticId,
                isDeleted: false,
              },
            });
            if (partnerLogistic) {
              partnerLogisticName = partnerLogistic.partnerLogisticName;
              finalAwbNumber = payload.awbNumber;
            }
          }

          const awbReturn = AwbReturn.create({
            originAwbId: payload.awbId,
            originAwbNumber: payload.awbNumber,
            returnAwbId: awb.awbId,
            returnAwbNumber: awbReturnNumber,
            isPartnerLogistic,
            branchId: permissonPayload.branchId,
            userIdCreated: authMeta.userId,
            createdTime: timeNow,
            userIdUpdated: authMeta.userId,
            updatedTime: timeNow,
            partnerLogisticName,
          });

          // insert data awb return
          AwbReturn.insert(awbReturn);

        }

        result.status = 'ok';
        result.awbReturnNumber = finalAwbNumber;
        result.message = `No Resi Retur ${awbReturnNumber}`;
      }

    } else {
      result.status = 'error';
      result.awbReturnNumber = '';
      result.message = `No Resi ${payload.awbNumber} tidak ditemukan`;
    }
    return result;
  }

  static async updateAwbReturn(
    payload: WebReturUpdateListPayloadVm,
  ): Promise<WebReturUpdateResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new WebReturUpdateResponseVm();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const awb = await AwbService.validAwbNumber(payload.awbReturnNumber);

    if(!payload.partnerLogisticId && !payload.userIdDriver && !awb){
      result.status = 'error';
      result.message = `No resi ${payload.awbReturnNumber} tidak ditemukan`;
      return result;
    }

    const awbReturn = await AwbReturn.findOne({
      where: {
        awbReturnId: payload.awbReturnId,
        isDeleted: false,
      },
    });

    if (payload.partnerLogisticId === '') {
      if (payload.userIdDriver) {
        AwbReturn.update(awbReturn.awbReturnId, {
          returnAwbId : awb.awbId,
          returnAwbNumber: payload.awbReturnNumber,
          userIdUpdated: authMeta.userId,
          updatedTime: moment().toDate(),
          userIdDriver: payload.userIdDriver,
          branchId: permissonPayload.branchId,
          awbReplacementTime: moment().toDate(),
        });
      } else {
        AwbReturn.update(awbReturn.awbReturnId, {
          returnAwbId : awb.awbId,
          returnAwbNumber: payload.awbReturnNumber,
          userIdUpdated: authMeta.userId,
          updatedTime: moment().toDate(),
          branchId: permissonPayload.branchId,
          awbReplacementTime: moment().toDate(),
        });
      }

      result.status = 'ok';
      result.message = 'success';
      // }
    } else {
      const partnerLogistic = await PartnerLogistic.findOne({ partnerLogisticId: payload.partnerLogisticId });
      if (partnerLogistic) {
        AwbReturn.update(awbReturn.awbReturnId, {
          partnerLogisticId: payload.partnerLogisticId,
          returnAwbNumber: payload.awbReturnNumber,
          partnerLogisticName: partnerLogistic.partnerLogisticName,
          isPartnerLogistic: true,
          partnerLogisticAwb: payload.awbReturnNumber,
          userIdUpdated: authMeta.userId,
          updatedTime: moment().toDate(),
          branchId: permissonPayload.branchId,
        });
        result.status = 'ok';
        result.message = 'success';
      } else {
        result.status = 'error';
        result.message = '3PL tidak ditemukan';
      }
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
    payload.fieldResolverMap['partnerName'] = 't5.partner_name';
    payload.fieldResolverMap['partnerId'] = 't5.partner_id';
    payload.fieldResolverMap['branchIdFrom'] = 't6.branch_id';
    payload.fieldResolverMap['branchFrom'] = 't6.branch_name';
    payload.fieldResolverMap['consignerName'] = 't7.ref_prev_customer_account_id';
    payload.fieldResolverMap['userUpdatedName'] = '"userUpdatedName"';
    payload.fieldResolverMap['replacementAwbStatusLast'] = '"replacementAwbStatusLast"';

    if (payload.sortBy === '') {
      payload.sortBy = 'updatedTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'originAwbNumber',
      },
    ];

    const repo = new OrionRepositoryService(AwbReturn, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.awb_return_id', 'awbReturnId'],
      ['t1.origin_awb_id', 'originAwbId'],
      ['t1.partner_logistic_awb', 'partnerLogisticAwb'],
      ['t1.origin_awb_number', 'originAwbNumber'],
      ['t1.return_awb_id', 'returnAwbId'],
      ['t1.is_partner_logistic', 'isPartnerLogistic'],
      ['t1.partner_logistic_name', 'partnerLogisticName'],
      ['t1.partner_logistic_id', 'partnerLogisticId'],
      ['t1.return_awb_number', 'returnAwbNumber'],
      ['t1.branch_id', 'branchIdTo'],
      ['t1.created_time', 'createdTime'],
      ['t1.updated_time', 'updatedTime'],
      ['t1.awb_replacement_time', 'awbReplacementTime'],
      ['t3.branch_name', 'branchTo'],
      ['t2.awb_status_name', 'awbStatus'],
      ['t2.awb_status_id', 'awbStatusId'],
      ['t4.branch_id', 'branchIdManifest'],
      ['t4.branch_name', 'branchManifest'],
      ['t5.partner_id', 'partnerId'],
      ['t5.partner_name', 'partnerName'],
      ['t1.user_id_driver', 'userIdDriver'],
      ['t6.branch_id', 'branchIdFrom'],
      ['t6.branch_name', 'branchFrom'],
      [
        `COALESCE(t7.ref_prev_customer_account_id, t7.ref_customer_account_id,'')`,
        'consignerName',
      ],
      [`CONCAT(CAST(t7.total_cod_value AS NUMERIC(20,2)))`, 'totalCodValue'],
      [`CONCAT(t8.nik, ' - ', t8.fullname)`, 'userUpdatedName'],
      ['t9.awb_status_id', 'replacementAwbStatusLast'],
      ['t9.awb_status_name', 'replacementAwbStatusName'],
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
    q.leftJoin(e => e.originAwb.awb.partner, 't5', j =>
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

    // q.andWhere(e => e.originAwb.awbStatus.isReturn, w => w.isTrue());

    const data = await q.exec();
    const total = 0; // await q.countWithoutTakeAndSkip();

    const result = new WebReturListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async listReturnCount(
    payload: BaseMetaPayloadVm,
  ): Promise<WebReturListResponseVm> {
    // mapping field
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
    payload.fieldResolverMap['partnerName'] = 't5.partner_name';
    payload.fieldResolverMap['partnerId'] = 't5.partner_id';
    payload.fieldResolverMap['branchIdFrom'] = 't6.branch_id';
    payload.fieldResolverMap['branchFrom'] = 't6.branch_name';
    payload.fieldResolverMap['consignerName'] = 't7.ref_prev_customer_account_id';
    payload.fieldResolverMap['userUpdatedName'] = '"userUpdatedName"';
    payload.fieldResolverMap['replacementAwbStatusLast'] = '"replacementAwbStatusLast"';

    if (payload.sortBy === '') {
      payload.sortBy = 'updatedTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'originAwbNumber',
      },
    ];

    const repo = new OrionRepositoryService(AwbReturn, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.awb_return_id', 'awbReturnId'],
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
    q.leftJoin(e => e.originAwb.awb.partner, 't5', j =>
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

    // q.andWhere(e => e.originAwb.awbStatus.isReturn, w => w.isTrue());

    // const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebReturListResponseVm();

    result.data = null;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async historyAwbReturn(
    payload: WebReturHistoryPayloadVm,
  ): Promise<WebReturHistoryFindAllResponseVm> {
    const result = new WebReturHistoryFindAllResponseVm();
    if (payload.isManual) {
      result.data = (await this.historyAwbManualReturn(payload)).data;
    } else {
      const repo = new OrionRepositoryService(AwbReturn, 't1');
      const q = repo.findAllRaw();
      q.selectRaw(
        ['t2.do_pod_date_time', 'doPodDateTime'],
        ['t2.do_pod_code', 'doPodCode'],
        ['t2.do_pod_id', 'doPodId'],
        ['t2.branch_id_to', 'branchIdTo'],
        ['t3.branch_name', 'branchNameTo'],
        [`CONCAT(t4.nik, ' - ', t4.fullname)`, 'driverName'],
      );
      q.innerJoin(e => e.doPodDetail.doPod, 't2', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q.innerJoin(e => e.doPodDetail.doPod.branchTo, 't3', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q.innerJoin(e => e.doPodDetail.doPod.userDriver.employee, 't4', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.andWhere(e => e.returnAwbNumber, w => w.equals(payload.awbNumber));
      q.andWhere(e => e.isDeleted, w => w.isFalse());
      const data = await q.exec();
      result.data = data;
    }

    return result;
  }

  private static async historyAwbManualReturn(
    payload: WebReturHistoryPayloadVm,
  ): Promise<WebReturHistoryFindAllResponseVm> {
    const repo = new OrionRepositoryService(AwbReturn, 't1');
    const q = repo.findAllRaw();

    q.selectRaw(
      ['t1.awb_return_id', 'awbReturnId'],
      ['t1.return_awb_number', 'returnAwbNumber'],
      ['t1.created_time', 'createdTime'],
      ['t2.employee_id', 'userDriverId'],
      ['t2.nik', 'driverNik'],
      [`CONCAT(t2.nik, ' - ', t2.fullname)`, 'driverName'],
    );

    q.innerJoin(e => e.userDriver.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.returnAwbNumber, w => w.equals(payload.awbNumber));
    const data = await q.exec();

    const result = new WebReturHistoryFindAllResponseVm();
    result.data = data;
    return result;
  }

  static async exportReturnList(payload: BaseMetaPayloadVm, response) {
    try {
      const fileName = `POD_return_list${new Date().getTime()}.csv`;

      response.setHeader(
        'Content-disposition',
        `attachment; filename=${fileName}`,
      );
      // response.writeHead(200, { 'Content-Type': 'text/csv' });
      // response.flushHeaders();
      // response.write(`${this.ExportHeaderReturnList.join(',')}\n`);

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
      payload.fieldResolverMap['partnerName'] = 't5.partner_name';
      payload.fieldResolverMap['partnerId'] = 't5.partner_id';
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
        ['t1.awb_return_id', 'awbReturnId'],
        ['t1.origin_awb_id', 'originAwbId'],
        ['t1.partner_logistic_awb', 'partnerLogisticAwb'],
        ['t1.origin_awb_number', 'originAwbNumber'],
        ['t1.return_awb_id', 'returnAwbId'],
        ['t1.is_partner_logistic', 'isPartnerLogistic'],
        ['t1.partner_logistic_name', 'partnerLogisticName'],
        ['t1.partner_logistic_id', 'partnerLogisticId'],
        ['t1.return_awb_number', 'returnAwbNumber'],
        ['t1.branch_id', 'branchIdTo'],
        ['t1.created_time', 'createdTime'],
        ['t1.updated_time', 'updatedTime'],
        ['t1.awb_replacement_time', 'awbReplacementTime'],
        ['t3.branch_name', 'branchTo'],
        ['t2.awb_status_name', 'awbStatus'],
        ['t2.awb_status_id', 'awbStatusId'],
        ['t4.branch_id', 'branchIdManifest'],
        ['t4.branch_name', 'branchManifest'],
        ['t5.partner_id', 'partnerId'],
        ['t5.partner_name', 'partnerName'],
        ['t1.user_id_driver', 'userIdDriver'],
        ['t6.branch_id', 'branchIdFrom'],
        ['t6.branch_name', 'branchFrom'],
        [
          `COALESCE(t7.ref_prev_customer_account_id, t7.ref_customer_account_id,'')`,
          'consignerName',
        ],
        [`CONCAT(CAST(t7.total_cod_value AS NUMERIC(20,2)))`, 'totalCodValue'],
        [`CONCAT(t8.nik, ' - ', t8.fullname)`, 'userUpdatedName'],
        ['t9.awb_status_id', 'replacementAwbStatusLast'],
        ['t9.awb_status_name', 'replacementAwbStatusName'],
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
      q.leftJoin(e => e.originAwb.awb.partner, 't5', j =>
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

      // q.andWhere(e => e.originAwb.awbStatus.isReturn, w => w.isTrue());
      // await q.stream(response, this.streamTransformReturList);
      let data =  await q.exec();
      await CsvHelper.generateCSV(response, data, fileName);
    } catch (err) {
      throw err;
    }
  }
}
