import { AwbPatchStatusPayloadVm, AwbPatchStatusSuccessResponseVm } from '../../models/awb/awb-patch-status.vm';
import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import { AwbStatus } from '../../../../shared/orm-entity/awb-status';
import { User } from '../../../../shared/orm-entity/user';

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

}
