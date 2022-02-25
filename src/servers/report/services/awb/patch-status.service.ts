import { AwbPatchStatusPayloadVm, AwbPatchStatusSuccessResponseVm } from '../../models/awb/awb-patch-status.vm';
import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import { AwbStatus } from '../../../../shared/orm-entity/awb-status';
import { User } from '../../../../shared/orm-entity/user';
import { AwbPatchDataSuccessResponseVm } from '../../models/awb/awb-patch-data.vm';
import { BadRequestException } from '@nestjs/common';
import { Awb } from '../../../../shared/orm-entity/awb';
import { camelCase, mapKeys } from 'lodash';
import moment = require('moment');

export class AwbPatchStatusService {
  constructor() {}

  static async patchDataDlv(payload: AwbPatchStatusPayloadVm): Promise<AwbPatchStatusSuccessResponseVm> {
    // get status DLV
    const awbStatus = await AwbStatus.findOne(
      {
        awbStatusId:
          AWB_STATUS.DLV,
      },
      { cache: true },
    );
    const errorMsg = [];
    let totalSuccess = 0;
    for (const awb of payload.data) {
      let message = null;
      if (awb.length == 12) {
        const awbPod = await DoPodDeliverDetail.findOne({
          awbNumber: awb,
          awbStatusIdLast: AWB_STATUS.DLV,
          isDeleted: false,
        });
        if (awbPod) {
          // get data employee
          const userDriver = await User.findOne(
            {
              userId: awbPod.userIdUpdated,
              isDeleted: false,
            },
            { cache: true },
          );

          const awbAttr = await AwbItemAttr.findOne({
            awbNumber: awb,
            awbStatusIdLast: AWB_STATUS.ANT,
            isDeleted: false,
          });

          // status still ANT insert data awb history DLV
          if (awbAttr && userDriver) {
            // NOTE: queue by Bull
            DoPodDetailPostMetaQueueService.createJobV1MobileSync(
              awbPod.awbItemId,
              awbPod.awbStatusIdLast,
              awbPod.userIdUpdated,
              awbAttr.branchIdLast,
              awbPod.userIdUpdated,
              userDriver.employeeId,
              awbPod.reasonIdLast,
              awbPod.descLast,
              awbPod.consigneeName,
              awbStatus.awbStatusName,
              awbStatus.awbStatusTitle,
              awbPod.awbStatusDateTimeLast,
              awbPod.latitudeDeliveryLast,
              awbPod.longitudeDeliveryLast,
            );
            totalSuccess += 1;
          } else {
            message = `Status Resi ${awb} bukan Antar`;
          }
        } else {
          message = `Surat Jalan Resi ${awb} tidak valid`;
        }
      } else {
        message = `panjang resi ${awb} tidak valid`;
      }

      if (message) {
        errorMsg.push(message);
      }
    }

    const result = new AwbPatchStatusSuccessResponseVm();
    result.errors = errorMsg;
    result.message = `Update Status Success ${totalSuccess} Resi`;
    result.status = 200;
    return result;
  }

  static async patchDataTable(payload: any): Promise<AwbPatchDataSuccessResponseVm> {
    // validation table has retention
    const validTable = ['awb', 'awb_item_attr'];
    if (!payload.table && !validTable.includes(payload.table)) {
      throw new BadRequestException('Nama Table tidak valid!, [awb, awb_item_attr]');
    }
    if (!payload.data || payload.data.length == 0 || payload.data.length > 100) {
      throw new BadRequestException('Data tidak valid!');
    }

    let response = { errorMsg: null, totalSuccess: 0 };

    // switch table
    switch (payload.table) {
      case 'awb':
        response = await this.patchAwb(payload.data);
        break;

      case 'awb_item_attr':
        response = await this.patchAwbItemAttr(payload.data);
        break;

      default:
        break;
    }

    const result = new AwbPatchDataSuccessResponseVm();
    result.errors = response.errorMsg;
    result.message = `Success Insert ${response.totalSuccess} Resi`;
    result.status = 200;
    return result;
  }

  private static async patchAwb(data: any): Promise<any> {
    const errorMsg = [];
    let totalSuccess = 0;
    const timeNow = moment().toDate();
    try {
      for (const item of data) {
        let message = null;
        // transform to camelcase
        const newItem = mapKeys(item, function(value, key) {
          return camelCase(key);
        });

        // process
        const awb = Awb.create(newItem);
        // force timestamp
        awb.createdTime = timeNow;
        awb.updatedTime = timeNow;

        // must have PK
        if (awb.awbId) {
          const exist = await Awb.findOne({awbId: awb.awbId}, {select: ['awbId']});
          if (!exist) {
            await Awb.insert(awb);
            totalSuccess += 1;
          } else {
            message = 'Data awb sudah ada!';
          }
        } else {
          message = 'Data awb tidak valid, mesti ada PK!';
        }

        if (message) {
          errorMsg.push(message);
        }
      } // end of for
      return { errorMsg, totalSuccess };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private static async patchAwbItemAttr(data: any): Promise<any> {
    const errorMsg = [];
    let totalSuccess = 0;
    const timeNow = moment().toDate();
    try {
      for (const item of data) {
        let message = null;
        // transform to camelcase
        const newItem = mapKeys(item, function(value, key) {
          return camelCase(key);
        });

        // process
        const awb = AwbItemAttr.create(newItem);
        // force timestamp
        awb.createdTime = timeNow;
        awb.updatedTime = timeNow;

        // must have PK
        if (awb.awbItemAttrId) {
          const exist = await AwbItemAttr.findOne(
            { awbItemAttrId: awb.awbItemAttrId },
            { select: ['awbItemAttrId'] },
          );
          if (!exist) {
            await AwbItemAttr.insert(awb);
            totalSuccess += 1;
          } else {
            message = 'Data awb sudah ada!';
          }
        } else {
          message = 'Data awb tidak valid, mesti ada PK!';
        }

        if (message) {
          errorMsg.push(message);
        }
      } // end of for
      return { errorMsg, totalSuccess };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

}
