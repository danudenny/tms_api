import { Injectable, Param, PayloadTooLargeException, HttpStatus } from '@nestjs/common';
import moment = require('moment');
import { BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { RedisService } from '../../../../shared/services/redis.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { QueryBuilderService } from '../../../../shared/services/query-builder.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';
import { ScanInSmdListResponseVm, ScanInSmdDetailResponseVm } from '../../models/scanin-smd-list.response.vm';
import { AuthService } from '../../../../shared/services/auth.service';
import { DoSmd } from '../../../../shared/orm-entity/do_smd';

@Injectable()
export class ScaninSmdListService {
  static async findScanInList(
    payload: BaseMetaPayloadVm,
  ): Promise<ScanInSmdListResponseVm> {

    payload.fieldResolverMap['departure_schedule_date_time'] = 'dsd.departure_schedule_date_time';
    payload.fieldResolverMap['branch_id_from'] = 'dsd.branch_id_from';
    payload.fieldResolverMap['branch_id_to'] = 'dsd.branch_id_to';

    payload.globalSearchFields = [
      {
        field: 'departure_schedule_date_time',
      },
      {
        field: 'branch_id_from',
      },
      {
        field: 'branch_id_to',
      },
    ];

    const repo = new OrionRepositoryService(DoSmdDetail, 'dsd');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      ['dsd.do_smd_detail_id', 'do_smd_detail_id'],
      ['ds.do_smd_code', 'do_smd_code'],
      ['dsd.departure_schedule_date_time', 'departure_schedule_date_time'],
      ['dsd.arrival_time', 'arrival_time'],
      ['e.fullname', 'fullname'],
      ['dsv.vehicle_number', 'vehicle_number'],
      ['bf.branch_name', 'branch_from_name'],
      ['bt.branch_name', 'branch_to_name'],
      ['ds.total_bag', 'total_bag'],
      ['ds.total_bagging', 'total_bagging'],
    );

    q.innerJoinRaw(
      'do_smd',
      'ds',
      'dsd.do_smd_id = ds.do_smd_id and ds.is_deleted = false',
    );
    q.innerJoinRaw(
      'do_smd_vehicle',
      'dsv',
      'ds.vehicle_id_last = dsv.do_smd_vehicle_id  and dsv.is_deleted = false',
    );
    q.leftJoinRaw(
      'branch',
      'bf',
      'dsd.branch_id_from = bf.branch_id and bf.is_deleted = false',
    );
    q.leftJoinRaw(
      'branch',
      'bt',
      'dsd.branch_id_to  = bt.branch_id  and bt.is_deleted = false',
    );
    q.leftJoinRaw(
      'employee',
      'e',
      'dsv.employee_id_driver = e.employee_id and e.is_deleted = false',
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new ScanInSmdListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async findScanInDetail(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanInSmdDetailResponseVm();
    const timeNow = moment().toDate();
    const data = [];

    const resultDoSmdDetail = await DoSmdDetail.findOne({
      where: {
        doSmdDetailId: payload.do_smd_detail_id,
        isDeleted: false,
      },
    });
    if (resultDoSmdDetail) {
      if (payload.bag_type == 0) {
        // Detail Gabung Paket
        const rawQuery = `
          SELECT
            b.bag_id,
            CONCAT(b.bag_number, LPAD(CONCAT('', bi.bag_seq), 3, '0')) AS bag_number,
            CONCAT(bi.weight::numeric(10,2), ' Kg') AS weight,
            r.representative_code,
            br.branch_name
          FROM do_smd_detail_item dsdi
          INNER JOIN do_smd_detail dsd ON dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsd.is_deleted = FALSE
          INNER JOIN bag b ON dsdi.bag_id = b.bag_id AND b.is_deleted = FALSE
          INNER JOIN bag_item bi ON b.bag_id = bi.bag_id AND bi.is_deleted = FALSE
          LEFT JOIN representative r ON b.representative_id_to = r.representative_id AND r.is_deleted = FALSE
          LEFT JOIN branch br ON dsd.branch_id_to = br.branch_id AND br.is_deleted = FALSE
          WHERE
            dsdi.do_smd_detail_id = ${payload.do_smd_detail_id} AND
            dsdi.bag_type = 0 AND
            dsdi.is_deleted = FALSE
          LIMIT 5;
        `;
        const resultDataBag = await RawQueryService.query(rawQuery);
        if (resultDataBag.length > 0 ) {
          for (let a = 0; a < resultDataBag.length; a++) {
            data.push({
              do_smd_detail_id: payload.do_smd_detail_id,
              bag_number: resultDataBag[a].bag_number,
              weight: resultDataBag[a].weight,
              representative_code: resultDataBag[a].representative_code,
              branch_name: resultDataBag[a].branch_name,
            });
          }
        }

        result.statusCode = HttpStatus.OK;
        result.message = 'List Bag Success';
        result.data = data;
        return result;
      } else {
        throw new BadRequestException(`This API For Detail Bag / Gab.Paket Only`);
      }
    } else {
      throw new BadRequestException(`SMD Detail ID: ` + payload.do_smd_id + ` Can't Found !`);
    }
  }

}
