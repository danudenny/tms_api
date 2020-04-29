import { AuthService } from '../../../../../shared/services/auth.service';
import { BagItem } from '../../../../../shared/orm-entity/bag-item';
import { DoPodDetail } from '../../../../../shared/orm-entity/do-pod-detail';
import { RedisService } from '../../../../../shared/services/redis.service';
import moment = require('moment');
import { TransferBagNumberHubVm } from '../../../models/web-scan-out.vm';
import { WebHubScanOutBagResponseVm } from '../../../models/web-scan-out-response.vm';
import { BagService } from '../../v1/bag.service';
import { DoPodDetailBag } from '../../../../../shared/orm-entity/do-pod-detail-bag';
import { getConnection } from 'typeorm';
import { BAG_STATUS } from '../../../../../shared/constants/bag-status.constant';

export class HubTransitDeliveryService {

  /**
   * Reassign Bag in HUB
   * @param {WebScanInBagVm} payload
   * @param {boolean} isHub
   * @returns {Promise<WebScanInBagResponseVm>}
   * @memberof WebDeliveryInService
   */
  static async transferBagNumber(
    payload: TransferBagNumberHubVm,
  ): Promise<WebHubScanOutBagResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebHubScanOutBagResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    for (const bagNumber of payload.bagNumber) {
      const response = {
        status: 'ok',
        message: 'Success',
      };
      const bagData = await BagService.validBagNumber(bagNumber);
      if (bagData) {
        // TODO:
        // Update data DoPodDetailBag flag is_deleted where status ??
        const holdRedis = await RedisService.locking(
          `hold:bagtransfer:${bagData.bagItemId}`,
          'locking',
        );
        if (holdRedis) {
          const doPodBag = await DoPodDetailBag.findOne({
            where: {
              bagId: bagData.bagId,
              bagItemId: bagData.bagItemId,
              transactionStatusIdLast: 300,
              isDeleted: false,
            },
          });
          if (doPodBag) {
            // TODO: update counter bag on DoPod
            await DoPodDetailBag.update({ doPodDetailBagId: doPodBag.doPodDetailBagId }, {
              isDeleted: true,
              updatedTime: timeNow,
              userIdUpdated: authMeta.userId,
            });

            // Update do pod details
            await getConnection()
              .createQueryBuilder()
              .update(DoPodDetail)
              .set({
                isDeleted: true,
                updatedTime: timeNow,
                userIdUpdated: authMeta.userId,
              })
              .where(
                'bag_id = :bagId AND bag_item_id = :bagItemId',
                {
                  bagId: bagData.bagId,
                  bagItemId: bagData.bagItemId,
                },
              )
              .execute();

            // update status bag on bag item
            await BagItem.update(bagData.bagItemId, {
              bagItemStatusIdLast: BAG_STATUS.IN_HUB,
              branchIdLast: permissonPayload.branchId,
              branchIdNext: null,
              updatedTime: timeNow,
              userIdUpdated: authMeta.userId,
            });
            // TODO: Update Status awb on bag(In Branch) ??

            totalSuccess += 1;
          } else {
            totalError += 1;
            response.status = 'error';
            response.message = `Gabung paket ${bagNumber} belum dibuatkan Surat Jalan`;
          }
        }

        // remove key holdRedis
        RedisService.del(`hold:bagtransfer:${bagData.bagItemId}`);
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `Gabung paket ${bagNumber} Tidak di Temukan`;
      }

      // push item
      dataItem.push({
        bagNumber,
        ...response,
      });
    } // end of loop

    // Populate return value
    result.totalData = payload.bagNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;
    return result;
  }
}
