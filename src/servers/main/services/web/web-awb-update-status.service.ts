import { AwbUpdateStatusPayloadVm, AwbUpdateStatusResponseVm, ScanInputNumberVm } from '../../models/awb-update-status.vm';
import { DeliveryService } from '../../../../shared/services/delivery.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';

export class WebAwbUpdateStatusService {
  static async updateStatus(
    payload: AwbUpdateStatusPayloadVm,
  ): Promise<AwbUpdateStatusResponseVm> {

    let totalSuccessAwb = 0;
    let totalSuccessBag = 0;
    let totalError = 0;
    const data: ScanInputNumberVm[] = [];

    for (const inputNumber of payload.inputNumber) {
      const dataItem = await this.checkTypeNumber(inputNumber, payload.awbStatusId);
      if (dataItem.status == 'ok') {
        dataItem.isBag
          ? (totalSuccessBag += 1)
          : (totalSuccessAwb += 1);
      } else {
        totalError += 1;
      }
      data.push(dataItem);
    }

    const result = new AwbUpdateStatusResponseVm();
    result.totalData = payload.inputNumber.length;
    result.totalSuccessAwb = totalSuccessAwb;
    result.totalSuccessBag = totalSuccessBag;
    result.totalError = totalError;
    result.data = data;
    return result;
  }

  private static async updateAwbStatus(
    awbNumber: string,
    awbStatusId: number,
  ): Promise<ScanInputNumberVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const dataItem = new ScanInputNumberVm();

    dataItem.inputNumber = awbNumber;
    dataItem.status = 'ok';
    dataItem.message = 'Success';
    dataItem.trouble = false;
    dataItem.isBag = false;

    const awb = await DeliveryService.validAwbNumber(awbNumber);
    if (awb) {
      const statusCode = await DeliveryService.awbStatusGroup(
        awb.awbStatusIdLast,
      );

      if (
        statusCode == 'IN' &&
        awb.branchIdLast == permissonPayload.branchId
      ) {
        // update awb item attr
        await DeliveryService.updateAwbAttr(
          awb.awbItemId,
          null,
          awbStatusId,
        );

        // NOTE: queue by Bull
        DoPodDetailPostMetaQueueService.createJobByAwbUpdateStatus(
          awb.awbItemId,
          awbStatusId,
          permissonPayload.branchId,
          authMeta.userId,
        );
      } else {
        dataItem.status = 'error';
        dataItem.message =
          `Resi ${awbNumber} milik gerai, ` +
          `${awb.branchLast.branchCode} - ${awb.branchLast.branchName}.`;
      }
    } else {
      dataItem.status = 'error';
      dataItem.message = `Resi ${awbNumber} Tidak di Temukan`;
    }

    return dataItem;
  }

  private static async updateAwbStatusByBag(
    bagNumber: string,
    awbStatusId: number,
  ): Promise<ScanInputNumberVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const dataItem = new ScanInputNumberVm();

    dataItem.inputNumber = bagNumber;
    dataItem.status = 'ok';
    dataItem.message = 'Success';
    dataItem.trouble = false;
    dataItem.isBag = true;

    const bagData = await DeliveryService.validBagNumber(bagNumber);

    if (bagData) {

      if ((bagData.branchIdLast == permissonPayload.branchId) && (
            bagData.bagItemStatusIdLast == 2000 ||
            bagData.bagItemStatusIdLast == 500
      )) {
        // NOTE: Loop data bag_item_awb for update status awb
        const bagItemsAwb = await BagItemAwb.find({
          where: {
            bagItemId: bagData.bagItemId,
            isDeleted: false,
          },
        });
        if (bagItemsAwb && bagItemsAwb.length) {
          for (const itemAwb of bagItemsAwb) {
            if (itemAwb.awbItemId) {
              await DeliveryService.updateAwbAttr(
                itemAwb.awbItemId,
                null,
                awbStatusId,
              );
              // NOTE: queue by Bull
              DoPodDetailPostMetaQueueService.createJobByAwbUpdateStatus(
                itemAwb.awbItemId,
                awbStatusId,
                permissonPayload.branchId,
                authMeta.userId,
              );
            }
          }
        } else {
          dataItem.status = 'error';
          dataItem.message = `Data resi tidak ditemukan`;
        }
      } else {
        dataItem.status = 'error';
        dataItem.message = `Gabung paket belum scan in, mohon untuk melakukan scan in terlebih dahulu`;
      }
    } else {
      dataItem.status = 'error';
      dataItem.message = `Gabung paket ${bagNumber} Tidak di Temukan`;
    }

    return dataItem;
  }

  private static async checkTypeNumber(inputNumber: string, awbStatusId: number) {
    if (inputNumber.length == 12) {
      // NOTE: No Resi
      return await this.updateAwbStatus(inputNumber, awbStatusId);
    } else if (inputNumber.length == 10) {
      // NOTE: No Gabungan Paket
      return await this.updateAwbStatusByBag(inputNumber, awbStatusId);
    } else {
      // error message
      const dataItem = new ScanInputNumberVm();
      dataItem.inputNumber = inputNumber;
      dataItem.status = 'error';
      dataItem.message = 'Nomor tidak valid';
      dataItem.trouble = true;
      dataItem.isBag = false;
      return dataItem;
    }
  }
}
