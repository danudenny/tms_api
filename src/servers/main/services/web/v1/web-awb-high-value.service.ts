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

export class V1WebAwbHighValueService {

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
      ['t2.parcel_value', 'parcelValue'],
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
      ['t2.parcel_value', 'parcelValue'],
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

}
