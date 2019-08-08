import { HttpStatus, Injectable, Query, Logger } from '@nestjs/common';
import { AuthService } from '../../../../shared/services/auth.service';
import { sampleSize, find } from 'lodash';
import moment = require('moment');
import { GabunganFindAllResponseVm, PackageAwbResponseVm } from '../../models/gabungan.response.vm';
import { GabunganPayloadVm, PackagePayloadVm } from '../../models/gabungan-payload.vm';
import { AwbRepository } from '../../../../shared/orm-repository/awb.repository';
import { BagRepository } from '../../../../shared/orm-repository/bag.repository';
import { BagItemRepository } from '../../../../shared/orm-repository/bagItem.repository';
import { BagItemAwbRepository } from '../../../../shared/orm-repository/bagItemAwb.repository';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { District } from '../../../../shared/orm-entity/district';
import { createQueryBuilder, MoreThan } from 'typeorm';
import { PodFilterDetailItem } from '../../../../shared/orm-entity/pod-filter-detail-item';
import { Bag } from '../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { RequestErrorService } from '../../../../shared/services/request-error.service';

@Injectable()
export class GabunganService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(BagRepository)
    private readonly bagRepository: BagRepository,
    @InjectRepository(BagItemRepository)
    private readonly bagItemRepository: BagItemRepository,
    @InjectRepository(BagItemAwbRepository)
    private readonly bagItemAwbRepository: BagItemAwbRepository,
    @InjectRepository(AwbRepository)
    private readonly awbRepository: AwbRepository,
    ) {}
  async gabunganAwb(payload: GabunganPayloadVm): Promise<GabunganFindAllResponseVm> {
    // const authMeta = AuthService.getAuthMetadata();

    // if (!!authMeta) {
      const dataItem = [];
      const timeNow = moment().toDate();
      // const permissonPayload = await this.authService.handlePermissionJwtToken(payload.permissionToken);

      // console.log( moment().format('DD'))
      // console.log( moment().format('MM'))
      const random = sampleSize('ABCDEFGHIJKLMNOPQRSTUVWXYZ012345678900123456789001234567890', 7).join('');

      let awb;
      let data;
      let checkbag;
      let bagNumber;
      let totalSuccess = 0;
      let totalError = 0;
    // insert to bag

      const bag = this.bagRepository.create({

        bagNumber: random,
        representativeIdTo: 12,
        userIdCreated: 14,
        createdTime: timeNow,
        userIdUpdated: 14,
        updatedTime: timeNow,
        branchId: 12,
      });
      await this.bagRepository.save(bag);
      bagNumber = random;
// insert to bag item
      const bagItem = this.bagItemRepository.create({
        bagId: bag.bagId,
        bagSeq: 1,
        userIdCreated: 14,
        createdTime: timeNow,
        userIdUpdated: 14,
        updatedTime: timeNow,
      });
      await this.bagItemRepository.save(bagItem);

      for (const awbNumbers of payload.awbNumber) {
        // NOTE:
        // console.log(payload.awbNumber)
        // console.log(awbNumbers)

        // checkbag = await this.bagRepository.findOne({
        //   select: ['bagId', 'branchId'],
        //   where: { awbNumbers },
        // });
        // console.log(awb)
        if (bagItem) {
            // save data to table bagAwbItem
          const bagAwbItem = this.bagItemAwbRepository.create();
          bagAwbItem.bagItemId = bagItem.bagItemId;
          bagAwbItem.awbNumber = awbNumbers;
          bagAwbItem.userIdCreated = bagItem.userIdCreated;
          bagAwbItem.userIdUpdated = bagItem.userIdUpdated;
          bagAwbItem.updatedTime = bagItem.updatedTime;
          bagAwbItem.createdTime = moment().toDate();
          await this.bagItemAwbRepository.save(bagAwbItem);

          totalSuccess += 1;
          dataItem.push({
            bagNumber,
            status: 'ok',
            message: 'Success',
          });
        } else {
            totalError += 1;
            dataItem.push({
              bagNumber,
                status : 'error',
                message:  `No Bag ${bagNumber} Tidak di Temukan`,
            });
          }

        const result = new GabunganFindAllResponseVm();
        data = bag.bagNumber;
        result.data  = dataItem;
        return result ;

        }
  }

  async awbPackage(payload: PackagePayloadVm): Promise<PackageAwbResponseVm> {

    const regexNumber = /^[0-9]+$/;
    const value       = payload.value;
    const valueLength = value.length;
    const result      = new PackageAwbResponseVm();

    result.data         = [];
    result.total        = 0;
    result.districtId   = 0;
    result.districtName = null;

    if (value.includes('*BUKA')) {
      // open package combine
      const getNumberValue = value.replace('*BUKA ', '').trim();
      const bagNumber: string = getNumberValue.substring(0, 7);
      const bagSequence: number = Number(getNumberValue.substring(7, 10));

      const qb  = createQueryBuilder();
      qb.addSelect('e.awb_number', 'awbNumber');
      qb.addSelect('d.weight_real_rounded', 'weight');
      qb.addSelect('e.consignee_name', 'consigneeName');
      qb.addSelect('e.ref_reseller', 'shipperName');
      qb.addSelect('e.customer_account_id', 'customerId');
      qb.addSelect('e.pickup_merchant', 'pickupMerchant');
      qb.addSelect('g.district_id', 'districtId');
      qb.addSelect('g.district_name', 'districtName');
      qb.from('bag', 'a');
      qb.innerJoin('bag_item', 'b', 'a.bag_id = b.bag_id');
      qb.innerJoin('bag_item_awb', 'c', 'b.bag_item_id = c.bag_item_id');
      qb.innerJoin('awb_item', 'd', 'd.awb_item_id = c.awb_item_id');
      qb.innerJoin('awb', 'e', 'e.awb_id = d.awb_id');
      qb.innerJoin('pod_filter_detail_item', 'f', 'f.awb_item_id = c.awb_item_id');
      qb.innerJoin('district', 'g', 'g.district_id = f.to_id');
      qb.where('a.bag_number = :bagNumber', { bagNumber });
      qb.andWhere('b.bag_seq = :bagSequence', { bagSequence });
      qb.andWhere('a.is_deleted = false');

      const resultData = await qb.getRawMany();
      if (!resultData) {
         RequestErrorService.throwObj(
          {
            message: 'No gabung paket tidak ditemukan',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      result.data       = resultData;
      result.total      = resultData.length;
      result.districtId = resultData[0].districtId;
      result.bagNumber  = getNumberValue;
      result.districtName = resultData[0].districtName.trim();
    } else if (regexNumber.test(value) && valueLength < 12) {
      // if district id not found
      if (!payload.districtId) {
         RequestErrorService.throwObj(
          {
            message: 'ID kecamatan harus diisi',
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

      if (payload.bagNumber) {
        const bagNumber: string = payload.bagNumber.substring(0, 7);
        const bagSequence: number = Number(payload.bagNumber.substring(7, 10));
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
        qb.where('a.bag_number = :bagNumber', { bagNumber });
        qb.andWhere('b.bag_seq = :bagSequence', { bagSequence });
        qb.andWhere('a.is_deleted = false');

        const detailData = await qb.getRawMany();
        if (detailData && detailData.length === Number(value)) {
            result.bagItemId = detailData[0].bagItemId;
            // // TODO: PRINT CUK
            //  RequestErrorService.throwObj(
            //   {
            //     message: 'HARUSNYA DISINI NGEPRINT',
            //   },
            //   HttpStatus.BAD_REQUEST,
            // );
        } else {
           RequestErrorService.throwObj(
            {
              message: 'Total data tidak sesuai',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        const districtId       = payload.districtId;
        const filterDetailItem = await PodFilterDetailItem.find({ where: { toId:  districtId, isPackageCombine: false, isDeleted: false} });
        if (filterDetailItem && filterDetailItem.length === Number(value)) {
          const qb = createQueryBuilder();
          qb.addSelect('a.bag_id', 'bagId');
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

          if (!bagData) {
            // generate bag number
            const randomBagNumber = 'GS' + sampleSize('012345678900123456789001234567890', 5).join('');
            const bagDetail = Bag.create({
              bagNumber    : randomBagNumber,
              bagType      : 'district',
              districtIdTo : districtId,
              userIdCreated: 1,
              bagDate      : moment().format('YYYY-MM-DD'),
              bagDateReal  : moment().toDate(),
              createdTime  : moment().toDate(),
              updatedTime  : moment().toDate(),
              userIdUpdated: 1,
            });

            const bag = await Bag.save(bagDetail);
            bagId     = bag.bagId;
            sequence  = 1;
            result.bagNumber = randomBagNumber;
          } else {
            bagId    = bagData.bagId;
            sequence = bagData.lastSequence + 1;
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
          q.andWhere('a.is_deleted = false');

          const awbDetail = await q.getRawMany();

          const bagItemDetail = BagItem.create({
              bagId,
              bagSeq       : sequence,
              userIdCreated: 1,
              createdTime  : moment().toDate(),
              updatedTime  : moment().toDate(),
              userIdUpdated: 1,
          });
          const bagItem = await BagItem.save(bagItemDetail);

          let totalWeight = 0;
          for (const awb of awbDetail) {
            totalWeight += parseFloat(awb.weight);
            const bagItemAwbDetail = BagItemAwb.create({
                bagItemId    : bagItem.bagItemId,
                awbNumber    : awb.awbNumber,
                weight       : awb.weight,
                awbItemId    : awb.awbItemId,
                userIdCreated: 1,
                createdTime  : moment().toDate(),
                updatedTime  : moment().toDate(),
                userIdUpdated: 1,
            });
            await BagItemAwb.save(bagItemAwbDetail);

            // update pod_filter_detail_item
            const podFilterDetailItem            = await PodFilterDetailItem.findOne({ where: { awbItemId: awb.awbItemId, isDeleted: false } });
            podFilterDetailItem.bagItemId        = bagItem.bagItemId;
            podFilterDetailItem.isPackageCombine = true;
            await PodFilterDetailItem.save(podFilterDetailItem);
          }

          const updateBagItem = await BagItem.findOne({ where: { bagItemId: bagItem.bagItemId } });

          updateBagItem.weight = totalWeight;
          await BagItem.save(updateBagItem);

          result.bagItemId = bagItem.bagItemId;

        } else {
            RequestErrorService.throwObj(
              {
                message: 'Total data tidak sesuai',
              },
              HttpStatus.BAD_REQUEST,
            );
        }
      }

    } else if (regexNumber.test(value) && valueLength === 12) {
      //  scan resi
      if (!payload.districtId && !payload.bagNumber) {
         RequestErrorService.throwObj(
          {
            message: 'ID kecamatan harus diisi',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (payload.bagNumber) {
        const bagNumber: string = payload.bagNumber.substring(0, 7);
        const bagSequence: number = Number(payload.bagNumber.substring(7, 10));
        const bag = await Bag.findOne({ where: { bagNumber } });
        const districtId = bag.districtIdTo;

        let qb;
        qb = createQueryBuilder();
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
        qb.where('a.to_id = :districtId', { districtId });
        qb.where('c.awb_number = :awbNumber', { awbNumber: value });
        qb.andWhere('a.is_deleted = false');

        const resultData = await qb.getRawOne();
        if (!resultData) {
           RequestErrorService.throwObj(
            {
              message: 'No resi tidak ditemukan',
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

        qb = createQueryBuilder();
        qb.addSelect('e.awb_number', 'awbNumber');
        qb.addSelect('d.weight_real_rounded', 'weight');
        qb.addSelect('e.consignee_name', 'consigneeName');
        qb.addSelect('e.ref_reseller', 'shipperName');
        qb.addSelect('e.customer_account_id', 'customerId');
        qb.addSelect('e.pickup_merchant', 'pickupMerchant');
        qb.addSelect('g.district_id', 'districtId');
        qb.addSelect('g.district_name', 'districtName');
        qb.from('bag', 'a');
        qb.innerJoin('bag_item', 'b', 'a.bag_id = b.bag_id');
        qb.innerJoin('bag_item_awb', 'c', 'b.bag_item_id = c.bag_item_id');
        qb.innerJoin('awb_item', 'd', 'd.awb_item_id = c.awb_item_id');
        qb.innerJoin('awb', 'e', 'e.awb_id = d.awb_id');
        qb.innerJoin('pod_filter_detail_item', 'f', 'f.awb_item_id = c.awb_item_id');
        qb.innerJoin('district', 'g', 'g.district_id = f.to_id');
        qb.where('a.bag_number = :bagNumber', { bagNumber });
        qb.andWhere('b.bag_seq = :bagSequence', { bagSequence });
        qb.andWhere('a.is_deleted = false');

        const detailData = await qb.getRawMany();

        result.data         = detailData;
        result.total        = detailData.length;
        result.districtName = detailData[0].districtName;
        result.districtId   = detailData[0].districtId;

      } else {
        const districtId = payload.districtId;
        const qb         = createQueryBuilder();
        const districtDetail = await District.findOne({ where: { isDeleted: false, districtId } });

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
        qb.where('a.to_id = :districtId', { districtId });
        qb.andWhere('a.is_deleted = false');

        const resultData = await qb.getRawMany();
        const detailData  = find(resultData, ['awbNumber', value ]);

        if (detailData === undefined) {
           RequestErrorService.throwObj(
            {
              message: 'No resi tidak ditemukan',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        result.data  = resultData;
        result.total = resultData.length;
        result.districtId = districtDetail.districtId;
        result.districtName = districtDetail.districtName;
      }
    } else {
      // check district and get all data on pod_filter_detail_item if exists
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

      const districtId = district.districtId;
      const qb         = createQueryBuilder();

      qb.addSelect('c.awb_number', 'awbNumber');
      qb.addSelect('b.weight_real_rounded', 'weight');
      qb.addSelect('c.consignee_name', 'consigneeName');
      qb.addSelect('c.ref_reseller', 'shipperName');
      qb.addSelect('c.customer_account_id', 'customerId');
      qb.addSelect('c.pickup_merchant', 'pickupMerchant');
      qb.from('pod_filter_detail_item', 'a');
      qb.innerJoin('awb_item', 'b', 'a.awb_item_id = b.awb_item_id');
      qb.innerJoin('awb', 'c', 'c.awb_id = b.awb_id');
      qb.where('a.to_id = :districtId', { districtId });
      qb.andWhere('a.is_package_combine = false');
      qb.andWhere('a.is_deleted = false');

      const resultData = await qb.getRawMany();

      result.data  = resultData;
      result.total = resultData.length;
    }

    return result;
  }
}
