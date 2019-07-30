import { AwbTrouble } from '../../../../shared/orm-entity/awb-trouble';
import { WebAwbFilterScanBagVm, WebAwbFilterScanAwbVm, WebAwbFilterFinishScanVm } from '../../models/web-awb-filter.vm';
import { WebAwbFilterScanBagResponseVm, WebAwbFilterScanAwbResponseVm, WebAwbFilterFinishScanResponseVm } from '../../models/web-awb-filter-response.vm';
import { DeliveryService } from '../../../../shared/services/delivery.service';
import { ContextualErrorService } from '../../../../shared/services/contextual-error.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { DistrictRepository } from '../../../../shared/orm-repository/district.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ScanAwbVm } from '../../models/web-awb-filter-response.vm';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { PodFilter } from '../../../../shared/orm-entity/pod-filter';
import { PodFilterRepository } from '../../../../shared/orm-repository/pod-filter.repository';
import { RepresentativeRepository } from '../../../../shared/orm-repository/representative.repository';
import { PodFilterDetailRepository } from '../../../../shared/orm-repository/pod-filter-detail.repository';
import { PodFilterDetailItem } from '../../../../shared/orm-entity/pod-filter-detail-item';
import { PodFilterDetailItemRepository } from '../../../../shared/orm-repository/pod-filter-detail-item.repository';
import moment = require('moment');
import { PodFilterDetail } from '../../../../shared/orm-entity/pod-filter-detail';
import { reduce } from 'rxjs/operators';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { WebAwbFilterListResponseVm } from '../../models/web-awb-filter-list.response.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { QueryBuilderService } from '../../../../shared/services/query-builder.service';

export class WebAwbFilterService {

  constructor(
    @InjectRepository(DistrictRepository)
    private readonly districtRepository: DistrictRepository,
    @InjectRepository(PodFilterRepository)
    private readonly podFilterRepository: PodFilterRepository,
    @InjectRepository(RepresentativeRepository)
    private readonly representativeRepository: RepresentativeRepository,
    @InjectRepository(PodFilterDetailRepository)
    private readonly podFilterDetailRepository: PodFilterDetailRepository,
    @InjectRepository(PodFilterDetailItemRepository)
    private readonly podFilterDetailItemRepository: PodFilterDetailItemRepository,
  ) {}

  async scanBag(payload: WebAwbFilterScanBagVm): Promise<WebAwbFilterScanBagResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    // check bagNumber is valid or not
    const bagData = await DeliveryService.validBagNumber(payload.bagNumber);

    // bagNumber not found, then throw error
    if (!bagData) {
      ContextualErrorService.throwObj({
        message: `No Gabung Paket ${payload.bagNumber} tidak ditemukan`,
      }, 500);
    }

    // TODO: if this bag is filtering in another branch and user, block other user and branch to scan the same bag

    // find Last Filter for current user and branch scan
    let podFilter = await RepositoryService.podFilter
      .findOne()
      .andWhere(e => e.userIdScan, w => w.equals(authMeta.userId))
      .andWhere(e => e.branchIdScan, w => w.equals(permissonPayload.branchId))
      .andWhere(e => e.isActive, w => w.isTrue())
      .andWhere(e => e.isDeleted, w => w.isFalse())
      .select({
        podFilterId: true,
        representativeIdFilter: true,
        representative: {
          representativeCode: true,
        },
      }).exec()
    ;

    if (podFilter) {
      // if exists

      // check previous representative, should be same with current bag, before they finish/clear this podFilter
      if (podFilter.representativeIdFilter != bagData.bag.representativeIdTo) {
        ContextualErrorService.throwObj({
          message: `Perwakilan berbeda. Harap selesaikan dahulu Perwakilan ${podFilter.representative.representativeCode}`,
        }, 500);
      }

      // just update end_date_time that indicate scan this bag still in progress
      await PodFilter.update(podFilter.podFilterId, {
        endDateTime: moment().toDate(),
        updatedTime: moment().toDate(),
        userIdUpdated: authMeta.userId,
      });

    } else {
      // if not exists, create new one
      podFilter = await this.createPodFilter(authMeta, permissonPayload, bagData);
    }

    // check this bag already scan or not
    const podFilterDetail = await this.findAndCreatePodFilterDetail(authMeta, podFilter, bagData);

    // retrieve all awb inside bag, then grouping each destination by district (to_id)
    const raw_query = `
      SELECT awb.to_id, COUNT(1) as count, COUNT(1) FILTER (WHERE is_district_filtered = true) as filtered
      FROM bag_item_awb bia
      INNER JOIN awb_item ai ON ai.awb_item_id = bia.awb_item_id AND ai.is_deleted = false
      INNER JOIN awb_item_attr aia ON aia.awb_item_id = ai.awb_item_id AND ai.is_deleted = false
      INNER JOIN awb ON awb.awb_id = ai.awb_id AND awb.is_deleted = false
      WHERE bia.bag_item_id = '${bagData.bagItemId}' AND awb.to_type = 40 AND bia.is_deleted = false
      GROUP BY awb.to_id
    `;
    const result = await RawQueryService.query(raw_query);
    const data = [];
    for (const res of result) {
      const district = await this.districtRepository.findOne({
        where: {
          districtId: res.to_id,
        },
        select: ['districtId', 'districtCode', 'districtName'],
      });
      data.push({
        districtId: district.districtId,
        districtCode: district.districtCode,
        districtName: district.districtName,
        totalAwb: res.count,
        totalFiltered: res.filtered,
      });
    }

    // get representative code, to inform frontend current active representative
    const representative = await this.representativeRepository.findOne({
      where: {
        representativeId: bagData.bag.representativeIdTo,
      },
    });

    const response = new WebAwbFilterScanBagResponseVm();
    response.totalData = 0;
    response.bagItemId = bagData.bagItemId;
    response.podFilterCode = podFilter.podFilterCode;
    response.podFilterId = podFilterDetail.podFilterId;
    response.podFilterDetailId = podFilterDetail.podFilterDetailId;
    response.representativeCode = representative.representativeCode;
    response.data = data;

    return response;
  }

  async scanAwb(payload: WebAwbFilterScanAwbVm): Promise<WebAwbFilterScanAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const results: ScanAwbVm[] = [];

    // check payload.podFilterDetailId is valid or not
    const podFilterDetailExists = await PodFilterDetail.findOne({
      where: {
        podFilterDetailId: payload.podFilterDetailId,
        isDeleted: false,
      },
      select: ['podFilterDetailId'],
    });
    if (!podFilterDetailExists) {
      ContextualErrorService.throwObj({
        message: `Invalid podFilterDetailId`,
      }, 500);
    }

    // get all awb_number from payload
    for (const awbNumber of payload.awbNumber) {

      // find each awb_number
      const awbItemAttr = await RepositoryService.awbItemAttr
        .findOne()
        .andWhere(e => e.awbNumber, w => w.equals(awbNumber))
        .andWhere(e => e.isDeleted, w => w.isFalse())
        .select({
          awbItemId: true,
          awbItemAttrId: true,
          isDistrictFiltered: true,
          bagItemIdLast: true,
          awbItem: {
            awbItemId: true, // needs to be selected due to awbItem relations are being selected
            awb: {
              toType: true,
              toId: true,
            },
          },
        });
      const res = new ScanAwbVm();
      res.awbNumber = awbNumber;

      if (awbItemAttr) {
        if (awbItemAttr.isDistrictFiltered) {
          // this awb is already filtered
          res.status = 'error';
          res.trouble = false;
          res.message = `Resi ${awbNumber} sudah tersortir`;
          res.districtId = awbItemAttr.awbItem.awb.toId;
          results.push(res);
        } else {
          // do process filtering awb

          // process filter each awb
          // TODO:: update awb_item_attr last to IN
          await AwbItemAttr.update(awbItemAttr.awbItemAttrId, {
            isDistrictFiltered: true,
          });

          if (awbItemAttr.bagItemIdLast) {
            // no error, this awb is fine
            res.status = 'success';
            res.trouble = false;
            res.message = `Resi ${awbNumber} berhasil tersortir`;
            res.districtId = awbItemAttr.awbItem.awb.toId;
            results.push(res);

            // save to pod_filter_detail_item
            await this.createPodFilterDetailItem(authMeta, payload, awbItemAttr);

          } else {
            // response error, but still process sortir, just announce for CT this awb have a trouble package combine
            const podFilterDetail = await RepositoryService.podFilterDetail
              .findOne()
              .andWhere(e => e.podFilterDetailId, w => w.equals(payload.podFilterDetailId))
              .select({
                bagItemId: true,
                bagItem: {
                  bagId: true,
                  bagSeq: true,
                  bag: {
                    branchId: true,
                    userId: true,
                    bagNumber: true,
                  },
                },
              })
            ;

            const bagNumberSeq = `${podFilterDetail.bagItem.bagSeq}${podFilterDetail.bagItem.bag.bagNumber}`;
            res.status = 'success';
            res.trouble = true;
            res.districtId = awbItemAttr.awbItem.awb.toId;
            res.message = `Resi ${awbNumber} berhasil tersortir, tetapi tidak ada pada Gabung Paket ${bagNumberSeq}`;
            results.push(res);

            // announce for CT using table awb_trouble and the category of trouble is awb_filter
            // save data to awb_trouble
            const awbTrouble = await this.createAwbTrouble(authMeta, permissonPayload , awbNumber, res.message, podFilterDetail);

            // save to pod_filter_detail_item
            await this.createPodFilterDetailItem(authMeta, payload, awbItemAttr, awbTrouble);
          }

          // Update total_awb_filtered, total_awb_item, total_awb_not_in_bag
          const keyRedis = `hold:awbfiltered:${podFilterDetailExists.podFilterDetailId}`;
          const holdRedis = await RedisService.locking(
            keyRedis,
            'locking',
          );
          if (holdRedis) {
            const podFilterDetail = await PodFilterDetail.findOne({
              where: {
                podFilterDetailId: podFilterDetailExists.podFilterDetailId,
                isDeleted: false,
              },
            });
            podFilterDetail.totalAwbItem = podFilterDetail.totalAwbItem + 1;
            if (awbItemAttr.bagItemIdLast) {
              podFilterDetail.totalAwbFiltered = podFilterDetail.totalAwbFiltered + 1;
            } else {
              podFilterDetail.totalAwbNotInBag = podFilterDetail.totalAwbNotInBag + 1;

            }
            podFilterDetail.endDateTime = moment().toDate();
            podFilterDetail.updatedTime = moment().toDate();
            podFilterDetail.userIdUpdated = authMeta.userId;
            await podFilterDetail.save();

            // remove key holdRedis
            RedisService.del(keyRedis);
          } else {

          }

          // after scan filter done at all. do posting status last awb
          // TODO: posting to awb_history, awb_item_summary
        }
      } else {
        // Unknown Awb, GO TO HELL
        res.status = 'error';
        res.trouble = false;
        res.message = `Resi ${awbNumber} tidak dikenali`;
        res.districtId = null;
        results.push(res);
      }
    }

    const response = new WebAwbFilterScanAwbResponseVm();
    response.totalData = 0;
    response.data = results;

    return response;
  }

  async finishScan(payload: WebAwbFilterFinishScanVm): Promise<WebAwbFilterFinishScanResponseVm> {
    await PodFilter.update(payload.podFilterId, {
      isActive: false,
      endDateTime: moment().toDate(),
      updatedTime: moment().toDate(),
    });

    const response = new WebAwbFilterFinishScanResponseVm();
    response.status = 'ok';
    response.message = 'Berhasil menutup Perwakilan ini';
    return response;
  }

  async findAllAwbFilterList(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbFilterListResponseVm> {
    // mapping field
    payload.fieldResolverMap['filteredDateTime'] = 'pfd.scan_date_time';
    // payload.fieldResolverMap['bagNumber'] = 't2.bag_number';
    // payload.fieldResolverMap['branchIdScan'] = 't3.branch_id';
    // payload.fieldResolverMap['branchNameScan'] = 't3.branch_name';
    // payload.fieldResolverMap['branchNameFrom'] = 't4.branch_name';
    // payload.fieldResolverMap['branchIdFrom'] = 't4.branch_id';
    // payload.fieldResolverMap['employeeName'] = 't5.nickname';

    // SELECT d.*, pfd.total_awb_filtered, (pfd.total_awb_filtered - total_awb) as diff,
    //   pfd.total_awb_not_in_bag, pfd.total_awb_item
    // FROM (
    //   SELECT bia.bag_item_id, COUNT(1) as total_awb
    //   FROM bag_item_awb bia
    //   WHERE bia.is_deleted = false AND bia.bag_item_id = 2174092
    //   GROUP BY bia.bag_item_id
    // ) as d
    // INNER JOIN pod_filter_detail pfd ON pfd.bag_item_id = d.bag_item_id AND pfd.is_deleted = false

    // mapping search field and operator default ilike
    // payload.globalSearchFields = [
    //   {
    //     field: 'podScaninDateTime',
    //   },
    // ];
    const q = payload.buildQueryBuilder();

    q.select('d.bag_item_id', 'bagItemId')
      .addSelect('d.total_awb_filtered', 'totalFiltered')
      .addSelect('(d.total_awb_filtered - total_awb)', 'diffFiltered')
      .addSelect('d.total_awb_not_in_bag', 'totalAwb')
      .addSelect('d.total_awb_item', 'totalItem')
      .addSelect('CONCAT(b.bag_number, LPAD(bi.bag_seq::text, 3, \'0\'))', 'bagNumberSeq')
      .from(
        subQuery =>
          subQuery
            .select('pfd.pod_filter_detail_id')
            .addSelect('pfd.bag_item_id')
            .addSelect('COUNT(1) as total_awb')
            .addSelect('pfd.total_awb_filtered')
            .addSelect('pfd.total_awb_not_in_bag')
            .addSelect('pfd.total_awb_item')
            .from('pod_filter_detail', 'pfd')
            .innerJoin('bag_item_awb', 'bia', 'bia.bag_item_id = pfd.bag_item_id AND bia.is_deleted = false')
            .where('pfd.scan_date_time >= ?')
            .andWhere('pfd.scan_date_time < ?')
            .andWhere('pfd.is_deleted = false')
            .groupBy('pfd.pod_filter_detail_id')
            .addGroupBy('pfd.bag_item_id'),
        'd',
      )
      .innerJoin(
        'bag_item',
        'bi',
        'bi.bag_item_id = d.bag_item_id AND bi.is_deleted = false',
      )
      .innerJoin(
        'bag',
        'b',
        'b.bag_id = bi.bag_id AND bi.is_deleted = false',
      );

    const total = await QueryBuilderService.count(q, '1');
    payload.applyRawPaginationToQueryBuilder(q);
    const data = await q.getRawMany();

    const result = new WebAwbFilterListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  async createPodFilter(authMeta, permissonPayload, bagData) {
      const podFilter = this.podFilterRepository.create();
      podFilter.representativeIdFilter = bagData.bag.representativeIdTo;
      podFilter.isActive = true;
      podFilter.podFilterCode = await CustomCounterCode.podFilter(moment().toDate());
      podFilter.startDateTime = moment().toDate();
      podFilter.userIdScan = authMeta.userId;
      podFilter.branchIdScan = permissonPayload.branchId;
      podFilter.createdTime = moment().toDate();
      podFilter.userIdCreated = authMeta.userId;
      podFilter.endDateTime = moment().toDate();
      podFilter.updatedTime = moment().toDate();
      podFilter.userIdUpdated = authMeta.userId;
      return await PodFilter.save(podFilter);
  }

  async createPodFilterDetailItem(authMeta, payload, awbItemAttr, awbTrouble = null) {
    const podFilterDetailItem = this.podFilterDetailItemRepository.create();
    podFilterDetailItem.podFilterDetailId = payload.podFilterDetailId;
    podFilterDetailItem.scanDateTime = moment().toDate();
    podFilterDetailItem.awbItemId = awbItemAttr.awbItemId;
    podFilterDetailItem.toType = awbItemAttr.awbItem.awb.toType;
    podFilterDetailItem.toId = awbItemAttr.awbItem.awb.toId;
    if (awbTrouble != null) {
      podFilterDetailItem.isTroubled = true;
      podFilterDetailItem.awbTroubleId = awbTrouble.awbTroubleId;
    } else {
      podFilterDetailItem.isTroubled = false;
    }
    podFilterDetailItem.createdTime = moment().toDate();
    podFilterDetailItem.userIdCreated = authMeta.userId;
    podFilterDetailItem.updatedTime = moment().toDate();
    podFilterDetailItem.userIdUpdated = authMeta.userId;
    return await this.podFilterDetailItemRepository.save(podFilterDetailItem);
  }

  async findAndCreatePodFilterDetail(authMeta, podFilter, bagData) {
    // check this bag already scan or not
    let podFilterDetail = await RepositoryService.podFilterDetail
      .findOne()
      .andWhere(e => e.podFilterId, w => w.equals(podFilter.podFilterId))
      .andWhere(e => e.bagItemId, w => w.equals(bagData.bagItemId))
      .andWhere(e => e.isDeleted, w => w.isFalse())
    ;
    // if already scan, skip insert into pod_filter_detail
    // this section, to handle when they scan bag_nmber twice
    if (!podFilterDetail) {

      // save to pod_filter_detail for the first time scan
      podFilterDetail = await this.podFilterDetailRepository.create();
      podFilterDetail.bagItemId = bagData.bagItemId;
      podFilterDetail.scanDateTime = moment().toDate();
      podFilterDetail.podFilterId = podFilter.podFilterId;
      podFilterDetail.startDateTime = moment().toDate();
      podFilterDetail.endDateTime = moment().toDate();
      podFilterDetail.createdTime = moment().toDate();
      podFilterDetail.userIdCreated = authMeta.userId;
      podFilterDetail.updatedTime = moment().toDate();
      podFilterDetail.userIdUpdated = authMeta.userId;
      await this.podFilterDetailRepository.save(podFilterDetail);

      // update total_bag_item on pod_filter
      await PodFilter.update(podFilter.podFilterId, {
        endDateTime: moment().toDate(),
        updatedTime: moment().toDate(),
        userIdUpdated: authMeta.userId,
      });
    }
    return podFilterDetail;
  }

  async createAwbTrouble(authMeta, permissonPayload, awbNumber, troubleDesc, podFilterDetail) {
    const awbTroubleCode = await CustomCounterCode.awbTrouble(
      moment().toDate(),
    );
    const awbTrouble = AwbTrouble.create({
      awbNumber,
      awbTroubleCode,
      troubleCategory: 'awb_filtered',
      troubleDesc,
      awbTroubleStatusId: 100,
      awbStatusId: 12800,
      employeeIdTrigger: authMeta.employeeId,
      branchIdTrigger: permissonPayload.branchId,
      userIdTrigger: authMeta.userId,
      userIdCreated: authMeta.userId,
      branchIdUnclear: podFilterDetail.bagItem.bag.branchId,
      userIdUnclear: null, // TODO: current now, because user on rds is different with tms, UPDATE after SO replace RDS
      employeeIdUnclear: null, // TODO: current now, because employee on rds is different with tms, UPDATE after SO replace RDS
      createdTime: moment().toDate(),
      userIdUpdated: authMeta.userId,
      updatedTime: moment().toDate(),
      userIdPic: authMeta.userId,
      branchIdPic: permissonPayload.branchId,
    });
    return await AwbTrouble.save(awbTrouble);
  }

}
