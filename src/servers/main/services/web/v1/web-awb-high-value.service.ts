import { BadRequestException } from '@nestjs/common';

import xlsx = require('xlsx');
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { AwbHighValueUploadListResponseVm, AwbHighValueUploadResponseVm } from '../../../models/last-mile/awb-high-value.vm';
import { getManager } from 'typeorm';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { MetaService } from '../../../../../shared/services/meta.service';
import { AwbHighValueUpload } from '../../../../../shared/orm-entity/awb-high-value-upload';
import { AuthService } from '../../../../../shared/services/auth.service';
import moment = require('moment');
import { PickupRequestDetail } from '../../../../../shared/orm-entity/pickup-request-detail';

export class V1WebAwbHighValueService {
  static ExportHeaderUploadResi = [
    'Tanggal Upload',
    'Tanggal Status',
    'Nomor Resi',
    'Nama Partner',
    'Nama Penerima',
    'Telp Penerima',
    'Isi Parsel',
    'Status Awb',
    'Kode Kecamatan',
    'Gerai Tujuan',
    'Gerai Asal',
    'Tipe Layanan'
  ];

  static streamTransform(doc) {
    // param = doc.awbNumber
    const values = [
      doc.uploadedDate ? moment(doc.uploadedDate).format('YYYY-MMM-DD') : '-',
      doc.awbHistoryDateLast ? moment(doc.awbHistoryDateLast).format('YYYY-MMM-DD') : '-',
      `'${doc.awbNumber}`,
      V1WebAwbHighValueService.strReplaceFunc(doc.partnerName),
      V1WebAwbHighValueService.strReplaceFunc(doc.recipientName),
      `'${doc.recipientPhone}`,
      V1WebAwbHighValueService.strReplaceFunc(doc.parcelContent),
      V1WebAwbHighValueService.strReplaceFunc(doc.awbStatusName),
      V1WebAwbHighValueService.strReplaceFunc(doc.districtCode),
      V1WebAwbHighValueService.strReplaceFunc(doc.branchName),
      V1WebAwbHighValueService.strReplaceFunc(doc.branchFromName),
      V1WebAwbHighValueService.strReplaceFunc(doc.packageType),
    ];
    return `${values.join(',')} \n`;
  }

  static strReplaceFunc = str => {
    return str
      ? str
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/;/g, '|')
        .replace(/,/g, '.')
      : null;
  }

  static async uploadAwb(file): Promise<AwbHighValueUploadResponseVm> {
    const authMeta = AuthService.getAuthData();

    let totalValid = 0;
    const notValid = [];
    if (file) {
      const workbook: any = xlsx.read(file.buffer);

      const xlData: Array<{ awbNumber }> = xlsx.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
      );

      if (!xlData[0].awbNumber) {
        throw new BadRequestException(
          'field awbNumber tidak ditemukan!',
        );
      }

      const uniqueData = [...new Set(xlData.map(p => p.awbNumber))];

      for (const item of uniqueData) {
        let awbNumber = item.toString().replace(/[^a-zA-Z0-9]/g, '');
        awbNumber = awbNumber.padStart(12, '0');

        const awb = await AwbItemAttr.findOne({
          select: ['awbNumber', 'awbItemId', 'isHighValue'],
          where: {
            awbNumber,
            isDeleted: false,
          },
        });

        if (awb) {
          // TODO: find table awb for validate data
          // update flag isHighValue (new field)
          // after success insert to table awbHighValue
          if (awb.isHighValue == true) {
            notValid.push(`Data ${item} sudah diproses!`);
          } else {
            try {
              await getManager().transaction(async transactionManager => {
                await transactionManager.update(
                  AwbItemAttr,
                  {
                    awbItemId: awb.awbItemId,
                    isDeleted: false,
                  },
                  {
                    isHighValue: true,
                  },
                );
                // NOTE: insert table awbHighValueUpload
                await transactionManager.insert(
                  AwbHighValueUpload,
                  {
                    awbItemId: awb.awbItemId,
                    awbNumber: awb.awbNumber,
                    displayName: authMeta.displayName,
                    userIdUploaded: authMeta.userId,
                    uploadedTime: moment().toDate(),
                  },
                );

                totalValid += 1;
              });
            } catch (error) {
              console.error(error);
              notValid.push(`Server error, coba lagi!`);
            }
          }
        } else {
          notValid.push(`Data ${item} tidak ditemukan!`);
        }
      }

      // construct response
      const result = new AwbHighValueUploadResponseVm();
      result.notValid = notValid;
      result.totalValid = totalValid;
      result.totalNotValid = notValid.length;
      return result;
    } else {
      throw new BadRequestException('file mandatory!');
    }
  }

  static async uploadAwbList(payload: BaseMetaPayloadVm): Promise<AwbHighValueUploadListResponseVm> {
    // mapping field
    payload.fieldResolverMap['partnerId'] = 't3.partner_id';
    payload.fieldResolverMap['uploadedDate'] = 't1.uploaded_time';
    payload.fieldResolverMap['displayName'] = 't1.display_name';
    payload.fieldResolverMap['partnerName'] = 't4.partner_name';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'awbNumber',
      },
    ];

    const repo = new OrionRepositoryService(AwbHighValueUpload, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.awb_number', 'awbNumber'],
      ['t4.partner_name', 'partnerName'],
      ['t2.recipient_name', 'recipientName'],
      ['t2.recipient_phone', 'recipientPhone'],
      ['t2.parcel_content', 'parcelContent'],
      ['true', 'isUpload'],
      ['t1.display_name', 'displayName'],
      ['t1.uploaded_time', 'uploadedDate'],
    );
    q.innerJoin(e => e.pickupRequestDetail, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest.partner, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    //
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhere(e => e.userIdUploaded, w => w.notEquals(1));

    const data = await q.exec();
    const total = 0; // await q.countWithoutTakeAndSkip();

    const result = new AwbHighValueUploadListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async uploadAwbCount(payload: BaseMetaPayloadVm): Promise<AwbHighValueUploadListResponseVm> {
    // mapping field
    // payload.fieldResolverMap['isUpload'] = 't1.is_high_value';
    payload.fieldResolverMap['partnerId'] = 't3.partner_id';
    payload.fieldResolverMap['uploadedDate'] = 't1.uploaded_time';
    payload.fieldResolverMap['displayName'] = 't1.display_name';
    payload.fieldResolverMap['partnerName'] = 't4.partner_name';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'awbNumber',
      },
    ];

    const repo = new OrionRepositoryService(AwbHighValueUpload, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.awb_number', 'awbNumber'],
      ['t4.partner_name', 'partnerName'],
      ['t2.recipient_name', 'recipientName'],
      ['t2.recipient_phone', 'recipientPhone'],
      ['t2.parcel_content', 'parcelContent'],
      ['true', 'isUpload'],
      ['t1.display_name', 'displayName'],
      ['t1.uploaded_time', 'uploadedDate'],
    );
    q.innerJoin(e => e.pickupRequestDetail, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest.partner, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    //
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    // const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new AwbHighValueUploadListResponseVm();
    result.data = null;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async ApiAwbList(payload: BaseMetaPayloadVm): Promise<AwbHighValueUploadListResponseVm> {
    // mapping field
    // payload.fieldResolverMap['isUpload'] = 't1.is_high_value';
    payload.fieldResolverMap['partnerId'] = 't3.partner_id';
    payload.fieldResolverMap['uploadedDate'] = 't1.uploaded_time';
    payload.fieldResolverMap['displayName'] = 't1.display_name';
    payload.fieldResolverMap['partnerName'] = 't4.partner_name';
    payload.fieldResolverMap['branchName'] = 't6.branch_name';
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['branchId'] = 't6.branch_id';
    payload.fieldResolverMap['branchFromId'] = 't8.branch_id';
    payload.fieldResolverMap['branchFromName'] = 't8.branch_name';
    payload.fieldResolverMap['awbHistoryDateLast'] = 't5.awb_history_date_last';
    payload.fieldResolverMap['packageTypeId'] = 't10.package_type_id';
    payload.fieldResolverMap['packageTypeName'] = 't10.package_type_name';
    payload.fieldResolverMap['packageTypeCode'] = 't10.package_type_code';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'awbNumber',
      },
    ];
    const repo = new OrionRepositoryService(AwbHighValueUpload, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.awb_number', 'awbNumber'],
      ['t4.partner_name', 'partnerName'],
      ['t2.recipient_name', 'recipientName'],
      ['t2.recipient_phone', 'recipientPhone'],
      ['t2.parcel_content', 'parcelContent'],
      ['false', 'isUpload'],
      ['t1.display_name', 'displayName'],
      ['t1.uploaded_time', 'uploadedDate'],
      ['t6.branch_name', 'branchName'],
      ['t7.awb_status_name', 'awbStatusName'],
      ['t5.awb_history_date_last', 'awbHistoryDateLast'],
      ['t9.district_code', 'districtCode'],
      ['t8.branch_name', 'branchFromName'],
      ['t10.package_type_code', 'packageTypeCode'],
      ['t10.package_type_name', 'packageTypeName'],
      [`CASE WHEN t10.package_type_code = 'PREM' THEN 'Gold' ELSE 'Berharga' END`, 'packageType'],
    );
    q.innerJoin(e => e.pickupRequestDetail, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest.partner, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbItemAttr, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbItemAttr.branchLast, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbItemAttr.awbStatus, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbItemAttr.awb.branch, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbItemAttr.awb.branch.district, 't9', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbItemAttr.awb.packageType, 't10', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhere(e => e.userIdUploaded, w => w.equals(1));

    const data = await q.exec();
    const total = 0; // await q.countWithoutTakeAndSkip();

    const result = new AwbHighValueUploadListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async ApiAwbListCount(payload: BaseMetaPayloadVm): Promise<AwbHighValueUploadListResponseVm> {
    // mapping field
    // payload.fieldResolverMap['isUpload'] = 't1.is_high_value';
    payload.fieldResolverMap['partnerId'] = 't3.partner_id';
    payload.fieldResolverMap['uploadedDate'] = 't1.uploaded_time';
    payload.fieldResolverMap['displayName'] = 't1.display_name';
    payload.fieldResolverMap['partnerName'] = 't4.partner_name';
    payload.fieldResolverMap['branchName'] = 't5.branch_name';
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['branchId'] = 't6.branch_id';
    payload.fieldResolverMap['branchFromId'] = 't8.branch_id';
    payload.fieldResolverMap['branchFromName'] = 't8.branch_name';
    payload.fieldResolverMap['awbHistoryDateLast'] = 't5.awb_history_date_last';
    payload.fieldResolverMap['packageTypeId'] = 't10.package_type_id';
    payload.fieldResolverMap['packageTypeName'] = 't10.package_type_name';
    payload.fieldResolverMap['packageTypeCode'] = 't10.package_type_code';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'awbNumber',
      },
    ];

    const repo = new OrionRepositoryService(AwbHighValueUpload, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      ['t1.awb_number', 'awbNumber'],
    );
    q.innerJoin(e => e.pickupRequestDetail, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest.partner, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbItemAttr, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbItemAttr.branchLast, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbItemAttr.awbStatus, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbItemAttr.awb.branch, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbItemAttr.awb.branch.district, 't9', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbItemAttr.awb.packageType, 't10', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhere(e => e.userIdUploaded, w => w.equals(1));

    const total = await q.countWithoutTakeAndSkip();

    const result = new AwbHighValueUploadListResponseVm();
    result.data = null;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async export(payload: BaseMetaPayloadVm, response) {
    try {
      const fileName = `POD_upload_resi_barang_berharga${new Date().getTime()}.csv`;

      response.setHeader(
        'Content-disposition',
        `attachment; filename=${fileName}`,
      );
      response.writeHead(200, { 'Content-Type': 'text/csv' });
      response.flushHeaders();
      response.write(`${this.ExportHeaderUploadResi.join(',')}\n`);

      payload.fieldResolverMap['partnerId'] = 't3.partner_id';
      payload.fieldResolverMap['uploadedDate'] = 't1.uploaded_time';
      payload.fieldResolverMap['displayName'] = 't1.display_name';
      payload.fieldResolverMap['partnerName'] = 't4.partner_name';
      payload.fieldResolverMap['branchName'] = 't5.branch_name';
      payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
      payload.fieldResolverMap['branchId'] = 't6.branch_id';
      payload.fieldResolverMap['branchFromId'] = 't8.branch_id';
      payload.fieldResolverMap['branchFromName'] = 't8.branch_name';
      payload.fieldResolverMap['awbHistoryDateLast'] = 't5.awb_history_date_last';
      payload.fieldResolverMap['packageTypeId'] = 't10.package_type_id';
      payload.fieldResolverMap['packageTypeName'] = 't10.package_type_name';
      payload.fieldResolverMap['packageTypeCode'] = 't10.package_type_code';

      payload.globalSearchFields = [
        {
          field: 'awbNumber',
        },
      ];

      const repo = new OrionRepositoryService(AwbHighValueUpload, 't1');
      const q = repo.findAllRaw();

      payload.applyToOrionRepositoryQuery(q);

      q.selectRaw(
        ['t1.awb_number', 'awbNumber'],
        ['t4.partner_name', 'partnerName'],
        ['t2.recipient_name', 'recipientName'],
        ['t2.recipient_phone', 'recipientPhone'],
        ['t2.parcel_content', 'parcelContent'],
        ['false', 'isUpload'],
        ['t1.display_name', 'displayName'],
        ['t1.uploaded_time', 'uploadedDate'],
        ['t6.branch_name', 'branchName'],
        ['t7.awb_status_name', 'awbStatusName'],
        ['t5.awb_history_date_last', 'awbHistoryDateLast'],
        ['t9.district_code', 'districtCode'],
        ['t8.branch_name', 'branchFromName'],
        ['t10.package_type_code', 'packageTypeCode'],
        ['t10.package_type_name', 'packageTypeName'],
        [`CASE WHEN t10.package_type_code = 'PREM' THEN 'Gold' ELSE 'Berharga' END`, 'packageType'],
      );
      q.innerJoin(e => e.pickupRequestDetail, 't2', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.innerJoin(e => e.pickupRequestDetail.pickupRequest, 't3', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.innerJoin(e => e.pickupRequestDetail.pickupRequest.partner, 't4', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.innerJoin(e => e.awbItemAttr, 't5', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.leftJoin(e => e.awbItemAttr.branchLast, 't6', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.innerJoin(e => e.awbItemAttr.awbStatus, 't7', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.leftJoin(e => e.awbItemAttr.awb.branch, 't8', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.leftJoin(e => e.awbItemAttr.awb.branch.district, 't9', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.leftJoin(e => e.awbItemAttr.awb.packageType, 't10', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.andWhere(e => e.isDeleted, w => w.isFalse());
      q.andWhere(e => e.userIdUploaded, w => w.equals(1));

      await q.stream(response, this.streamTransform);

    } catch (err) {
      throw err;
    }
  }
}
