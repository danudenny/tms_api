import { Awb } from '../../../../shared/orm-entity/awb';
import { AwbItem } from '../../../../shared/orm-entity/awb-item';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { Branch } from '../../../../shared/orm-entity/branch';
import { District } from '../../../../shared/orm-entity/district';
import { PodFilterDetailItem } from '../../../../shared/orm-entity/pod-filter-detail-item';
import { AuthService } from '../../../../shared/services/auth.service';
import {
    DoPodDetailPostMetaQueueService,
} from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import {
    AwbUpdateDestinationPayloadVm, AwbUpdateDestinationResponseVm, AwbUpdateStatusPayloadVm,
    AwbUpdateStatusResponseVm, ScanInputNumberVm,
} from '../../models/awb-update-status.vm';
import { AwbService } from '../v1/awb.service';
import { BagService } from '../v1/bag.service';

export class WebAwbUpdateStatusService {

  static async updateStatus(
    payload: AwbUpdateStatusPayloadVm,
  ): Promise<AwbUpdateStatusResponseVm> {

    let totalSuccessAwb = 0;
    let totalSuccessBag = 0;
    let totalError = 0;
    const data: ScanInputNumberVm[] = [];

    for (const inputNumber of payload.inputNumber) {
      const dataItem = await this.handleTypeNumber(
        inputNumber,
        payload.awbStatusId,
      );
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

  static async updateDestination(
    payload: AwbUpdateDestinationPayloadVm,
  ): Promise<AwbUpdateDestinationResponseVm> {
    let status = 'error';
    let message = 'data tidak ditemukan!';
    // find data district by code
    const district = await District.findOne({
      cache: true,
      where: {
        districtCode: payload.districtCode,
        isDeleted: false,
      },
    });
    if (district) {
      // TODO: validate district include on representative ??
      const branch = await Branch.findAndCount({
        where: {
          representativeId: payload.representativeId,
          districtId: district.districtId,
          isDeleted: false,
        },
      });

      if (branch) {
        // find and update data to_id pod filter detail item
        const podFilterDetailItem = await PodFilterDetailItem.findOne({
          where: {
            podFilterDetailItemId: payload.podFilterDetailItemId,
            isDeleted: false,
          },
        });

        if (podFilterDetailItem) {
          PodFilterDetailItem.update(podFilterDetailItem.podFilterDetailItemId, {
            toId: district.districtId,
          });
          // find awb item by awb item id
          const awbItem = await AwbItem.findOne({
            select: ['awbItemId', 'awbId'],
            where: {
              awbItemId: payload.awbItemId,
              isDeleted: false,
            },
          });
          if (awbItem) {
            // TODO: and update data to_id awb
            const awb = await Awb.update(awbItem.awbId, {
              toId: district.districtId,
            });

            // TODO: awb trouble ??
            // podFilterDetailItem.awbTroubleId;

            status = 'ok';
            message = 'success';
          }
        }
      } else {
        message = 'Kode Kecamatan tidak ditemukan di perwakilan ini';
      }
    } else {
      message = 'Kode Kecamatan tidak ditemukan';
    }

    const result = new AwbUpdateDestinationResponseVm();
    result.status = status;
    result.message = message;
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

    const awb = await AwbService.validAwbNumber(awbNumber);
    if (awb) {
      const statusCode = await AwbService.awbStatusGroup(
        awb.awbStatusIdLast,
      );

      if (
        statusCode == 'IN' &&
        awb.branchIdLast == permissonPayload.branchId
      ) {
        // update awb item attr
        await AwbService.updateAwbAttr(
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

    const bagData = await BagService.validBagNumber(bagNumber);

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
              await AwbService.updateAwbAttr(
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

  private static async handleTypeNumber(
    inputNumber: string,
    awbStatusId: number,
  ): Promise<ScanInputNumberVm> {

    const regexNumber = /^[0-9]+$/;
    inputNumber = inputNumber.trim();
    if (inputNumber.length == 12 && regexNumber.test(inputNumber)) {
      // awb number
      return await this.updateAwbStatus(inputNumber, awbStatusId);
    } else if (
      inputNumber.length == 10 &&
      regexNumber.test(inputNumber.substring(7, 10))) {
      // bag number
      return await this.updateAwbStatusByBag(inputNumber, awbStatusId);
    } else {
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
