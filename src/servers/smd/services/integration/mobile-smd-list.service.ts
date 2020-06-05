import { Injectable, Param, PayloadTooLargeException } from '@nestjs/common';
import moment = require('moment');
import { BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { RedisService } from '../../../../shared/services/redis.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { SysCounter } from '../../../../shared/orm-entity/sys-counter';
import { Bag } from '../../../../shared/orm-entity/bag';
import { ReceivedBag } from '../../../../shared/orm-entity/received-bag';
import { ReceivedBagDetail } from '../../../../shared/orm-entity/received-bag-detail';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemHistory } from '../../../../shared/orm-entity/bag-item-history';
import { ScanOutSmdVehicleResponseVm, ScanOutSmdRouteResponseVm, ScanOutSmdItemResponseVm, ScanOutSmdSealResponseVm, ScanOutListResponseVm, ScanOutHistoryResponseVm, ScanOutSmdHandoverResponseVm, ScanOutSmdDetailResponseVm, ScanOutSmdDetailBaggingResponseVm } from '../../models/scanout-smd.response.vm';
import { HttpStatus } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { QueryBuilderService } from '../../../../shared/services/query-builder.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { WebScanInHubSortListResponseVm } from '../../../main/models/web-scanin-list.response.vm';
import { BAG_STATUS } from '../../../../shared/constants/bag-status.constant';
import { DoSmd } from '../../../../shared/orm-entity/do_smd';
import { DoSmdVehicle } from '../../../../shared/orm-entity/do_smd_vehicle';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';
import { Branch } from '../../../../shared/orm-entity/branch';
import { Representative } from '../../../../shared/orm-entity/representative';
import { Bagging } from '../../../../shared/orm-entity/bagging';
import { BaggingItem } from '../../../../shared/orm-entity/bagging-item';
import { DoSmdDetailItem } from '../../../../shared/orm-entity/do_smd_detail_item';
import { DoSmdHistory } from '../../../../shared/orm-entity/do_smd_history';
import { createQueryBuilder } from 'typeorm';

@Injectable()
export class MobileSmdListService {

  public static async getScanOutMobileList() {

    const authMeta = AuthService.getAuthData();
    const paramUserId =  authMeta.userId;
    const startDate = moment().add(-1, 'days').format('YYYY-MM-DD 00:00:00');
    const endDate = moment().add(1, 'days').format('YYYY-MM-DD 00:00:00');

    const qb = createQueryBuilder();
    qb.addSelect('ds.do_smd_id', 'do_smd_id');
    qb.addSelect('dsd.do_smd_detail_id', 'do_smd_detail_id');
    qb.addSelect('ds.do_smd_code', 'do_smd_code');
    qb.addSelect('ds.departure_schedule_date_time', 'departure_schedule_date_time');
    qb.addSelect('b.branch_name', 'branch_name');
    qb.addSelect('b.address', 'address');
    qb.addSelect('dsd.total_bag', 'total_bag');
    qb.addSelect('dsd.total_bagging', 'total_bagging');
    qb.from('do_smd', 'ds');
    qb.innerJoin(
      'do_smd_detail',
      'dsd',
      'ds.do_smd_id = dsd.do_smd_id and dsd.is_deleted = false ',
    );
    qb.innerJoin(
      'do_smd_vehicle',
      'dsv',
      'ds.vehicle_id_last = dsv.do_smd_vehicle_id  and dsv.is_deleted = false',
    );
    qb.leftJoin(
      'users',
      'u',
      'dsv.employee_id_driver = u.employee_id and u.is_deleted = false',
    );
    qb.leftJoin(
      'branch',
      'b',
      'dsd.branch_id_to = b.branch_id and b.is_deleted = false',
    );
    qb.where(
      'ds.departure_schedule_date_time >= :startDate',
      {
        startDate,
      },
    );
    qb.andWhere(
      'ds.departure_schedule_date_time < :endDate',
      {
        endDate,
      },
    );
    qb.andWhere(
      'u.user_id = :paramUserId',
      {
        paramUserId,
      },
    );
    qb.andWhere('ds.do_smd_status_id_last <>  6000');
    qb.andWhere('ds.is_deleted = false');
    return await qb.getRawMany();
  }

  public static async getScanOutMobileListDetail(do_smd_detail_id?: number) {

    const authMeta = AuthService.getAuthData();
    const paramUserId =  authMeta.userId;
    const startDate = moment().add(-1, 'days').format('YYYY-MM-DD 00:00:00');
    const endDate = moment().add(1, 'days').format('YYYY-MM-DD 00:00:00');

    const qb = createQueryBuilder();
    qb.addSelect('dsd.do_smd_detail_id', 'do_smd_detail_id');
    qb.addSelect('ds.do_smd_code', 'do_smd_code');
    qb.addSelect('ds.departure_schedule_date_time', 'departure_schedule_date_time');
    qb.addSelect('b.branch_name', 'branch_name');
    qb.addSelect('b.address', 'address');
    qb.addSelect('dsd.total_bag', 'total_bag');
    qb.addSelect('dsd.total_bagging', 'total_bagging');
    qb.from('do_smd', 'ds');
    qb.innerJoin(
      'do_smd_detail',
      'dsd',
      'ds.do_smd_id = dsd.do_smd_id and dsd.is_deleted = false ',
    );
    qb.innerJoin(
      'do_smd_vehicle',
      'dsv',
      'ds.vehicle_id_last = dsv.do_smd_vehicle_id  and dsv.is_deleted = false',
    );
    qb.leftJoin(
      'users',
      'u',
      'dsv.employee_id_driver = u.employee_id and u.is_deleted = false',
    );
    qb.leftJoin(
      'branch',
      'b',
      'dsd.branch_id_to = b.branch_id and b.is_deleted = false',
    );
    qb.where(
      'ds.departure_schedule_date_time >= :startDate',
      {
        startDate,
      },
    );
    qb.andWhere(
      'ds.departure_schedule_date_time < :endDate',
      {
        endDate,
      },
    );
    qb.andWhere(
      'u.user_id = :paramUserId',
      {
        paramUserId,
      },
    );
    qb.andWhere(
      'dsd.do_smd_detail_id = :do_smd_detail_id',
      {
        do_smd_detail_id,
      },
    );
    qb.andWhere('ds.do_smd_status_id_last <>  6000');
    qb.andWhere('ds.is_deleted = false');
    return await qb.getRawMany();
  }

  public static async getScanOutMobileListDetailBag(do_smd_detail_id?: number) {

    const authMeta = AuthService.getAuthData();
    const paramUserId =  authMeta.userId;
    const startDate = moment().add(-1, 'days').format('YYYY-MM-DD 00:00:00');
    const endDate = moment().add(1, 'days').format('YYYY-MM-DD 00:00:00');

    const qb = createQueryBuilder();
    qb.addSelect('dsdi.do_smd_detail_id', 'do_smd_detail_id');
    qb.addSelect('b.bag_id', 'bag_id');
    qb.addSelect(`CONCAT(b.bag_number, LPAD(CONCAT('', bi.bag_seq), 3, '0'))`, 'bag_number');
    qb.from('do_smd_detail_item', 'dsdi');
    qb.innerJoin(
      'do_smd_detail',
      'dsd',
      'dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsd.is_deleted = FALSE',
    );
    qb.innerJoin(
      'bag',
      'b',
      'dsdi.bag_id = b.bag_id AND b.is_deleted = FALSE',
    );
    qb.innerJoin(
      'bag_item',
      'bi',
      'b.bag_id = bi.bag_id AND bi.is_deleted = FALSE',
    );
    qb.where(
      'dsdi.do_smd_detail_id = :do_smd_detail_id',
      {
        do_smd_detail_id,
      },
    );
    qb.andWhere('dsdi.bag_type = 1');
    qb.andWhere('dsdi.is_deleted = false');
    return await qb.getRawMany();
  }

  public static async getScanOutMobileListDetailBagging(do_smd_detail_id?: number) {

    const qb = createQueryBuilder();
    qb.select('d.bagging_id', 'bagging_id')
      .addSelect('bg.bagging_code', 'bagging_number')
      .addSelect('d.do_smd_detail_id', 'do_smd_detail_id')
      .from(subQuery => {
        subQuery
          .select('dsdi.bagging_id')
          .addSelect('dsd.do_smd_detail_id')
          .from('do_smd_detail_item', 'dsdi')
          .innerJoin(
            'do_smd_detail',
            'dsd',
            'dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsd.is_deleted = FALSE',
          );

        subQuery
          .andWhere('dsdi.bag_type = 0')
          .andWhere('dsdi.is_deleted = false')
          .andWhere('dsdi.do_smd_detail_id = :do_smd_detail_id',
            {
              do_smd_detail_id,
            },
          )
          .groupBy('dsdi.bagging_id')
          .addGroupBy('dsd.do_smd_detail_id');

        return subQuery;
      }, 'd')
      .innerJoin(
        'bagging',
        'bg',
        'bg.bagging_id = d.bagging_id AND bg.is_deleted = FALSE',
      );
    return await qb.getRawMany();
  }

  public static async getScanOutMobileListHistory() {

    const authMeta = AuthService.getAuthData();
    const paramUserId =  authMeta.userId;
    const startDate = moment().add(-1, 'days').format('YYYY-MM-DD 00:00:00');
    const endDate = moment().add(1, 'days').format('YYYY-MM-DD 00:00:00');

    const qb = createQueryBuilder();
    qb.addSelect('ds.do_smd_id', 'do_smd_id');
    qb.addSelect('dsd.do_smd_detail_id', 'do_smd_detail_id');
    qb.addSelect('ds.do_smd_code', 'do_smd_code');
    qb.addSelect('ds.departure_schedule_date_time', 'departure_schedule_date_time');
    qb.addSelect('b.branch_name', 'branch_name');
    qb.addSelect('b.address', 'address');
    qb.addSelect('dsd.total_bag', 'total_bag');
    qb.addSelect('dsd.total_bagging', 'total_bagging');
    qb.from('do_smd', 'ds');
    qb.innerJoin(
      'do_smd_detail',
      'dsd',
      'ds.do_smd_id = dsd.do_smd_id and dsd.is_deleted = false ',
    );
    qb.innerJoin(
      'do_smd_vehicle',
      'dsv',
      'ds.vehicle_id_last = dsv.do_smd_vehicle_id  and dsv.is_deleted = false',
    );
    qb.leftJoin(
      'users',
      'u',
      'dsv.employee_id_driver = u.employee_id and u.is_deleted = false',
    );
    qb.leftJoin(
      'branch',
      'b',
      'dsd.branch_id_to = b.branch_id and b.is_deleted = false',
    );
    qb.where(
      'ds.departure_schedule_date_time >= :startDate',
      {
        startDate,
      },
    );
    qb.andWhere(
      'ds.departure_schedule_date_time < :endDate',
      {
        endDate,
      },
    );
    qb.andWhere(
      'u.user_id = :paramUserId',
      {
        paramUserId,
      },
    );
    qb.andWhere('ds.is_deleted = false');
    return await qb.getRawMany();
  }

}
