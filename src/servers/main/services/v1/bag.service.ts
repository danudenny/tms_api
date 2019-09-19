import { Logger } from '@nestjs/common';
import { AuthService } from '../../../../shared/services/auth.service';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { AwbService } from './awb.service';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { DropoffHubDetail } from '../../../../shared/orm-entity/dropoff_hub_detail';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';

export class BagService {

  static async validBagNumber(bagNumberSeq: string): Promise<BagItem> {
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
    return await q.exec();
  }

  static async statusDropoffAwbBag(
    bagItemId: number,
    dropoffHubId: number,
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
          const dropoffDetail = DropoffHubDetail.create();
          dropoffDetail.dropoffHubId = dropoffHubId;
          dropoffDetail.branchId = permissonPayload.branchId;
          // dropoffDetail.awbId = ;
          dropoffDetail.awbItemId = itemAwb.awbItemId;
          await DropoffHubDetail.save(dropoffDetail);

          await AwbService.updateAwbAttr(
            itemAwb.awbItemId,
            AWB_STATUS.DO_HUB,
          );
          // TODO: check awb status for auto check out ??
          // NOTE: queue by Bull
          // add awb history with background process
          DoPodDetailPostMetaQueueService.createJobByDropoffBag(
            itemAwb.awbItemId,
            permissonPayload.branchId,
            authMeta.userId,
          );
        }
      } // end of loop
    } else {
      Logger.log('### Data Bag Item Awb :: Not Found!!');
    }
    return true;
  }

}
