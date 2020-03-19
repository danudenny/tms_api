// #region import
import { createQueryBuilder } from 'typeorm';
import moment = require('moment');

import { AuthService } from '../../../../shared/services/auth.service';
import { MobileAwbFilterListResponseVm } from '../../models/mobile-awb-filter-list.response.vm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { DetailTransitPayloadVm } from '../../models/mobile-dashboard.vm';
// #endregion

export class MobileAwbFilterService {
  constructor() {}
  public validateDate(df: string, dt: string) {
    let dateFrom = null;
    let dateTo = null;
    if (df && dt) {
      if (moment(df, 'ddd MMM DD YYYY', true).isValid()) {
        dateFrom = moment(df, 'ddd MMM DD YYYY');
        dateTo = moment(dt, 'ddd MMM DD YYYY');
      } else if (moment(df, 'DD MMM YYYY', true).isValid()) {
        dateFrom = moment(df, 'DD MMM YYYY');
        dateTo = moment(dt, 'DD MMM YYYY');
      } else {
        dateFrom = moment(df);
        dateTo = moment(dt);
      }
    }

    dateFrom = dateFrom
      ? dateFrom.format('YYYY-MM-DD 00:00:00')
      : moment().format('YYYY-MM-DD 00:00:00');
    dateTo = dateTo
      ? dateTo.format('YYYY-MM-DD 23:59:59')
      : moment().format('YYYY-MM-DD 23:59:59');

    return [dateFrom, dateTo];
  }

  async findAllNotScanOutFilterList(
    payload: DetailTransitPayloadVm,
  ): Promise<MobileAwbFilterListResponseVm> {
    const authMeta = AuthService.getAuthData();
    const currentMoment = moment();
    const qb = createQueryBuilder();
    const date = this.validateDate(payload.dateFrom, payload.dateTo);
    const result = new MobileAwbFilterListResponseVm();

    if (moment(date[1]).isBefore(date[0])) {
      result.status = 'error';
      result.message = 'Tanggal yang dipilih tidak valid';
      return result;
    }

    // Total barang belum scan keluar
    qb.addSelect('awb.awb_number', 'awbNumber');
    qb.addSelect('awb.consignee_name', 'consigneeName');
    qb.addSelect('awb.consignee_address', 'consigneeAddress');
    qb.addSelect('awb.consignee_phone', 'consigneePhone');
    qb.addSelect('awb.total_cod_value', 'totalCodValue');
    qb.addSelect('pt.package_type_code', 'service');
    qb.addSelect('awb.created_time', 'dateTime');
    qb.from('awb', 'awb');
    qb.innerJoin(
      'package_type',
      'pt',
      'pt.package_type_id = awb.package_type_id',
    );
    qb.innerJoin('awb_item_attr', 'aia', 'aia.awb_id = awb.awb_id');
    qb.innerJoin(
      'pod_scan_in_branch_detail',
      'pcbd',
      'pcbd.awb_id = awb.awb_id',
    );
    qb.innerJoin(
      'pod_scan_in_branch',
      'pcb',
      'pcb.pod_scan_in_branch_id = pcbd.pod_scan_in_branch_id AND pcbd.user_id_created = :userId',
      { userId: authMeta.userId },
    );
    qb.where(
      'pcb.created_time >= :dateTimeStart AND pcb.created_time <= :dateTimeEnd',
      {
        dateTimeStart: date[0],
        dateTimeEnd: date[1],
      },
    );
    qb.andWhere('aia.awb_status_id_last = :inBranchCode', {
      inBranchCode: AWB_STATUS.IN_BRANCH,
    });
    const data = await qb.getRawMany();

    result.data = data;

    return result;
  }

  async findAllNotScanInFilterList(
    payload: DetailTransitPayloadVm,
  ): Promise<MobileAwbFilterListResponseVm> {
    const authMeta = AuthService.getAuthData();
    const currentMoment = moment();
    const qb = createQueryBuilder();
    const result = new MobileAwbFilterListResponseVm();
    const date = this.validateDate(payload.dateFrom, payload.dateTo);

    if (moment(date[1]).isBefore(date[0])) {
      result.status = 'error';
      result.message = 'Tanggal yang dipilih tidak valid';
      return result;
    }
    // Total barang belum scan masuk
    qb.addSelect('awb.awb_number', 'awbNumber');
    qb.addSelect('awb.consignee_name', 'consigneeName');
    qb.addSelect('awb.consignee_address', 'consigneeAddress');
    qb.addSelect('awb.consignee_phone', 'consigneePhone');
    qb.addSelect('awb.total_cod_value', 'totalCodValue');
    qb.addSelect('pt.package_type_code', 'service');
    qb.addSelect('awb.created_time', 'dateTime');
    qb.from('awb', 'awb');
    qb.innerJoin(
      'package_type',
      'pt',
      'pt.package_type_id = awb.package_type_id',
    );
    qb.innerJoin('awb_item_attr', 'aia', 'aia.awb_id = awb.awb_id');
    qb.innerJoin(
      'pod_scan_in_branch_detail',
      'pcbd',
      'pcbd.awb_id = awb.awb_id',
    );
    qb.innerJoin(
      'pod_scan_in_branch',
      'pcb',
      'pcb.pod_scan_in_branch_id = pcbd.pod_scan_in_branch_id AND pcbd.user_id_created = :userId',
      { userId: authMeta.userId },
    );
    qb.where(
      'pcb.created_time >= :dateTimeStart AND pcb.created_time <= :dateTimeEnd',
      {
        dateTimeStart: date[0],
        dateTimeEnd: date[1],
      },
    );
    qb.andWhere('aia.awb_status_id_last = :outBranchCode', {
      outBranchCode: AWB_STATUS.OUT_BRANCH,
    });
    const data = await qb.getRawMany();

    result.data = data;

    return result;
  }

  async findAllScanInFilterList(
    payload: DetailTransitPayloadVm,
  ): Promise<MobileAwbFilterListResponseVm> {
    const authMeta = AuthService.getAuthData();
    const currentMoment = moment();
    const qb = createQueryBuilder();
    const result = new MobileAwbFilterListResponseVm();
    const date = this.validateDate(payload.dateFrom, payload.dateTo);

    if (moment(date[1]).isBefore(date[0])) {
      result.status = 'error';
      result.message = 'Tanggal yang dipilih tidak valid';
      return result;
    }
    // Total barang scan masuk
    qb.addSelect('awb.awb_number', 'awbNumber');
    qb.addSelect('awb.consignee_name', 'consigneeName');
    qb.addSelect('awb.consignee_address', 'consigneeAddress');
    qb.addSelect('awb.consignee_phone', 'consigneePhone');
    qb.addSelect('awb.total_cod_value', 'totalCodValue');
    qb.addSelect('pt.package_type_code', 'service');
    qb.addSelect('awb.created_time', 'dateTime');
    qb.from('awb', 'awb');
    qb.innerJoin(
      'package_type',
      'pt',
      'pt.package_type_id = awb.package_type_id',
    );
    qb.innerJoin(
      'pod_scan_in_branch_detail',
      'pcbd',
      'pcbd.awb_id = awb.awb_id',
    );
    qb.innerJoin(
      'pod_scan_in_branch',
      'pcb',
      'pcb.pod_scan_in_branch_id = pcbd.pod_scan_in_branch_id AND pcbd.user_id_created = :userId',
      { userId: authMeta.userId },
    );
    qb.where('pcb.created_time BETWEEN :dateTimeStart AND :dateTimeEnd', {
      dateTimeStart: date[0],
      dateTimeEnd: date[1],
    });
    const data = await qb.getRawMany();

    result.data = data;

    return result;
  }
}
