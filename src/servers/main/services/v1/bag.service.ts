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
import { User } from '../../../../shared/orm-entity/user';
import { Branch } from '../../../../shared/orm-entity/branch';

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
    });
    q.where(e => e.bagItemId, w => w.equals(bagItemId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.take(1);
    return await q.exec();
  }

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

            // await AwbService.updateAwbAttr(
            //   itemAwb.awbItemId,
            //   AWB_STATUS.DO_HUB,
            // );

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
      const userDriverRepo = await this.getDataUserEmployee(userIdDriver);
      if (userDriverRepo) {
        employeeIdDriver = userDriverRepo.employeeId;
        employeeNameDriver = userDriverRepo.employee.employeeName;
      }
      let branchName = 'Kantor Pusat';
      let cityName = 'Jakarta';
      const branch = await this.getDataBranchCity(permissonPayload.branchId);
      if (branch) {
        branchName = branch.branchName;
        cityName = branch.district.city.cityName;
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
            await AwbService.updateAwbAttr(
              itemAwb.awbItemId,
              AWB_STATUS.OUT_HUB,
              branchIdNext,
            );

            // TODO: if isTransit auto IN
            if (doPodType == 3020) {
              // queue bull IN HUB
              DoPodDetailPostMetaQueueService.createJobByAwbFilter(
                itemAwb.awbItemId,
                permissonPayload.branchId,
                authMeta.userId,
              );
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
            );
          } else {
            // BRANCH
            await AwbService.updateAwbAttr(
              itemAwb.awbItemId,
              AWB_STATUS.OUT_BRANCH,
              branchIdNext,
            );

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
            );
          }
        }
      }
    } else {
      Logger.log('### Data Bag Item Awb :: Not Found!!');
    }
    return true;
  }

  // TODO: create background job
  static async scanOutBagBranch(
    bagId: number,
    bagItemId: number,
    doPodId: string,
    branchIdNext: number,
    userIdDriver: number,
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
    // TODO: raw query select insert into
    // 1. insert table doPOdDetail ??
    // 2. update table awbItemAttr ??
    // 3. insert table AwbHistory ??
    if (bagItemsAwb && bagItemsAwb.length) {
      let employeeIdDriver = null;
      let employeeNameDriver = '';
      const userDriverRepo = await this.getDataUserEmployee(userIdDriver);
      if (userDriverRepo) {
        employeeIdDriver = userDriverRepo.employeeId;
        employeeNameDriver = userDriverRepo.employee.employeeName;
      }
      let branchName = 'Kantor Pusat';
      let cityName = 'Jakarta';
      const branch = await this.getDataBranchCity(permissonPayload.branchId);
      if (branch) {
        branchName = branch.branchName;
        cityName = branch.district.city.cityName;
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
          doPodDetail.transactionStatusIdLast = 800; // OUT_BRANCH
          await DoPodDetail.save(doPodDetail);

          // NOTE: update status on awb item attr
          // last awb status OUT_BRANCH
          await AwbService.updateAwbAttr(
            itemAwb.awbItemId,
            AWB_STATUS.OUT_BRANCH,
            branchIdNext,
          );

          // NOTE: queue bull
          DoPodDetailPostMetaQueueService.createJobByScanOutBag(
            itemAwb.awbItemId,
            permissonPayload.branchId,
            authMeta.userId,
            employeeIdDriver,
            employeeNameDriver,
            AWB_STATUS.OUT_BRANCH,
            branchName,
            cityName,
          );
        }
      }
    } else {
      Logger.log('### Data Bag Item Awb :: Not Found!!');
    }
    return true;
  }

  // NOTE: not used now ==================================
  // TODO: create background job
  static async scanOutBagHub(
    bagId: number,
    bagItemId: number,
    doPodId: string,
    branchIdNext: number,
    userIdDriver: number,
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
    // TODO: raw query select insert into
    // 1. insert table doPOdDetail ??
    // 2. update table awbItemAttr ??
    // 3. insert table AwbHistory ??
    if (bagItemsAwb && bagItemsAwb.length) {
      let employeeIdDriver = null;
      let employeeNameDriver = '';
      const userDriverRepo = await this.getDataUserEmployee(userIdDriver);
      if (userDriverRepo) {
        employeeIdDriver = userDriverRepo.employeeId;
        employeeNameDriver = userDriverRepo.employee.employeeName;
      }
      let branchName = 'Kantor Pusat';
      let cityName = 'Jakarta';
      const branch = await this.getDataBranchCity(permissonPayload.branchId);
      if (branch) {
        branchName = branch.branchName;
        cityName = branch.district.city.cityName;
      }
      for (const itemAwb of bagItemsAwb) {
        if (itemAwb.awbItemId) {
          const doPodDetail = DoPodDetail.create();
          doPodDetail.doPodId = doPodId;
          doPodDetail.awbItemId = itemAwb.awbItemId;
          doPodDetail.awbNumber = itemAwb.awbNumber;
          // doPodDetail.bagNumber = bagNumber
          doPodDetail.bagId = bagId;
          doPodDetail.bagItemId = bagItemId;
          doPodDetail.isScanOut = true;
          doPodDetail.scanOutType = 'bag';
          doPodDetail.transactionStatusIdLast = 300; // OUT_HUB
          await DoPodDetail.save(doPodDetail);

          // NOTE: update status on awb item attr
          // last awb status
          // HUB
          await AwbService.updateAwbAttr(
            itemAwb.awbItemId,
            AWB_STATUS.OUT_HUB,
            branchIdNext,
          );

          // TODO: if isTransit auto IN
          if (doPodType == 3020) {
            // queue bull IN HUB
            DoPodDetailPostMetaQueueService.createJobByAwbFilter(
              itemAwb.awbItemId,
              permissonPayload.branchId,
              authMeta.userId,
            );
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
          );
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

            await AwbService.updateAwbAttr(
              itemAwb.awbItemId,
              awbStatus,
              null,
            );
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

  // TODO: need refactoring
  private static async getDataUserEmployee(userId: number): Promise<User> {
    const userhRepository = new OrionRepositoryService(User);
    const q = userhRepository.findOne();
    // Manage relation (default inner join)
    q.leftJoin(e => e.employee);
    q.select({
      userId: true,
      username: true,
      employee: {
        employeeId: true,
        employeeName: true,
      },
    });
    q.where(e => e.userId, w => w.equals(userId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    return await q.exec();
  }
  // TODO: need refactoring
  private static async getDataBranchCity(branchId: number): Promise<Branch> {
    const branchRepository = new OrionRepositoryService(Branch);
    const q = branchRepository.findOne();
    // Manage relation (default inner join)
    q.leftJoin(e => e.district);

    q.select({
      branchId: true,
      branchCode: true,
      branchName: true,
      districtId: true,
      district: {
        cityId: true,
        city: {
          cityName: true,
        },
      },
    });
    q.where(e => e.branchId, w => w.equals(branchId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    return await q.exec();
  }
}
