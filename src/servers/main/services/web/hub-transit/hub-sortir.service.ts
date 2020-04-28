import { AuthService } from '../../../../../shared/services/auth.service';
import { BagItem } from '../../../../../shared/orm-entity/bag-item';
import { DoPodDetail } from '../../../../../shared/orm-entity/do-pod-detail';
import { RedisService } from '../../../../../shared/services/redis.service';
import moment = require('moment');
import { TransferAwbNumberHubVm } from '../../../models/web-scan-out.vm';
import { WebHubScanOutAwbResponseVm } from '../../../models/web-scan-out-response.vm';
import { BagService } from '../../v1/bag.service';
import { AwbService } from '../../v1/awb.service';
import { DoPodDetailBag } from '../../../../../shared/orm-entity/do-pod-detail-bag';
import { getConnection } from 'typeorm';
import { BAG_STATUS } from '../../../../../shared/constants/bag-status.constant';

export class HubSortirService {

  /**
   * Reassign Bag in HUB
   * @param {WebScanInBagVm} payload
   * @param {boolean} isHub
   * @returns {Promise<WebScanInBagResponseVm>}
   * @memberof WebDeliveryInService
   */
  static async hubAwbNumber(
    payload: TransferAwbNumberHubVm,
  ): Promise<WebHubScanOutAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebHubScanOutAwbResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    console.log(payload);
    console.log("--------");


    for (const awbNumber of payload.awbNumber) {
        const response = {
                status: 'ok',
                message: 'Success',
              };

        const awbData = await AwbService.validAwbNumber(awbNumber);
        // tslint:disable-next-line:no-console
        console.log(awbData);

        if (awbData) {
            const holdRedis = await RedisService.locking(
            `hold:scanout-transfer:${awbData.awbItemId}`,
            'locking',
            );
        } else {
            totalError += 1;
            response.status = 'error';
            response.message = `Gabung paket ${awbNumber} belum dibuatkan Surat Jalan`;
        }

            //   // push item
      dataItem.push({
        awbNumber,
        ...response,
      });
    }

    // for (const awbNumber of payload.awbNumber) {
    //   const response = {
    //     status: 'ok',
    //     message: 'Success',
    //   };
    // //   const awbData = await BagService.validawbNumber(awbNumber);
    //   const awbData = await AwbService.validAwbNumber(awbNumber);
    //   console.log(awbData);
      
    // //   if (awbData) {
    // //     // TODO:
    // //     // Update data DoPodDetailBag flag is_deleted where status ??
    // //     const holdRedis = await RedisService.locking(
    // //       `hold:bagtransfer:${awbData.bagItemId}`,
    // //       'locking',
    // //     );
    // //     if (holdRedis) {
    // //       const doPodBag = await DoPodDetailBag.findOne({
    // //         where: {
    // //           bagId: awbData.bagId,
    // //           bagItemId: awbData.bagItemId,
    // //           transactionStatusIdLast: 300,
    // //           isDeleted: false,
    // //         },
    // //       });
    // //       if (doPodBag) {
    // //         // TODO: update counter bag on DoPod
    // //         await DoPodDetailBag.update({ doPodDetailBagId: doPodBag.doPodDetailBagId }, {
    // //           isDeleted: true,
    // //           updatedTime: timeNow,
    // //           userIdUpdated: authMeta.userId,
    // //         });

    // //         // Update do pod details
    // //         await getConnection()
    // //           .createQueryBuilder()
    // //           .update(DoPodDetail)
    // //           .set({
    // //             isDeleted: true,
    // //             updatedTime: timeNow,
    // //             userIdUpdated: authMeta.userId,
    // //           })
    // //           .where(
    // //             'bag_id = :bagId AND bag_item_id = :bagItemId',
    // //             {
    // //               bagId: awbData.bagId,
    // //               bagItemId: awbData.bagItemId,
    // //             },
    // //           )
    // //           .execute();

    // //         // update status bag on bag item
    // //         await BagItem.update(awbData.bagItemId, {
    // //           bagItemStatusIdLast: BAG_STATUS.IN_HUB,
    // //           branchIdLast: permissonPayload.branchId,
    // //           branchIdNext: null,
    // //           updatedTime: timeNow,
    // //           userIdUpdated: authMeta.userId,
    // //         });
    // //         // TODO: Update Status awb on bag(In Branch) ??

    // //         totalSuccess += 1;
    // //       } else {
    // //         totalError += 1;
    // //         response.status = 'error';
    // //         response.message = `Gabung paket ${awbNumber} belum dibuatkan Surat Jalan`;
    // //       }
    // //     }

    // //     // remove key holdRedis
    // //     RedisService.del(`hold:bagtransfer:${awbData.bagItemId}`);
    // //   } else {
    // //     totalError += 1;
    // //     response.status = 'error';
    // //     response.message = `Gabung paket ${awbNumber} Tidak di Temukan`;
    // //   }
    // } // end of loop

    // Populate return value
    result.totalData = payload.awbNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;
    return result;
  }
}
