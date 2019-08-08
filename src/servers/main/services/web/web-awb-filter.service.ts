import { InjectRepository } from '@nestjs/typeorm';
import moment = require('moment');

import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { AwbTrouble } from '../../../../shared/orm-entity/awb-trouble';
import { PodFilter } from '../../../../shared/orm-entity/pod-filter';
import { PodFilterDetail } from '../../../../shared/orm-entity/pod-filter-detail';
import { DistrictRepository } from '../../../../shared/orm-repository/district.repository';
import { PodFilterDetailItemRepository } from '../../../../shared/orm-repository/pod-filter-detail-item.repository';
import { PodFilterDetailRepository } from '../../../../shared/orm-repository/pod-filter-detail.repository';
import { PodFilterRepository } from '../../../../shared/orm-repository/pod-filter.repository';
import { RepresentativeRepository } from '../../../../shared/orm-repository/representative.repository';
import { AuthService } from '../../../../shared/services/auth.service';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { DeliveryService } from '../../../../shared/services/delivery.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import {
  ScanAwbVm,
  WebAwbFilterFinishScanResponseVm,
  WebAwbFilterScanAwbResponseVm,
  WebAwbFilterScanBagResponseVm,
  DistrictVm,
  WebAwbFilterGetLatestResponseVm,
} from '../../models/web-awb-filter-response.vm';
import { WebAwbFilterFinishScanVm, WebAwbFilterScanAwbVm, WebAwbFilterScanBagVm } from '../../models/web-awb-filter.vm';
import { RedisService } from '../../../../shared/services/redis.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { WebAwbFilterListResponseVm } from '../../models/web-awb-filter-list.response.vm';
import { QueryBuilderService } from '../../../../shared/services/query-builder.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { User } from '../../../../shared/orm-entity/user';
import { Branch } from '../../../../shared/orm-entity/branch';

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

  async loadScanFiltered(): Promise<WebAwbFilterGetLatestResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    // find Last Filter for current user and branch scan
    const podFilter = await RepositoryService.podFilter
      .findOne()
      .andWhere(e => e.userIdScan, w => w.equals(authMeta.userId))
      .andWhere(e => e.branchIdScan, w => w.equals(permissonPayload.branchId))
      .andWhere(e => e.isActive, w => w.isTrue())
      .andWhere(e => e.isDeleted, w => w.isFalse())
      .select({
        podFilterId: true,
        representativeIdFilter: true,
        totalBagItem: true,
        podFilterCode: true,
        representative: {
          representativeCode: true,
        },
      }).exec()
    ;

    const response = new WebAwbFilterGetLatestResponseVm();
    const responseData: WebAwbFilterScanBagResponseVm[] = [];
    if (podFilter) {
      const podFilterDetail = await RepositoryService.podFilterDetail.findAll()
        .where(e => e.podFilterId, w => w.equals(podFilter.podFilterId))
        .orderBy({ podFilterDetailId: 'ASC'})
        .select({
          podFilterDetailId: true,
          podFilterId: true,
          bagItemId: true,
          isActive: true,
          bagItem: {
            bagSeq: true,
            bag: {
              bagNumber: true,
            },
          },
        })
        .exec();

      for (const res of podFilterDetail) {
        // retrieve all awb inside bag, then grouping each destination by district (to_id)
        const raw_query = `
          SELECT ab.*, d.district_id, d.district_code, d.district_name
          FROM (
            SELECT awb.to_id, COUNT(1) as count, COUNT(1) FILTER (WHERE is_district_filtered = true) as filtered
            FROM bag_item_awb bia
            INNER JOIN awb_item ai ON ai.awb_item_id = bia.awb_item_id AND ai.is_deleted = false
            INNER JOIN awb_item_attr aia ON aia.awb_item_id = ai.awb_item_id AND ai.is_deleted = false
            INNER JOIN awb ON awb.awb_id = ai.awb_id AND awb.is_deleted = false
            WHERE bia.bag_item_id = '${res.bagItemId}'
            GROUP BY awb.to_id
          ) as ab
          INNER JOIN district d ON d.district_id = ab.to_id
        `;
        const results = await RawQueryService.query(raw_query);
        const data: DistrictVm[] = [];
        for (const result of results) {
          const districtVm = new DistrictVm();
          districtVm.districtId = result.district_id;
          districtVm.districtCode = result.district_code;
          districtVm.districtName = result.district_name;
          districtVm.totalAwb = result.count;
          districtVm.totalFiltered = result.filtered;
          data.push(districtVm);
        }

        const awbFilterScanBag = new WebAwbFilterScanBagResponseVm();
        awbFilterScanBag.bagNumberSeq = res.bagItem.bag.bagNumber + res.bagItem.bagSeq.toString().padStart(3, '0');
        awbFilterScanBag.isActive = res.isActive;
        awbFilterScanBag.totalData = data.length;
        awbFilterScanBag.podFilterCode = podFilter.podFilterCode;
        awbFilterScanBag.podFilterDetailId = res.podFilterDetailId;
        awbFilterScanBag.podFilterId = podFilter.podFilterId;
        awbFilterScanBag.representativeCode = podFilter.representative.representativeCode;
        awbFilterScanBag.bagItemId = res.bagItemId;
        awbFilterScanBag.data = data;
        responseData.push(awbFilterScanBag);
      }
    }
    response.data = responseData;
    return response;
  }

  async scanBag(payload: WebAwbFilterScanBagVm): Promise<WebAwbFilterScanBagResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    // lock bag with current bag number for SCAN FILTERED
    const keyRedis = `hold:awbFiltered:scanBag:${payload.bagNumber}`;
    const holdRedis = await RedisService.locking(
      keyRedis,
      'locking',
    );
    if (!holdRedis) {
      RequestErrorService.throwObj({
        message: `No Gabung Paket ${payload.bagNumber} sedang di Sortir`,
      }, 500);
    }

    // check bagNumber is valid or not
    const bagData = await DeliveryService.validBagNumber(payload.bagNumber);

    // bagNumber not found, then throw error
    if (!bagData) {
      RequestErrorService.throwObj({
        message: `No Gabung Paket ${payload.bagNumber} tidak ditemukan`,
      }, 500);
    }

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
        totalBagItem: true,
        userIdScan: true,
        user: {
          username: true,
        },
        branch: {
          branchName: true,
        },
        representative: {
          representativeCode: true,
        },
      }).exec()
    ;

    if (podFilter) {
      // if exists
      // check previous representative, should be same with current bag, before they finish/clear this podFilter
      if (podFilter.representativeIdFilter != bagData.bag.representativeIdTo) {
        RequestErrorService.throwObj({
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

    // update latest scan to is_active false
    const podFilterDetailActive = await RepositoryService.podFilterDetail
      .findOne()
      .andWhere(e => e.podFilterId, w => w.equals(podFilter.podFilterId))
      .andWhere(e => e.isActive, w => w.isTrue())
      .andWhere(e => e.isDeleted, w => w.isFalse())
    ;
    if (podFilterDetailActive) {
      podFilterDetailActive.isActive = false;
      await podFilterDetailActive.save();
    }

    // check this bag already scan or not
    const podFilterDetail = await this.findAndCreatePodFilterDetail(authMeta, podFilter, bagData);

    // retrieve all awb inside bag, then grouping each destination by district (to_id)
    const raw_query = `
      SELECT awb.to_id, COUNT(1) as count, COUNT(1) FILTER (WHERE is_district_filtered = true) as filtered
      FROM pod_filter_detail pfd
      INNER JOIN bag_item_awb bia ON pfd.bag_item_id = bia.bag_item_id AND pfd.is_deleted = false
      INNER JOIN awb_item ai ON ai.awb_item_id = bia.awb_item_id AND ai.is_deleted = false
      INNER JOIN awb_item_attr aia ON aia.awb_item_id = ai.awb_item_id AND ai.is_deleted = false
      INNER JOIN awb ON awb.awb_id = ai.awb_id AND awb.is_deleted = false
      WHERE pfd.pod_filter_id = '${podFilter.podFilterId}' AND
        bia.bag_item_id = '${bagData.bagItemId}' AND awb.to_type = 40 AND bia.is_deleted = false
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
    response.totalData = data.length;
    response.bagNumberSeq = payload.bagNumber;
    response.isActive = true;
    response.bagItemId = bagData.bagItemId;
    response.podFilterCode = podFilter.podFilterCode;
    response.podFilterId = podFilterDetail.podFilterId;
    response.podFilterDetailId = podFilterDetail.podFilterDetailId;
    response.representativeCode = representative.representativeCode;
    response.data = data;

    // remove key holdRedis
    RedisService.del(keyRedis);

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
      RequestErrorService.throwObj({
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
          // NOTE: posting to awb_history, awb_item_summary
          DoPodDetailPostMetaQueueService.createJobByAwbFilter(
            awbItemAttr.awbItemId,
            permissonPayload.branchId,
            authMeta.userId,
          );
        }
      } else {
        // Unknown Awb, GO TO HELL
        res.status = 'error';
        res.trouble = false;
        res.message = `Resi ${awbNumber} tidak dikenali`;
        res.districtId = null;
        results.push(res);
      }
    } // end loop

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
    payload.fieldFilterManualMap['filteredDateTime'] = true;
    // payload.fieldResolverMap['bagNumber'] = 't2.bag_number';
    // payload.fieldResolverMap['branchIdScan'] = 't3.branch_id';
    // payload.fieldResolverMap['branchNameScan'] = 't3.branch_name';
    // payload.fieldResolverMap['branchNameFrom'] = 't4.branch_name';
    // payload.fieldResolverMap['branchIdFrom'] = 't4.branch_id';
    // payload.fieldResolverMap['employeeName'] = 't5.nickname';

    // mapping search field and operator default ilike
    // payload.globalSearchFields = [
    //   {
    //     field: 'podScaninDateTime',
    //   },
    // ];
    const q = payload.buildQueryBuilder();

    q.select('d.bag_item_id', 'bagItemId')
      .addSelect('d.total_awb', 'totalAwb')
      .addSelect('d.total_awb_filtered', 'totalFiltered')
      .addSelect('(d.total_awb_filtered - total_awb)', 'diffFiltered')
      .addSelect('d.total_awb_not_in_bag', 'moreFiltered')
      .addSelect('d.total_awb_item', 'totalItem')
      .addSelect('CONCAT(b.bag_number, LPAD(bi.bag_seq::text, 3, \'0\'))', 'bagNumberSeq')
      .from(
        subQuery => {
          subQuery
            .select('pfd.pod_filter_detail_id')
            .addSelect('pfd.bag_item_id')
            .addSelect('COUNT(1) as total_awb')
            .addSelect('pfd.total_awb_filtered')
            .addSelect('pfd.total_awb_not_in_bag')
            .addSelect('pfd.total_awb_item')
            .from('pod_filter_detail', 'pfd')
            .innerJoin('bag_item_awb', 'bia', 'bia.bag_item_id = pfd.bag_item_id AND bia.is_deleted = false');

          payload.applyFiltersToQueryBuilder(subQuery, ['filteredDateTime']);

          subQuery.andWhere('pfd.is_deleted = false')
            .groupBy('pfd.pod_filter_detail_id')
            .addGroupBy('pfd.bag_item_id');

          return subQuery;
        },
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
      .andWhere(e => e.bagItemId, w => w.equals(bagData.bagItemId))
      .andWhere(e => e.isDeleted, w => w.isFalse())
      .select({
        podFilterId: true,
      })
    ;

    // if already scan, skip insert into pod_filter_detail
    // this section, to handle when they scan bag_nmber twice
    if (!podFilterDetail) {
      // save to pod_filter_detail for the first time scan
      podFilterDetail = await this.podFilterDetailRepository.create();
      podFilterDetail.bagItemId = bagData.bagItemId;
      podFilterDetail.isActive = true;
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
      podFilter.totalBagItem = podFilter.totalBagItem + 1;
      podFilter.endDateTime = moment().toDate();
      podFilter.updatedTime = moment().toDate();
      podFilter.userIdUpdated = authMeta.userId;
      await podFilter.save();
      // await PodFilter.update(podFilter.podFilterId, {
      //   endDateTime: moment().toDate(),
      //   updatedTime: moment().toDate(),
      //   userIdUpdated: authMeta.userId,
      // });
    } else {
      // if this bag is filtering in another branch and user, block other user and branch to scan the same bag
      if (podFilterDetail.podFilterId === podFilter.podFilterId) {
        podFilterDetail.isActive = true;
        await podFilterDetail.save();
      } else {
        const user = await User.findOne({
          where: {
            userId: podFilter.userIdScan,
          },
        });
        const branch = await Branch.findOne({
          where: {
            branchId: podFilter.branchIdScan,
          },
        });
        RequestErrorService.throwObj({
          message: `Gabung Paket sudah disortir oleh ${user.username} Gerai ${branch.branchName}`,
        }, 500);
      }

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
