// #region import
import { HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createQueryBuilder } from 'typeorm';
import { sumBy } from 'lodash';
import moment = require('moment');

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { AwbTrouble } from '../../../../shared/orm-entity/awb-trouble';
import { Branch } from '../../../../shared/orm-entity/branch';
import { PodFilter } from '../../../../shared/orm-entity/pod-filter';
import { PodFilterDetail } from '../../../../shared/orm-entity/pod-filter-detail';
import { User } from '../../../../shared/orm-entity/user';
import { PodFilterDetailItemRepository } from '../../../../shared/orm-repository/pod-filter-detail-item.repository';
import { PodFilterDetailRepository } from '../../../../shared/orm-repository/pod-filter-detail.repository';
import { PodFilterRepository } from '../../../../shared/orm-repository/pod-filter.repository';
import { RepresentativeRepository } from '../../../../shared/orm-repository/representative.repository';
import { AuthService } from '../../../../shared/services/auth.service';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { DeliveryService } from '../../../../shared/services/delivery.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { QueryBuilderService } from '../../../../shared/services/query-builder.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import { WebAwbFilterListResponseVm } from '../../models/web-awb-filter-list.response.vm';
import {
  DistrictVm,
  ScanAwbVm,
  WebAwbFilterFinishScanResponseVm,
  WebAwbFilterGetLatestResponseVm,
  WebAwbFilterScanAwbResponseVm,
  WebAwbFilterScanBagResponseVm,
  AwbProblemFilterVm,
} from '../../models/web-awb-filter-response.vm';
import {
  WebAwbFilterFinishScanVm,
  WebAwbFilterScanAwbVm,
  WebAwbFilterScanBagVm,
} from '../../models/web-awb-filter.vm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { District } from '../../../../shared/orm-entity/district';
// #endregion
export class WebAwbFilterService {
  constructor(
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
      })
      .exec();

    const response = new WebAwbFilterGetLatestResponseVm();
    const responseData: WebAwbFilterScanBagResponseVm[] = [];
    let awbProblems = [];
    if (podFilter) {
      const podFilterDetail = await RepositoryService.podFilterDetail
        .findAll()
        .where(e => e.podFilterId, w => w.equals(podFilter.podFilterId))
        .orderBy({ podFilterDetailId: 'ASC' })
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

      // TODO: need refactoring data
      for (const res of podFilterDetail) {
        // retrieve all awb inside bag, then grouping each destination by district (to_id)
        const data: DistrictVm[] = await this.getDataRawDestination(
          res.podFilterDetailId,
          res.bagItemId,
        );

        const awbFilterScanBag = new WebAwbFilterScanBagResponseVm();
        awbFilterScanBag.bagNumberSeq =
          res.bagItem.bag.bagNumber +
          res.bagItem.bagSeq.toString().padStart(3, '0');
        awbFilterScanBag.isActive = res.isActive;
        awbFilterScanBag.totalData = data.length;
        awbFilterScanBag.totalAwb = sumBy(data, x => Number(x.totalAwb));
        awbFilterScanBag.totalFiltered = sumBy(data, x =>
          Number(x.totalFiltered),
        );
        awbFilterScanBag.totalScan = sumBy(data, x =>
          Number(x.totalScan),
        );
        awbFilterScanBag.totalProblem = sumBy(data, x => Number(x.totalProblem));
        awbFilterScanBag.podFilterCode = podFilter.podFilterCode;
        awbFilterScanBag.podFilterDetailId = res.podFilterDetailId;
        awbFilterScanBag.podFilterId = podFilter.podFilterId;
        awbFilterScanBag.representativeId = podFilter.representativeIdFilter;
        awbFilterScanBag.representativeCode =
          podFilter.representative.representativeCode;
        awbFilterScanBag.bagItemId = res.bagItemId;
        awbFilterScanBag.data = data;
        responseData.push(awbFilterScanBag);
      }

      // get data problem
      awbProblems = await this.getDataProblem(podFilter.podFilterId);
    }
    response.awbProblems = awbProblems;
    response.data = responseData;
    return response;
  }

  async scanBag(
    payload: WebAwbFilterScanBagVm,
  ): Promise<WebAwbFilterScanBagResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    let representativeCode;

    // lock bag with current bag number for SCAN FILTERED
    const keyRedis = `hold:awbFiltered:scanBag:${payload.bagNumber}`;
    const holdRedis = await RedisService.locking(keyRedis, 'locking');
    if (!holdRedis) {
      RequestErrorService.throwObj(
        {
          message: `No Gabung Paket ${payload.bagNumber} sedang di Sortir`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // check bagNumber is valid or not
    const bagData = await DeliveryService.validBagNumber(payload.bagNumber);

    // bagNumber not found, then throw error
    if (!bagData) {
      RequestErrorService.throwObj(
        {
          message: `No Gabung Paket ${payload.bagNumber} tidak ditemukan`,
        },
        HttpStatus.BAD_REQUEST,
      );
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
        branchIdScan: true,
        representative: {
          representativeCode: true,
        },
      })
      .exec();

    if (podFilter) {
      // if exists
      // check previous representative, should be same with current bag, before they finish/clear this podFilter
      if (podFilter.representativeIdFilter != bagData.bag.representativeIdTo) {
        RequestErrorService.throwObj(
          {
            message: `Perwakilan berbeda. Harap selesaikan dahulu Perwakilan ${
              podFilter.representative.representativeCode
            }`,
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        // just update end_date_time that indicate scan this bag still in progress
        await PodFilter.update(podFilter.podFilterId, {
          endDateTime: moment().toDate(),
          updatedTime: moment().toDate(),
          userIdUpdated: authMeta.userId,
        });
      }
      representativeCode = podFilter.representative.representativeCode;
    } else {
      // if not exists, create new one
      podFilter = await this.createPodFilter(bagData.bag.representativeIdTo);
      // get representative code, to inform frontend current active representative
      const representative = await this.representativeRepository.findOne({
        where: {
          representativeId: bagData.bag.representativeIdTo,
        },
      });
      representativeCode = representative ? representative.representativeCode : '';
    }

    // update latest scan to is_active false
    const podFilterDetailActive = await RepositoryService.podFilterDetail
      .findOne()
      .andWhere(e => e.podFilterId, w => w.equals(podFilter.podFilterId))
      .andWhere(e => e.isActive, w => w.isTrue())
      .andWhere(e => e.isDeleted, w => w.isFalse());
    if (podFilterDetailActive) {
      await this.podFilterDetailRepository.update(
        podFilterDetailActive.podFilterId,
        {
          isActive: false,
        },
      );
    }

    // check this bag already scan or not
    const podFilterDetail = await this.findAndCreatePodFilterDetail(
      podFilter,
      bagData.bagItemId,
    );

    // retrieve all awb inside bag, then grouping each destination by district (to_id)
    const data = await this.getDataRawDestination(
      podFilterDetail.podFilterDetailId,
      podFilterDetail.bagItemId,
    );

    const response = new WebAwbFilterScanBagResponseVm();
    response.totalData = data.length;
    response.bagNumberSeq = payload.bagNumber;
    response.isActive = true;
    response.bagItemId = bagData.bagItemId;
    response.podFilterCode = podFilter.podFilterCode;
    response.podFilterId = podFilterDetail.podFilterId;
    response.podFilterDetailId = podFilterDetail.podFilterDetailId;
    response.representativeId = podFilter.representativeIdFilter;
    response.representativeCode = representativeCode;

    response.data = data;

    // remove key holdRedis
    RedisService.del(keyRedis);

    return response;
  }

  async scanAwb(
    payload: WebAwbFilterScanAwbVm,
  ): Promise<WebAwbFilterScanAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const results: ScanAwbVm[] = [];
    let bagNumberSeq = '';
    // get all awb_number from payload
    for (const awbNumber of payload.awbNumber) {
      const res = new ScanAwbVm();
      res.districtName = '';
      // find each awb_number
      const awbItemAttr = await RepositoryService.awbItemAttr
        .findOne()
        .andWhere(e => e.awbNumber, w => w.equals(awbNumber))
        .andWhere(e => e.isDeleted, w => w.isFalse())
        .select({
          awbItemId: true,
          awbItemAttrId: true,
          // isDistrictFiltered: true,
          bagItemIdLast: true,
          branchIdNext: true,
          awbItem: {
            awbItemId: true, // needs to be selected due to awbItem relations are being selected
            awb: {
              toType: true,
              toId: true,
            },
          },
        });

      if (awbItemAttr) {
        if (true) {
          // this awb is already filtered
          res.status = 'error';
          res.trouble = false;
          res.message = `Resi ${awbNumber} sudah tersortir`;
          res.districtId = awbItemAttr.awbItem.awb.toId;
        } else {
          // check payload.podFilterDetailId is valid or not
          let awbTroubleId = null;
          let podFilterDetail = await this.getPodFilterDetail(
            payload.podFilterId,
            awbItemAttr.bagItemIdLast,
          );

          // NOTE: check awb include on bag item
          if (podFilterDetail) {
            // no error, this awb is fine
            res.status = 'success';
            res.trouble = false;
            res.message = `Resi ${awbNumber} berhasil tersortir`;
            res.districtId = awbItemAttr.awbItem.awb.toId;
          } else {
            // check payload.podFilterDetailId current
            podFilterDetail = await this.getCurrentPodFilterDetail(
              payload.podFilterDetailId,
            );

            // response error, but still process sortir, just announce for CT this awb have a trouble package combine
            res.status = 'success';
            res.trouble = true;
            if (!!awbItemAttr.awbItem.awb.toId) {
              // NOTE: get data district
              const getDistrict = await District.findOne({
                // cache: true,
                where: {
                  districtId: awbItemAttr.awbItem.awb.toId,
                  isDeleted: false,
                },
              });

              res.districtId = awbItemAttr.awbItem.awb.toId;
              res.districtName = getDistrict ? getDistrict.districtName : '';
              res.message = `Resi ${awbNumber} berhasil tersortir, tetapi tidak ada pada Gabung Paket`;
            } else {
              res.message = `Resi ${awbNumber} tidak memiliki tujuan, harap di lengkapi`;
              res.districtId = null;
            }
            // announce for CT using table awb_trouble and the category of trouble is awb_filter
            // save data to awb_trouble
            awbTroubleId = await this.createAwbTrouble(
              awbNumber,
              res.message,
              podFilterDetail.bagItem.bag.branchId,
            );
          }
          // bag number
          bagNumberSeq =
            `${podFilterDetail.bagItem.bag.bagNumber}` +
            `${podFilterDetail.bagItem.bagSeq.toString().padStart(3, '0')}`;

          // Update total_awb_filtered, total_awb_item, total_awb_not_in_bag
          const keyRedis = `hold:awbfiltered:${
            podFilterDetail.podFilterDetailId
          }`;
          const holdRedis = await RedisService.locking(keyRedis, 'locking');
          if (holdRedis) {
            // save to pod_filter_detail_item
            await this.createPodFilterDetailItem(
              podFilterDetail.podFilterDetailId,
              awbItemAttr,
              awbTroubleId,
            );

            // NOTE:: update awb_item_attr last to IN
            // await AwbItemAttr.update(awbItemAttr.awbItemAttrId, {
            //   isDistrictFiltered: true,
            // });

            await DeliveryService.updateAwbAttr(
              awbItemAttr.awbItemId,
              awbItemAttr.branchIdNext,
              AWB_STATUS.IN_BRANCH,
            );

            podFilterDetail.totalAwbItem = podFilterDetail.totalAwbItem + 1;
            if (awbItemAttr.bagItemIdLast) {
              podFilterDetail.totalAwbFiltered =
                podFilterDetail.totalAwbFiltered + 1;
            } else {
              podFilterDetail.totalAwbNotInBag =
                podFilterDetail.totalAwbNotInBag + 1;
            }
            podFilterDetail.endDateTime = moment().toDate();
            podFilterDetail.updatedTime = moment().toDate();
            podFilterDetail.userIdUpdated = authMeta.userId;
            await RepositoryService.podFilterDetail.save(podFilterDetail);

            // remove key holdRedis
            RedisService.del(keyRedis);
          }

          // after scan filter done at all. do posting status last awb
          // NOTE: posting to awb_history, awb_item_summary
          DoPodDetailPostMetaQueueService.createJobByAwbFilter(
            awbItemAttr.awbItemId,
            permissonPayload.branchId,
            authMeta.userId,
          );
        }
      } else {
        res.status = 'error';
        res.trouble = false;
        res.message = `Resi ${awbNumber} tidak dikenali`;
        res.districtId = null;
      }
      // push item
      results.push({
        awbNumber,
        ...res,
      });
    } // end loop

    // Populate return value
    const response = new WebAwbFilterScanAwbResponseVm();
    response.totalData = results.length;
    response.bagNumber = bagNumberSeq;
    response.data = results;

    return response;
  }

  async finishScan(
    payload: WebAwbFilterFinishScanVm,
  ): Promise<WebAwbFilterFinishScanResponseVm> {
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
  async findAllAwbSortirList(
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
      .addSelect(
        'CONCAT(b.bag_number, LPAD(bi.bag_seq::text, 3, \'0\'))',
        'bagNumberSeq',
      )
      .addSelect('d.is_active', 'isActive')
      .from(subQuery => {
        subQuery
          .select('pfd.pod_filter_detail_id')
          .addSelect('pfd.bag_item_id')
          .addSelect('COUNT(1) as total_awb')
          .addSelect('pfd.total_awb_filtered')
          .addSelect('pfd.total_awb_not_in_bag')
          .addSelect('pfd.total_awb_item')
          .addSelect('BOOL_AND(pf.is_active) as is_active')
          .from('pod_filter_detail', 'pfd')
          .innerJoin(
            'pod_filter',
            'pf',
            'pf.pod_filter_id = pfd.pod_filter_id AND pf.is_deleted = false',
          )
          .innerJoin(
            'bag_item_awb',
            'bia',
            'bia.bag_item_id = pfd.bag_item_id AND bia.is_deleted = false',
          );

        payload.applyFiltersToQueryBuilder(subQuery, ['filteredDateTime']);

        subQuery
          .andWhere('pfd.is_deleted = false')
          .groupBy('pfd.pod_filter_detail_id')
          .addGroupBy('pfd.bag_item_id');

        return subQuery;
      }, 'd')
      .innerJoin(
        'bag_item',
        'bi',
        'bi.bag_item_id = d.bag_item_id AND bi.is_deleted = false',
      )
      .innerJoin('bag', 'b', 'b.bag_id = bi.bag_id AND bi.is_deleted = false');

    const total = await QueryBuilderService.count(q, '1');
    payload.applyRawPaginationToQueryBuilder(q);
    const data = await q.getRawMany();

    const result = new WebAwbFilterListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
  private async createPodFilter(representativeIdTo: number) {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const podFilter = this.podFilterRepository.create();

    podFilter.representativeIdFilter = representativeIdTo;
    podFilter.isActive = true;
    podFilter.podFilterCode = await CustomCounterCode.podFilter(
      moment().toDate(),
    );
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

  private async createPodFilterDetailItem(
    podFilterDetailId: number,
    awbItemAttr: AwbItemAttr,
    awbTroubleId = null,
  ) {
    const authMeta = AuthService.getAuthData();
    const podFilterDetailItem = this.podFilterDetailItemRepository.create();

    podFilterDetailItem.podFilterDetailId = podFilterDetailId;
    podFilterDetailItem.scanDateTime = moment().toDate();
    podFilterDetailItem.awbItemId = awbItemAttr.awbItemId;
    podFilterDetailItem.toType = awbItemAttr.awbItem.awb.toType;
    podFilterDetailItem.toId = awbItemAttr.awbItem.awb.toId;
    podFilterDetailItem.createdTime = moment().toDate();
    podFilterDetailItem.userIdCreated = authMeta.userId;
    podFilterDetailItem.updatedTime = moment().toDate();
    podFilterDetailItem.userIdUpdated = authMeta.userId;

    if (awbTroubleId) {
      podFilterDetailItem.isTroubled = true;
      podFilterDetailItem.awbTroubleId = awbTroubleId;
    } else {
      podFilterDetailItem.isTroubled = false;
    }
    return await this.podFilterDetailItemRepository.save(podFilterDetailItem);
  }

  private async findAndCreatePodFilterDetail(podFilter, bagItemId) {
    const authMeta = AuthService.getAuthData();
    // check this bag already scan or not
    let podFilterDetail = await RepositoryService.podFilterDetail
      .findOne()
      .andWhere(e => e.bagItemId, w => w.equals(bagItemId))
      .andWhere(e => e.isDeleted, w => w.isFalse())
      .select({
        podFilterDetailId: true,
        podFilterId: true,
      });

    // if already scan, skip insert into pod_filter_detail
    // this section, to handle when they scan bag_nmber twice
    if (!podFilterDetail) {
      // save to pod_filter_detail for the first time scan
      podFilterDetail = await this.podFilterDetailRepository.create();
      podFilterDetail.bagItemId = bagItemId;
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
        await this.podFilterDetailRepository.update(
          podFilterDetail.podFilterId,
          {
            isActive: true,
          },
        );
      } else {
        const user = await User.findOne({
          where: {
            userId: podFilter.userIdScan,
          },
          select: ['username', 'userId'],
        });
        const branch = await Branch.findOne({
          where: {
            branchId: podFilter.branchIdScan,
          },
          select: ['branchName'],
        });
        RequestErrorService.throwObj(
          {
            message: `Gabung Paket sudah disortir oleh ${user.username} Gerai ${
              branch.branchName
            }`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return podFilterDetail;
  }

  private async createAwbTrouble(
    awbNumber: string,
    troubleDesc: string,
    bagBranchId: number,
  ) {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const awbTroubleCode = await CustomCounterCode.awbTrouble(
      moment().toDate(),
    );
    const awbTrouble = AwbTrouble.create({
      awbNumber,
      awbTroubleCode,
      troubleCategory: 'awb_filtered',
      troubleDesc,
      transactionStatusId: 100,
      awbStatusId: 12800,
      employeeIdTrigger: authMeta.employeeId,
      branchIdTrigger: permissonPayload.branchId,
      userIdTrigger: authMeta.userId,
      userIdCreated: authMeta.userId,
      branchIdUnclear: bagBranchId, // podFilterDetail.bagItem.bag.branchId
      userIdUnclear: null, // TODO: current now, because user on rds is different with tms, UPDATE after SO replace RDS
      employeeIdUnclear: null, // TODO: current now, because employee on rds is different with tms, UPDATE after SO replace RDS
      createdTime: moment().toDate(),
      userIdUpdated: authMeta.userId,
      updatedTime: moment().toDate(),
      userIdPic: authMeta.userId,
      branchIdPic: permissonPayload.branchId,
    });
    await AwbTrouble.save(awbTrouble);
    return awbTrouble.awbTroubleId;
  }

  // NOTE: need refactoring
  private async getDataGroupByDestination(
    podFilterDetailId: number,
  ) {
    // TODO: need join query full outer join for combine data
    // refactoring get data !!
    const qb = createQueryBuilder();
    qb.addSelect('district.district_id', 'districtId');
    qb.addSelect('district.district_code', 'districtCode');
    qb.addSelect('district.district_name', 'districtName');
    qb.addSelect('packages.total_awb', 'totalAwb');
    qb.addSelect('packages.total', 'totalScan');
    qb.addSelect('packages.filtered', 'totalFiltered');
    qb.addSelect('packages.problem', 'totalProblem');
    qb.from(subQueryBuilder => {
      subQueryBuilder
        .addSelect('p1.*')
        .addSelect('COALESCE(p2.total, 0)', 'total')
        .addSelect('COALESCE(p2.filtered, 0)', 'filtered')
        .addSelect('COALESCE(p2.problem, 0)', 'problem')
        .from(subQueryBuilder2 => {
          subQueryBuilder2
            .addSelect('awb.to_id', 'to_id')
            .addSelect('COUNT(1)', 'total_awb')
            .from('pod_filter_detail', 'pfd')
            .innerJoin(
              'bag_item_awb',
              'bia',
              'pfd.bag_item_id = bia.bag_item_id AND pfd.is_deleted = false AND bia.is_deleted = false',
            )
            .innerJoin(
              'awb_item',
              'ai',
              'ai.awb_item_id = bia.awb_item_id AND ai.is_deleted = false',
            )
            .innerJoin(
              'awb_item_attr',
              'aia',
              'aia.awb_item_id = ai.awb_item_id AND ai.is_deleted = false',
            )
            .innerJoin(
              'awb',
              'awb',
              'awb.awb_id = ai.awb_id AND awb.is_deleted = false AND awb.to_type = 40',
            )
            .where('pfd.pod_filter_detail_id = :podFilterDetailId', {
              podFilterDetailId,
            })
            .groupBy('awb.to_id');
          return subQueryBuilder2;
        }, 'p1')
        .leftJoin(
          sub => {
            sub
              .addSelect('pfdi.to_id', 'to_id')
              .addSelect('COUNT(1)', 'total')
              .addSelect(
                'COUNT(1) FILTER (WHERE is_troubled = false)',
                'filtered',
              )
              .addSelect(
                'COUNT(1) FILTER (WHERE is_troubled = true)',
                'problem',
              )
              .from('pod_filter_detail', 'pfd')
              .innerJoin(
                'pod_filter_detail_item',
                'pfdi',
                `pfd.pod_filter_detail_id = pfdi.pod_filter_detail_id ` +
                  `AND pfdi.is_deleted = false AND pfdi.to_id IS NOT NULL`,
              )
              .where('pfd.pod_filter_detail_id = :podFilterDetailId', {
                podFilterDetailId,
              })
              .groupBy('pfdi.to_id');
            return sub;
          },
          'p2',
          'p1.to_id = p2.to_id',
        );

      return subQueryBuilder;
    }, 'packages').leftJoin(
      'district',
      'district',
      'packages.to_id = district.district_id AND district.is_deleted = false',
    );
    return await qb.getRawMany();
  }

  private async getDataRawDestination(
    podFilterDetailId: number,
    bagItemId: number,
  ) {
    const rawQuery = `
      SELECT district.district_id  AS "districtId",
            district.district_code AS "districtCode",
            district.district_name AS "districtName",
            packages.total_awb     AS "totalAwb",
            packages.filtered      AS "totalFiltered",
            packages.trouble       AS "totalProblem",
            packages.total         AS "totalScan"
      FROM (
            SELECT COALESCE(p1.to_id, p2.to_id) AS to_id,
                  COALESCE(p1.total_awb, 0)     AS total_awb,
                  COALESCE(p2.total, 0)         AS total,
                  COALESCE(p2.filtered, 0)      AS filtered,
                  COALESCE(p2.trouble, 0)       AS trouble
            FROM (SELECT awb.to_id AS "to_id", COUNT(1) AS "total_awb"
                  FROM "public"."bag_item_awb" "bia"
                        INNER JOIN "public"."awb_item" "ai"
                          ON ai.awb_item_id = bia.awb_item_id
                          AND ai.is_deleted = false
                        INNER JOIN "public"."awb" "awb" ON awb.awb_id = ai.awb_id AND awb.is_deleted = false
                          AND awb.to_type = 40
                  WHERE bia.bag_item_id = ${bagItemId} AND bia.is_deleted = false
                  GROUP BY awb.to_id) "p1"
                  FULL OUTER JOIN (
                            SELECT pfdi.to_id                                 AS "to_id",
                                  COUNT(1)                                    AS "total",
                                  COUNT(1) FILTER (WHERE is_troubled = false) AS "filtered",
                                  COUNT(1) FILTER (WHERE is_troubled = true)  AS "trouble"
                            FROM "public"."pod_filter_detail" "pfd"
                                  INNER JOIN "public"."pod_filter_detail_item" "pfdi"
                                    ON pfd.pod_filter_detail_id = pfdi.pod_filter_detail_id AND
                                      pfdi.to_id IS NOT NULL
                            WHERE pfd.pod_filter_detail_id = ${podFilterDetailId}
                            GROUP BY pfdi.to_id
                  ) "p2" ON p1.to_id = p2.to_id
          ) "packages"
      LEFT JOIN "public"."district" "district" ON packages.to_id = district.district_id
        AND district.is_deleted = false;
    `;
    return await RawQueryService.query(rawQuery);
  }

  private async getPodFilterDetail(
    podFilterId: number,
    bagItemId: number,
  ): Promise<PodFilterDetail> {
    // check payload.podFilterDetailId is valid or not
    const podFilterDetail = await RepositoryService.podFilterDetail
      .findOne()
      .where(e => e.podFilterId, w => w.equals(podFilterId))
      .andWhere(e => e.bagItemId, w => w.equals(bagItemId))
      .andWhere(e => e.isDeleted, w => w.isFalse())
      .select({
        podFilterDetailId: true,
        bagItemId: true,
        totalAwbItem: true,
        totalAwbFiltered: true,
        totalAwbNotInBag: true,
        bagItem: {
          bagId: true,
          bagSeq: true,
          bag: {
            branchId: true,
            userId: true,
            bagNumber: true,
          },
        },
      });

    return podFilterDetail;
  }

  private async getCurrentPodFilterDetail(
    podFilterDetailId: number,
  ): Promise<PodFilterDetail> {
    // check payload.podFilterDetailId is valid or not
    const podFilterDetail = await RepositoryService.podFilterDetail
      .findOne()
      .where(e => e.podFilterDetailId, w => w.equals(podFilterDetailId))
      .andWhere(e => e.isDeleted, w => w.isFalse())
      .select({
        podFilterDetailId: true,
        bagItemId: true,
        totalAwbItem: true,
        totalAwbFiltered: true,
        totalAwbNotInBag: true,
        bagItem: {
          bagId: true,
          bagSeq: true,
          bag: {
            branchId: true,
            userId: true,
            bagNumber: true,
          },
        },
      });

    if (!podFilterDetail) {
      RequestErrorService.throwObj(
        {
          message: `Invalid podFilterDetailId`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return podFilterDetail;
  }

  private async getDataProblem(podFilterId: number): Promise<AwbProblemFilterVm[]> {
    const qb = createQueryBuilder();
    qb.addSelect('aia.awb_number', 'awbNumber');
    qb.addSelect('pfi.pod_filter_detail_item_id', 'podFilterDetailItemId');
    qb.addSelect('pfi.awb_item_id', 'awbItemId');

    qb.from('pod_filter_detail', 'pfd');
    qb.innerJoin(
      'pod_filter_detail_item',
      'pfi',
      `pfi.pod_filter_detail_id = pfd.pod_filter_detail_id AND pfi.is_troubled = true ` +
        `AND pfi.is_deleted = false AND pfi.to_id IS NULL`,
    );
    qb.innerJoin(
      'awb_item_attr',
      'aia',
      'pfi.awb_item_id = aia.awb_item_id AND aia.is_deleted = false',
    );
    qb.where(
      'pfd.pod_filter_id = :podFilterId AND pfd.is_deleted = false',
      {
        podFilterId,
      },
    );
    const result = await qb.getRawMany();
    const response: AwbProblemFilterVm[] = [];
    if (result) {
      for (const item of result) {
        const data = {
          districtId: null,
          message: `Resi ${item.awbNumber} tidak memiliki tujuan, harap di lengkapi`,
        };
        response.push({...item, ...data});
      }
    }
    return response;
  }
}