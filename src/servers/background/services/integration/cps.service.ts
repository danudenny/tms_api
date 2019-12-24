import { Injectable } from '@nestjs/common';

import { Bag } from '../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { BagItemHistory } from '../../../../shared/orm-entity/bag-item-history';
import { Branch } from '../../../../shared/orm-entity/branch';
import { Representative } from '../../../../shared/orm-entity/representative';
import { BagItemAwbQueueService } from '../../../queue/services/bag-item-awb-queue.service';
import { BagResponseVm } from '../../models/bag.response.vm';

import moment = require('moment');
@Injectable()
export class CpsService {
  static async postBag(
    payload: any,
  ): Promise<BagResponseVm> {
    const result = new BagResponseVm();

    let totalProcess = 0;
    let bagInserted = [];
    let bagUpdated = [];

    for (const item of payload.data) {
      const timeNow = moment().toDate();

      // Get Branch Id
      let branchId = null;
      const branch = await Branch.findOne({
        where: {
          branchCode: item['Hub'],
        },
      });
      if (branch) {
        branchId = branch.branchId;
      }

      //Get Representative Id
      let representativeIdTo = null;
      const representative = await Representative.findOne({
        where: {
          representativeCode: item['Perwakilan'],
        },
      });
      if (representativeIdTo) {
        representativeIdTo = representative.representativeId;
      }

      let noSttSc = item['NoSttSc'];
      let bagNumber =  noSttSc.substring(0, 7);
      let bagItemSeq =  noSttSc.substring(8, 10);

      let bag = await Bag.findOne({
        where: {
          bagNumber: bagNumber
        }
      });

      if (!bag) {
        bag = Bag.create({
          bagNumber: bagNumber,
          userIdCreated: 0,
          createdTime: timeNow
        });
        bag.branchId = branchId;
        bag.refBranchCode = item['Hub'];
        bag.representativeIdTo = representativeIdTo;
        bag.refRepresentativeCode = item['Perwakilan'];
        bag.bagDate = item['TglTransaksi'];
        bag.bagDateReal = item['TglInput'];
        bag.userIdUpdated = 0;
        bag.updatedTime = timeNow;
        await Bag.insert(bag);

        bagInserted.push(noSttSc);
      } else {
        await Bag.update(bag.bagId, {
          branchId: branchId,
          refBranchCode: item['Hub'],
          representativeIdTo: representativeIdTo,
          refRepresentativeCode: item['Perwakilan'],
          bagDate: item['TglTransaksi'],
          bagDateReal: item['TglInput'],
          userIdUpdated: 0,
          updatedTime: timeNow
        });

        bagUpdated.push(noSttSc);
      }

      let isCreateHistory = false;

      let bagItem = await BagItem.findOne({
        bagId: bag.bagId,
        bagSeq: bagItemSeq
      });

      if (!bagItem) {
        bagItem = BagItem.create({
          userIdCreated: 0,
          createdTime: timeNow,
          bagItemStatusIdLast: 500
        });
        bagItem.branchIdLast = branchId;
        bagItem.bagId = bag.bagId;
        bagItem.bagSeq = bagItemSeq;
        bagItem.weight = item['TotalBerat'];
        bagItem.userIdUpdated = 0;
        bagItem.updatedTime = timeNow;
        await BagItem.insert(bagItem);

        isCreateHistory = true;
      } else {
        await BagItem.update(bagItem.bagItemId, {
          branchIdLast: branchId,
          bagId: bag.bagId,
          bagSeq: bagItemSeq,
          weight: item['TotalBerat'],
          userIdUpdated: 0,
          updatedTime: timeNow
        });
      }

      if (isCreateHistory) {
        let bagItemHistory = BagItemHistory.create();
        bagItemHistory.bagItemId = bagItem.bagItemId.toString();
        bagItemHistory.userId = '0';
        bagItemHistory.branchId = branchId;
        bagItemHistory.historyDate = timeNow;
        bagItemHistory.bagItemStatusId = '500';
        bagItemHistory.userIdCreated = 0;
        bagItemHistory.createdTime = timeNow;
        bagItemHistory.userIdUpdated = 0;
        bagItemHistory.updatedTime = timeNow;
        await BagItemHistory.insert(bagItemHistory);

        await BagItem.update(bagItem.bagItemId, {
          bagItemHistoryId: Number(bagItemHistory.bagItemHistoryId)
        });
      }

      await BagItemAwb.update({
        bagItemId: bagItem.bagItemId
      }, {
        isDeleted: true
      });

      const arrBag: BagItemAwb[] = [];
      for (const data of item['list_item']) {
        const bagItemAwb = BagItemAwb.create(
          {
            bagItemId: bagItem.bagItemId,
            awbNumber: data['NoSTT'],
            weight: data['Berat'],
            createdTime: timeNow,
            updatedTime: timeNow,
            userIdCreated: 0,
            userIdUpdated: 0
          }
        );
        arrBag.push(bagItemAwb);
      }
      await BagItemAwb.insert(arrBag);

      await BagItemAwb.delete({
        bagItemId: bagItem.bagItemId,
        isDeleted: true
      });

      console.log('##### BAG ID : ' + bag.bagId  + ' =======================================================');
      console.log('##### BAG ITEM ID : ' + bagItem.bagItemId  + ' =======================================================');

      // BagItemAwbQueueService.addData(arrAwb);

      totalProcess += 1;
    }

    result.total_process = totalProcess;
    result.bag_inserted = bagInserted;
    result.bag_updated = bagUpdated;

    return result;
  }

}
