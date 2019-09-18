import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../../../../shared/services/auth.service';
import { sampleSize, assign } from 'lodash';
import moment = require('moment');
import { GabunganFindAllResponseVm, PackageAwbResponseVm } from '../../models/gabungan.response.vm';
import { GabunganPayloadVm, PackagePayloadVm } from '../../models/gabungan-payload.vm';
import { BagRepository } from '../../../../shared/orm-repository/bag.repository';
import { BagItemRepository } from '../../../../shared/orm-repository/bagItem.repository';
import { BagItemAwbRepository } from '../../../../shared/orm-repository/bagItemAwb.repository';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { District } from '../../../../shared/orm-entity/district';
import { createQueryBuilder, In } from 'typeorm';
import { PodFilterDetailItem } from '../../../../shared/orm-entity/pod-filter-detail-item';
import { Bag } from '../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';

@Injectable()
export class PackageService {
  constructor() {}

  async awbPackage(payload: PackagePayloadVm): Promise<PackageAwbResponseVm> {

    const regexNumber = /^[0-9]+$/;
    const value       = payload.value;
    const valueLength = value.length;
    const result      = new PackageAwbResponseVm();

    result.districtId   = 0;
    result.districtName = null;

    if (value.includes('*BUKA')) {
      const dataResult    = await this.openSortirCombine(payload);
      result.dataBag      = dataResult.dataBag;
      result.bagNumber    = dataResult.bagNumber;
      result.districtName = dataResult.districtName;
      result.districtId   = dataResult.districtId;
    } else if (regexNumber.test(value) && valueLength < 12) {
      // if district id not found
      if (!payload.districtId) {
          RequestErrorService.throwObj(
          {
            message: 'Masukan kode kecamatan terlebih dahulu',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (Number(value) < 1) {
          RequestErrorService.throwObj(
          {
            message: 'Tidak ada data',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const dataResult = await this.createBagNumber(payload);
      result.bagItemId = dataResult.bagItemId;
      result.bagNumber = dataResult.bagNumber;
    } else if (regexNumber.test(value) && valueLength === 12) {
      //  scan resi
      if (!payload.districtId && !payload.bagNumber) {
          RequestErrorService.throwObj(
          {
            message: 'Masukan kode kecamatan terlebih dahulu',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const scanResult = await this.awbScan(payload);
      result.dataBag      = scanResult.dataBag;
      result.bagNumber    = scanResult.bagNumber;
      result.districtId   = scanResult.districtId;
      result.districtName = scanResult.districtName;
      result.data         = scanResult.data;
    } else {
      const district = await District.findOne({
        where: { districtCode: value },
      });

      if (!district) {
        RequestErrorService.throwObj(
          {
            message: 'Kode kecamatan tidak ditemukan',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      result.districtId   = district.districtId;
      result.districtName = district.districtName.trim();
    }

    return result;
  }

  private async querySearch(args): Promise<any> {
    const qb = createQueryBuilder();
    qb.addSelect('e.awb_number', 'awbNumber');
    qb.addSelect('d.weight_real_rounded', 'weight');
    qb.addSelect('e.consignee_name', 'consigneeName');
    qb.addSelect('e.ref_reseller', 'shipperName');
    qb.addSelect('e.customer_account_id', 'customerId');
    qb.addSelect('e.pickup_merchant', 'pickupMerchant');
    qb.addSelect('g.district_id', 'districtId');
    qb.addSelect('g.district_name', 'districtName');
    qb.addSelect('b.bag_item_id', 'bagItemId');
    qb.from('bag', 'a');
    qb.innerJoin('bag_item', 'b', 'a.bag_id = b.bag_id');
    qb.innerJoin('bag_item_awb', 'c', 'b.bag_item_id = c.bag_item_id');
    qb.innerJoin('awb_item', 'd', 'd.awb_item_id = c.awb_item_id');
    qb.innerJoin('awb', 'e', 'e.awb_id = d.awb_id');
    qb.innerJoin('pod_filter_detail_item', 'f', 'f.awb_item_id = c.awb_item_id');
    qb.innerJoin('district', 'g', 'g.district_id = f.to_id');
    qb.where('a.bag_number = :bagNumber', { bagNumber: args.bagNumber });
    qb.andWhere('b.bag_seq = :bagSequence', { bagSequence: args.bagSequence });
    qb.andWhere('a.is_deleted = false');

    const dataResult = await qb.getRawMany();

    return dataResult;

  }

  private async querySearchPodFilter(args): Promise<any> {
    const qb = createQueryBuilder();
    qb.addSelect('c.awb_number', 'awbNumber');
    qb.addSelect('b.weight_real_rounded', 'weight');
    qb.addSelect('c.consignee_name', 'consigneeName');
    qb.addSelect('c.ref_reseller', 'shipperName');
    qb.addSelect('c.customer_account_id', 'customerId');
    qb.addSelect('c.pickup_merchant', 'pickupMerchant');
    qb.addSelect('a.awb_item_id', 'awbItemId');
    qb.from('pod_filter_detail_item', 'a');
    qb.innerJoin('awb_item', 'b', 'a.awb_item_id = b.awb_item_id');
    qb.innerJoin('awb', 'c', 'c.awb_id = b.awb_id');
    qb.where('a.to_id = :districtId', { districtId: args.districtId });
    qb.andWhere('c.awb_number = :awbNumber', { awbNumber: args.awbNumber } );
    qb.andWhere('a.is_package_combine = false');
    qb.andWhere('a.is_deleted = false');

    const resultData = await qb.getRawOne();

    return resultData;
  }

  private async openSortirCombine(payload): Promise<any> {
    const value = payload.value;
    const result = new Object();
    // open package combine
    const getNumberValue = value.replace('*BUKA ', '').trim();
    const bagNumber: string = getNumberValue.substring(0, 7);
    const regexNumber = /^[0-9]+$/;
    let bagSequence = getNumberValue.substring(7, 10);

    if (getNumberValue.length !== 10 || !regexNumber.test(bagSequence)) {
      RequestErrorService.throwObj(
        {
          message: 'No gabungan sortir tidak sesuai',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    bagSequence = Number(bagSequence);
    const bagParams = { bagNumber, bagSequence };
    const resultData = await this.querySearch(bagParams);
    if (!resultData.length) {
        RequestErrorService.throwObj(
        {
          message: 'No gabung sortir tidak ditemukan',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    assign(result, {
      dataBag     : resultData,
      districtId  : resultData[0].districtId,
      bagNumber   : getNumberValue,
      districtName: resultData[0].districtName.trim(),
    });

    return result;
  }

  private async createBagNumber(payload): Promise<any> {
    const value            = payload.value;
    const result           = new Object();
    const authMeta         = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    if (payload.bagNumber) {
      const bagNumber: string = payload.bagNumber.substring(0, 7);
      const bagSequence: number = Number(payload.bagNumber.substring(7, 10));
      const bagParams = { bagNumber, bagSequence };
      const detailData = await this.querySearch(bagParams);
      if (detailData && detailData.length === Number(value)) {
          assign(result, { bagItemId: detailData[0].bagItemId, bagNumber: payload.bagNumber });
          // result.bagItemId = detailData[0].bagItemId;
      } else {
        RequestErrorService.throwObj(
          {
            message: 'Total data tidak sesuai',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      if (!payload.awbItemId || payload.awbItemId.length < 1 ) {
        RequestErrorService.throwObj(
          {
            message: 'Tidak ada nomor resi',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const districtId       = payload.districtId;
      const filterDetailItem = await PodFilterDetailItem.find({
        where: {
            awbItemId       : In(payload.awbItemId),
            toId            : districtId,
            isPackageCombine: false,
            isDeleted       : false,
          },
      });
      if (filterDetailItem
        // && filterDetailItem.length === Number(value)
        ) {
        const qb = createQueryBuilder();
        qb.addSelect('a.bag_id', 'bagId');
        qb.addSelect('a.bag_number', 'bagNumber');
        qb.addSelect('a.district_id_to', 'districtIdTo');
        qb.addSelect('MAX(b.bag_seq)', 'lastSequence');
        qb.from('bag', 'a');
        qb.innerJoin('bag_item', 'b', 'a.bag_id = b.bag_id');
        qb.where('a.district_id_to = :districtId ', { districtId });
        qb.andWhere('a.created_time::date = :today', { today: moment().format('YYYY-MM-DD') });
        qb.andWhere('a.is_deleted = false');
        qb.groupBy('a.bag_id');

        const bagData = await qb.getRawOne();
        let bagId;
        let sequence;
        let randomBagNumber;

        if (!bagData) {
          // generate bag number
          randomBagNumber = 'GS' + sampleSize('012345678900123456789001234567890', 5).join('');
          const bagDetail = Bag.create({
            bagNumber    : randomBagNumber,
            bagType      : 'district',
            districtIdTo : districtId,
            branchId     : permissonPayload.branchId,
            userIdCreated: authMeta.userId,
            bagDate      : moment().format('YYYY-MM-DD'),
            bagDateReal  : moment().toDate(),
            createdTime  : moment().toDate(),
            updatedTime  : moment().toDate(),
            userIdUpdated: 1,
          });

          const bag = await Bag.save(bagDetail);
          bagId     = bag.bagId;
          sequence  = 1;
          assign(result, { bagNumber: randomBagNumber });
        } else {
          bagId    = bagData.bagId;
          sequence = bagData.lastSequence + 1;
          randomBagNumber = bagData.bagNumber;
        }

        // get all detail awb and insert into bag_item_Awb
        const q = createQueryBuilder();
        q.addSelect('c.awb_number', 'awbNumber');
        q.addSelect('b.weight_real_rounded', 'weight');
        q.addSelect('b.awb_item_id', 'awbItemId');
        q.from('pod_filter_detail_item', 'a');
        q.innerJoin('awb_item', 'b', 'a.awb_item_id = b.awb_item_id');
        q.innerJoin('awb', 'c', 'c.awb_id = b.awb_id');
        q.where('a.to_id = :districtId', { districtId });
        q.andWhere('a.awb_item_id IN (:...awbItemId)', { awbItemId: payload.awbItemId });
        q.andWhere('a.is_deleted = false');

        const awbDetail = await q.getRawMany();

        const bagItemDetail = BagItem.create({
            bagId,
            bagSeq       : sequence,
            branchIdLast : permissonPayload.branchId,
            userIdCreated: authMeta.userId,
            createdTime  : moment().toDate(),
            updatedTime  : moment().toDate(),
            userIdUpdated: authMeta.userId,
        });
        const bagItem = await BagItem.save(bagItemDetail);

        let totalWeight = 0;
        // TODO: force insert awb
        for (const awb of awbDetail) {
          totalWeight += parseFloat(awb.weight);
          const bagItemAwbDetail = BagItemAwb.create({
              bagItemId    : bagItem.bagItemId,
              awbNumber    : awb.awbNumber,
              weight       : awb.weight,
              awbItemId    : awb.awbItemId,
              userIdCreated: authMeta.userId,
              createdTime  : moment().toDate(),
              updatedTime  : moment().toDate(),
              userIdUpdated: authMeta.userId,
          });
          await BagItemAwb.save(bagItemAwbDetail);

          // update pod_filter_detail_item
          const podFilterDetailItem            = await PodFilterDetailItem.findOne({ where: { awbItemId: awb.awbItemId, isDeleted: false } });
          podFilterDetailItem.bagItemId        = bagItem.bagItemId;
          podFilterDetailItem.isPackageCombine = true;
          podFilterDetailItem.updatedTime      = moment().toDate();
          podFilterDetailItem.userIdUpdated    = authMeta.userId;
          await PodFilterDetailItem.save(podFilterDetailItem);

          // update awb_item_attr
          const awbItemAttr            = await AwbItemAttr.findOne({ where: { awbItemId: awb.awbItemId, isDeleted: false } });
          awbItemAttr.bagItemIdLast    = bagItem.bagItemId;
          awbItemAttr.updatedTime      = moment().toDate();
          await AwbItemAttr.save(awbItemAttr);

          // await DeliveryService.updateAwbAttr(
          //   awb.awbItemId,
          //   doPod.branchIdTo,
          //   AWB_STATUS.IN_BRANCH,
          // );

          // update status
          DoPodDetailPostMetaQueueService.createJobByAwbFilter(
            awb.awbItemId,
            permissonPayload.branchId,
            authMeta.userId,
          );

        }

        const updateBagItem = await BagItem.findOne({ where: { bagItemId: bagItem.bagItemId } });

        updateBagItem.weight = totalWeight;
        await BagItem.save(updateBagItem);

        assign(result,  { bagItemId: bagItem.bagItemId, bagNumber: `${randomBagNumber}` + `${sequence.toString().padStart(3, '0')}` });

      } else {
        RequestErrorService.throwObj(
          {
            message: 'Total data tidak sesuai',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return result;
  }

  private async awbScan(payload): Promise<any> {
    const value = payload.value;
    const result = new Object();
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    if (payload.bagNumber) {
      const bagNumber: string = payload.bagNumber.substring(0, 7);
      const bagSequence: number = Number(payload.bagNumber.substring(7, 10));
      const bag = await Bag.findOne({ where: { bagNumber } });
      const districtId = bag.districtIdTo;

      let qb;
      const params = {
        districtId,
        awbNumber: value,
      };
      const resultData = await this.querySearchPodFilter(params);

      if (!resultData) {
          RequestErrorService.throwObj(
          {
            message: 'No resi tidak ditemukan / sudah di gabung sortir',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      qb = createQueryBuilder();
      qb.addSelect('b.bag_item_id', 'bagItemId');
      qb.from('bag', 'a');
      qb.innerJoin('bag_item', 'b', 'a.bag_id = b.bag_id');
      qb.where('a.bag_number = :bagNumber', { bagNumber });
      qb.andWhere('b.bag_seq = :bagSequence', { bagSequence });
      qb.andWhere('a.is_deleted = false');

      const bagItemAwb = await qb.getRawOne();
      const bagItemAwbDetail = BagItemAwb.create({
          awbNumber    : resultData.awbNumber,
          weight       : resultData.weight,
          awbItemId    : resultData.awbItemId,
          userIdCreated: 1,
          userIdUpdated: 1,
          createdTime  : moment().toDate(),
          updatedTime  : moment().toDate(),
          bagItemId    : bagItemAwb.bagItemId,
      });

      await BagItemAwb.save(bagItemAwbDetail);

      // update pod_filter_detail_item
      const podFilterDetailItem            = await PodFilterDetailItem.findOne({ where: { awbItemId: resultData.awbItemId, isDeleted: false } });
      podFilterDetailItem.bagItemId        = bagItemAwb.bagItemId;
      podFilterDetailItem.isPackageCombine = true;
      await PodFilterDetailItem.save(podFilterDetailItem);

      // update awb_item_attr
      const awbItemAttr            = await AwbItemAttr.findOne({ where: { awbItemId: resultData.awbItemId, isDeleted: false } });
      awbItemAttr.bagItemIdLast    = bagItemAwb.bagItemId;
      awbItemAttr.updatedTime      = moment().toDate();
      await AwbItemAttr.save(awbItemAttr);

      DoPodDetailPostMetaQueueService.createJobByAwbFilter(
        resultData.awbItemId,
        permissonPayload.branchId,
        authMeta.userId,
      );

      const bagParams = { bagNumber, bagSequence };
      const detailData = await this.querySearch(bagParams);

      assign(result, {
        dataBag: detailData,
        bagNumber: payload.bagNumber,
        districtName: detailData[0].districtName,
        districtId: detailData[0].districtId,
      });

    } else {
      const districtId = payload.districtId;
      const districtDetail = await District.findOne({ where: { isDeleted: false, districtId } });
      const params = {
          districtId,
          awbNumber: value,
      };
      const resultData = await this.querySearchPodFilter(params);

      if (!resultData) {
          RequestErrorService.throwObj(
          {
            message: 'No resi tidak ditemukan / sudah di gabung sortir',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generate Bag Number
      assign(payload, { awbItemId: [resultData.awbItemId] });
      const genBagNumber = await this.createBagNumber(payload);

      assign(result, {
        bagNumber: genBagNumber.bagNumber,
        data: resultData,
        districtId: districtDetail.districtId,
        districtName: districtDetail.districtName,
      });

    }

    return result;
  }
}
