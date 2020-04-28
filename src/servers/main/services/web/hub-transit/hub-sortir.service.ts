import { AuthService } from '../../../../../shared/services/auth.service';
import { DoPodDetail } from '../../../../../shared/orm-entity/do-pod-detail';
import { RedisService } from '../../../../../shared/services/redis.service';
import moment = require('moment');
import { TransferAwbNumberHubVm } from '../../../models/web-scan-out.vm';
import { WebHubScanOutAwbResponseVm } from '../../../models/web-scan-out-response.vm';
import { AwbService } from '../../v1/awb.service';
import { getConnection } from 'typeorm';
import {AWB_STATUS} from '../../../../../shared/constants/awb-status.constant';
import {AwbItemAttr} from '../../../../../shared/orm-entity/awb-item-attr';

export class HubSortirService {

  /**
   * Reassign Awb in HUB
   * @param {TransferAwbNumberHubVm} payload
   * @returns {Promise<WebHubScanOutAwbResponseVm>}
   * @memberof HubSortirService
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

    for (const awbNumber of payload.awbNumber) {
      const response = {
        status: 'ok',
        message: 'Success',
      };
      const awbData = await AwbService.validAwbNumber(awbNumber);
      if (awbData) {
        // TODO:
        // Update data DoPodDetail flag is_deleted where status ??
        const holdRedis = await RedisService.locking(
          `hold:scanout:${awbData.awbItemId}`,
          'locking',
        );
        if (holdRedis) {
          const doPodDetail = await DoPodDetail.findOne({
            where: {
              awbId: awbData.awbId,
              awbItemId: awbData.awbItemId,
              transactionStatusIdLast: 300,
              isDeleted: false,
            },
          });
          if (doPodDetail) {
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
                'awb_id = :awbId AND awb_item_id = :awbItemId',
                {
                  awbId: awbData.awbId,
                  awbItemId: awbData.awbItemId,
                },
              )
              .execute();

            // update status awb on awb item
            await AwbItemAttr.update(awbData.awbItemAttrId, {
              awbStatusIdLast: AWB_STATUS.IN_HUB,
              updatedTime: timeNow,
            });

            totalSuccess += 1;
          } else {
            totalError += 1;
            response.status = 'error';
            response.message = `Nomor resi ${awbNumber} belum dibuatkan Surat Jalan`;
          }

          // remove key holdRedis
          RedisService.del(`hold:scanout:${awbData.awbItemId}`);
        } else {
          totalError += 1;
          response.status = 'error';
          response.message = `Nomor resi ${awbNumber} Tidak di Temukan`;
        }

      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `Nomor resi ${awbNumber} Tidak di Temukan`;
      }

      // push item
      dataItem.push({
        awbNumber,
        ...response,
      });
    } // end of loop

    // Populate return value
    result.totalData = payload.awbNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;
    return result;
  }
}
