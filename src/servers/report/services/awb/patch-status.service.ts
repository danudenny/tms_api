import { camelCase, mapKeys } from 'lodash';
import { getConnection } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { Awb } from '../../../../shared/orm-entity/awb';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { AwbStatus } from '../../../../shared/orm-entity/awb-status';
import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import { User } from '../../../../shared/orm-entity/user';
import {
    DoPodDetailPostMetaQueueService,
} from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import { AwbPatchDataSuccessResponseVm } from '../../models/awb/awb-patch-data.vm';
import {
    AwbPatchStatusPayloadVm, AwbPatchStatusSuccessResponseVm,
} from '../../models/awb/awb-patch-status.vm';
import moment = require('moment');
import { AwbItem } from '../../../../shared/orm-entity/awb-item';

// ref: https://orkhan.gitbook.io/typeorm/docs/insert-query-builder
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
    const validTable = ['awb', 'awb_item_attr', 'awb_item'];
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

      case 'awb_item':
        response = await this.patchAwbItem(payload.data);
        break;
        
      case 'awb_item_attr':
        response = await this.patchAwbItemAttr(payload.data);
        break;

      default:
        throw new BadRequestException('nama table tidak valid!');
    }

    const result = new AwbPatchDataSuccessResponseVm();
    result.errors = response.errorMsg;
    result.message = `Success Insert ${response.totalSuccess} Resi`;
    result.status = 200;
    return result;
  }

  private static async patchAwbItem(data: any): Promise<any> { 
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
        const awbItem = AwbItem.create(newItem);
        // force timestamp
        awbItem.createdTime = timeNow;
        awbItem.updatedTime = timeNow;

        // must have PK
        if (awbItem.awbItemId) {
          const exist = await AwbItem.findOne({awbItemId: awbItem.awbItemId}, {select: ['awbItemId']});
          if (!exist) {
            await getConnection()
              .createQueryBuilder()
              .insert()
              .into(AwbItem)
              .values(awbItem)
              .returning('')
              .execute();
            totalSuccess += 1;
          } else {
            message = 'Data awb item sudah ada!';
          }
        } else {
          message = 'Data awb item tidak valid, mesti ada PK!';
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
            await getConnection()
              .createQueryBuilder()
              .insert()
              .into(Awb)
              .values(awb)
              .returning('')
              .execute();
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
            await getConnection()
              .createQueryBuilder()
              .insert()
              .into(AwbItemAttr)
              .values(awb)
              .returning('')
              .execute();
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
