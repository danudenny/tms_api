import { Logger } from '@nestjs/common';
import { AuthService } from '../../../../shared/services/auth.service';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { AwbService } from './awb.service';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { DropoffHubDetail } from '../../../../shared/orm-entity/dropoff_hub_detail';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import { DoPodDetail } from '../../../../shared/orm-entity/do-pod-detail';
import { AwbItem } from '../../../../shared/orm-entity/awb-item';
import { SharedService } from '../../../../shared/services/shared.service';

export class BagService {

  static async validBagNumber(bagNumberSeq: string): Promise<BagItem> {
    const regexNumber = /^[0-9]+$/;
    if (regexNumber.test(bagNumberSeq.substring(7, 10))) {
      const bagNumber: string = bagNumberSeq.substring(0, 7);
      const seqNumber: number = Number(bagNumberSeq.substring(7, 10));
      const bagRepository = new OrionRepositoryService(BagItem);
      const q = bagRepository.findOne();
      // Manage relation (default inner join)
      q.innerJoin(e => e.bag, null, join => join.andWhere(e => e.isDeleted, w => w.isFalse()));

      q.select({
        bagItemId: true,
        bagItemStatusIdLast: true,
        branchIdLast: true,
        branchIdNext: true,
        bagSeq: true,
        bagId: true,
        bag: {
          representativeIdTo: true,
          refRepresentativeCode: true,
          bagId: true,
          bagNumber: true,
        },
        weight: true,
      });
      q.where(e => e.bag.bagNumber, w => w.equals(bagNumber));
      q.andWhere(e => e.bagSeq, w => w.equals(seqNumber));
      q.andWhere(e => e.isDeleted, w => w.isFalse());
      q.take(1);
      return await q.exec();
    } else {
      return null;
    }
  }

  static async getBagNumber(bagItemId: number): Promise<BagItem> {

    const bagRepository = new OrionRepositoryService(BagItem);
    const q = bagRepository.findOne();
    // Manage relation (default inner join)
    q.innerJoin(e => e.bag, null, join => join.andWhere(e => e.isDeleted, w => w.isFalse()));

    q.select({
      bagItemId: true,
      bagItemStatusIdLast: true,
      branchIdLast: true,
      branchIdNext: true,
      bagSeq: true,
      bagId: true,
      bag: {
        representativeIdTo: true,
        refRepresentativeCode: true,
        bagId: true,
        bagNumber: true,
      },
      weight: true,
    });
    q.where(e => e.bagItemId, w => w.equals(bagItemId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.take(1);
    return await q.exec();
  }

  // TODO: to be removed
  // scan dropoff_hub update status awb
  static async statusDropoffAwbBag(
    bagItemId: number,
    dropoffHubId: string,
  ): Promise<boolean> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const bagItemsAwb = await BagItemAwb.find({
      where: {
          bagItemId,
          isDeleted: false,
      },
    });

    if (bagItemsAwb && bagItemsAwb.length > 0) {
      for (const itemAwb of bagItemsAwb) {

        if (itemAwb.awbItemId) {
          // create dropoffDetail
          // =============================================================
          // find awb where awb_item_id
          const awbItem = await AwbItem.findOne({
            where: {
              awbItemId: itemAwb.awbItemId,
              isDeleted: false,
            },
          });

          if (awbItem) {
            const dropoffDetail = DropoffHubDetail.create();
            dropoffDetail.dropoffHubId = dropoffHubId;
            dropoffDetail.branchId = permissonPayload.branchId;
            dropoffDetail.awbId = awbItem.awbId;
            dropoffDetail.awbItemId = itemAwb.awbItemId;
            dropoffDetail.awbNumber = itemAwb.awbNumber;
            await DropoffHubDetail.save(dropoffDetail);

            // TODO: check awb status for auto check out ??
            // NOTE: queue by Bull
            // add awb history with background process
            DoPodDetailPostMetaQueueService.createJobByDropoffBag(
              itemAwb.awbItemId,
              permissonPayload.branchId,
              authMeta.userId,
            );
          } else {
            Logger.log('### Data Awb Item :: Not Found!!');
          }
        }
      } // end of loop
    } else {
      Logger.log('### Data Bag Item Awb :: Not Found!!');
    }
    return true;
  }

  // NOTE: ONLY ON UPDATE
  // NOT USED NOW ???
  static async statusOutBranchAwbBag(
    bagId: number,
    bagItemId: number,
    doPodId: string,
    branchIdNext: number,
    userIdDriver: number,
    doPodType: number,
    bagNumber: string,
  ) {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const bagItemsAwb = await BagItemAwb.find({
      where: {
        bagItemId,
        isDeleted: false,
      },
    });
    if (bagItemsAwb && bagItemsAwb.length) {
      let employeeIdDriver = null;
      let employeeNameDriver = '';
      let additionMinutes = 0;
      const userDriverRepo = await SharedService.getDataUserEmployee(userIdDriver);
      if (userDriverRepo) {
        employeeIdDriver = userDriverRepo.employeeId;
        employeeNameDriver = userDriverRepo.employee.employeeName;
      }
      let branchName = 'Kantor Pusat';
      let branchNameNext = 'Pluit';
      let cityName = 'Jakarta';
      const branch = await SharedService.getDataBranchCity(permissonPayload.branchId);
      if (branch) {
        branchName = branch.branchName;
        cityName = branch.district ? branch.district.city.cityName : '';
      }
      // branch next
      const branchNext = await SharedService.getDataBranchCity(branchIdNext);
      if (branchNext) {
        branchNameNext = branchNext.branchName;
      }
      for (const itemAwb of bagItemsAwb) {
        if (itemAwb.awbItemId) {
          const doPodDetail = DoPodDetail.create();
          doPodDetail.doPodId = doPodId;
          doPodDetail.awbItemId = itemAwb.awbItemId;
          doPodDetail.awbNumber = itemAwb.awbNumber;
          doPodDetail.bagNumber = bagNumber;
          doPodDetail.bagId = bagId;
          doPodDetail.bagItemId = bagItemId;
          doPodDetail.isScanOut = true;
          doPodDetail.scanOutType = 'bag';
          // Branch
          if (doPodType == 3005) {
            doPodDetail.transactionStatusIdLast = 800;
          } else {
            doPodDetail.transactionStatusIdLast = 300;
          }
          await DoPodDetail.save(doPodDetail);

          // NOTE: update status on awb item attr
          // last awb status
          if ((doPodType == 3020) || (doPodType == 3010)) {
            // HUB
            // TODO: if isTransit auto IN
            if (doPodType == 3020) {
              // queue bull IN HUB
              DoPodDetailPostMetaQueueService.createJobByAwbFilter(
                itemAwb.awbItemId,
                permissonPayload.branchId,
                authMeta.userId,
              );
              additionMinutes = 1;
            }

            // queue bull OUT HUB
            DoPodDetailPostMetaQueueService.createJobByScanOutBag(
              itemAwb.awbItemId,
              permissonPayload.branchId,
              authMeta.userId,
              employeeIdDriver,
              employeeNameDriver,
              AWB_STATUS.OUT_HUB,
              branchName,
              cityName,
              branchIdNext,
              branchNameNext,
              additionMinutes,
            );
          } else {
            // BRANCH
            // queue bull
            DoPodDetailPostMetaQueueService.createJobByScanOutBag(
              itemAwb.awbItemId,
              permissonPayload.branchId,
              authMeta.userId,
              employeeIdDriver,
              employeeNameDriver,
              AWB_STATUS.OUT_BRANCH,
              branchName,
              cityName,
              branchIdNext,
              branchNameNext,
            );
          }
        }
      }
    } else {
      Logger.log('### Data Bag Item Awb :: Not Found!!');
    }
    return true;
  }

  // NOTE: ONLY ON UPDATE
  // NOT USED NOW ???
  static async statusInAwbBag(
    doPodId: string,
    bagItemId: number,
    doPodType: number,
  ) {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const bagItemsAwb = await BagItemAwb.find({
      where: {
        bagItemId,
        isDeleted: false,
      },
    });
    if (bagItemsAwb && bagItemsAwb.length) {
      for (const itemAwb of bagItemsAwb) {
        if (itemAwb.awbItemId) {
          const doPodDetail = await DoPodDetail.findOne({
            where: {
              doPodId,
              awbItemId: itemAwb.awbItemId,
              isDeleted: false,
            },
          });
          if (doPodDetail) {
            DoPodDetail.update(doPodDetail.doPodDetailId, {
              isDeleted: true,
            });
            const awbStatus =
              doPodType == 3005
                ? AWB_STATUS.IN_BRANCH
                : AWB_STATUS.IN_HUB;

            // queue bull
            DoPodDetailPostMetaQueueService.createJobByAwbUpdateStatus(
              itemAwb.awbItemId,
              awbStatus,
              permissonPayload.branchId,
              authMeta.userId,
            );
          }
        }
      } // end of loop
    } else {
      Logger.log('### Data Bag Item Awb :: Not Found!!');
    }
    return true;
  }

  static async findOneBySealNumber(sealNumber: string): Promise<BagItem> {
    const regexNumber = /^[0-9]+$/;
    if (sealNumber.length === 7 && regexNumber.test(sealNumber)) {
      const bagRepository = new OrionRepositoryService(BagItem);
      const q = bagRepository.findAll();
      // Manage relation (default inner join)
      q.innerJoin(e => e.bag, null, join => join.andWhere(e => e.isDeleted, w => w.isFalse()));

      q.select({
        bagItemId: true,
        bagItemStatusIdLast: true,
        branchIdLast: true,
        branchIdNext: true,
        bagSeq: true,
        bagId: true,
        bag: {
          representativeIdTo: true,
          refRepresentativeCode: true,
          bagId: true,
          bagNumber: true,
          sealNumber: true, 
        },
        weight: true,
      });
      q.where(e => e.bag.sealNumber, w => w.equals(sealNumber));
      q.andWhere(e => e.isDeleted, w => w.isFalse());
      q.orderBy({bagId : 'ASC'});
      q.take(1);
      const bagDatas = await q.exec();
      if (bagDatas && bagDatas.length > 0) {
        return bagDatas[0];
      }
    } else {
      return null;
    }

  }
}
