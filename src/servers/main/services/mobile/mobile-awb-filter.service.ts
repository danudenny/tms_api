// #region import
import { createQueryBuilder } from 'typeorm';
import moment = require('moment');

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AuthService } from '../../../../shared/services/auth.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { QueryBuilderService } from '../../../../shared/services/query-builder.service';
import { MobileAwbFilterListResponseVm } from '../../models/mobile-awb-filter-list.response.vm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
// #endregion

export class MobileAwbFilterService {
  constructor() {}

  async findAllNotScanOutFilterList(): Promise<MobileAwbFilterListResponseVm> {
    const authMeta = AuthService.getAuthData();
    const currentMoment = moment();
    const qb = createQueryBuilder();

    // Total barang scan masuk
    qb.addSelect( 'awb.awb_number', 'awbNumber');
    qb.addSelect( 'awb.consignee_name', 'consigneeName');
    qb.addSelect( 'awb.consignee_address', 'consigneeAddress');
    qb.addSelect( 'awb.consignee_phone', 'consigneePhone');
    qb.addSelect( 'awb.total_cod_value', 'totalCodValue');
    qb.addSelect( 'pt.package_type_code', 'service');
    qb.addSelect( 'awb.created_time', 'dateTime');
    qb.from('awb', 'awb');
    qb.innerJoin(
      'package_type',
      'pt',
      'pt.package_type_id = awb.package_type_id'
    );
    qb.innerJoin(
      'awb_item_attr',
      'aia',
      'aia.awb_id = awb.awb_id'
    );
    qb.innerJoin(
      'pod_scan_in_branch_detail',
      'pcbd',
      'pcbd.awb_item_id = aia.awb_item_id'
    );
    qb.innerJoin(
      'pod_scan_in_branch',
      'pcb',
      'pcb.pod_scan_in_branch_id = pcbd.pod_scan_in_branch_id AND pcb.user_id_created = :userId', { userId: authMeta.userId }
    );
    qb.where(
      'pcb.created_time BETWEEN :currentDateTimeStart AND :currentDateTimeEnd',
      {
        currentDateTimeStart: currentMoment.format('YYYY-MM-DD 00:00:00'),
        currentDateTimeEnd: currentMoment.format('YYYY-MM-DD 23:59:59'),
      },
    );
    qb.andWhere('aia.awb_status_id_last = :inBranchCode', { inBranchCode: AWB_STATUS.IN_BRANCH });
    const data = await qb.getRawMany();

    const result = new MobileAwbFilterListResponseVm();
    result.data = data;

    return result;
  }

  async findAllNotScanInFilterList(): Promise<MobileAwbFilterListResponseVm> {
    const authMeta = AuthService.getAuthData();
    const currentMoment = moment();
    const qb = createQueryBuilder();

    // Total barang belum scan masuk
    qb.addSelect( 'awb.awb_number', 'awbNumber');
    qb.addSelect( 'awb.consignee_name', 'consigneeName');
    qb.addSelect( 'awb.consignee_address', 'consigneeAddress');
    qb.addSelect( 'awb.consignee_phone', 'consigneePhone');
    qb.addSelect( 'awb.total_cod_value', 'totalCodValue');
    qb.addSelect( 'pt.package_type_code', 'service');
    qb.addSelect( 'awb.created_time', 'dateTime');
    qb.from('awb', 'awb');
    qb.innerJoin(
      'package_type',
      'pt',
      'pt.package_type_id = awb.package_type_id'
    );
    qb.innerJoin(
      'awb_item_attr',
      'aia',
      'aia.awb_id = awb.awb_id'
    );
    qb.innerJoin(
      'do_pod_detail',
      'dpd',
      'dpd.awb_item_id = aia.awb_item_id'
    );
    qb.innerJoin(
      'do_pod',
      'dp',
      'dp.do_pod_id = dpd.do_pod_id AND dp.user_id_driver = :userId ', { userId: authMeta.userId }
    );
    qb.where(
      'dp.created_time BETWEEN :currentDateTimeStart AND :currentDateTimeEnd',
      {
        currentDateTimeStart: currentMoment.format('YYYY-MM-DD 00:00:00'),
        currentDateTimeEnd: currentMoment.format('YYYY-MM-DD 23:59:59'),
      },
    );
    qb.andWhere('aia.awb_status_id_last = :outBranchCode', { outBranchCode: AWB_STATUS.OUT_BRANCH });
    const data = await qb.getRawMany();

    const result = new MobileAwbFilterListResponseVm();
    result.data = data;

    return result;
  }

  async findAllScanInFilterList(): Promise<MobileAwbFilterListResponseVm> {
    const authMeta = AuthService.getAuthData();
    const currentMoment = moment();
    const qb = createQueryBuilder();

    // Total barang belum scan keluar
    qb.addSelect( 'awb.awb_number', 'awbNumber');
    qb.addSelect( 'awb.consignee_name', 'consigneeName');
    qb.addSelect( 'awb.consignee_address', 'consigneeAddress');
    qb.addSelect( 'awb.consignee_phone', 'consigneePhone');
    qb.addSelect( 'awb.total_cod_value', 'totalCodValue');
    qb.addSelect( 'pt.package_type_code', 'service');
    qb.addSelect( 'awb.created_time', 'dateTime');
    qb.from('awb', 'awb');
    qb.innerJoin(
      'package_type',
      'pt',
      'pt.package_type_id = awb.package_type_id'
    );
    qb.innerJoin(
      'do_pod_detail',
      'dpd',
      'dpd.awb_number = awb.awb_number'
    );
    qb.innerJoin(
      'do_pod',
      'dp',
      'dp.do_pod_id = dpd.do_pod_id AND dp.user_id_driver = :userId ', { userId: authMeta.userId }
    );
    qb.where(
      'dp.created_time BETWEEN :currentDateTimeStart AND :currentDateTimeEnd',
      {
        currentDateTimeStart: currentMoment.format('YYYY-MM-DD 00:00:00'),
        currentDateTimeEnd: currentMoment.format('YYYY-MM-DD 23:59:59'),
      },
    );
    const data = await qb.getRawMany();

    const result = new MobileAwbFilterListResponseVm();
    result.data = data;

    return result;
  }
}
