import { RawQueryService } from '../../../../shared/services/raw-query.service';
import {
  MobileDashboardFindAllResponseVm,
  MobileDetailTransitResponseVm,
  MobileTransitResponseVm,
} from '../../models/mobile-dashboard.response.vm';
import { createQueryBuilder } from 'typeorm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import { DetailTransitPayloadVm } from '../../models/mobile-dashboard.vm';

export class MobileDashboardService {
  public static async getDashboardDataByRequest(): Promise<
    MobileDashboardFindAllResponseVm
  > {
    // TODO: Fix Query !!!
    const starttoday = '2019-02-02 00:00:00';
    const endtoday = '2019-02-03 00:00:00';
    const [
      querytodaycod,
      parameters,
    ] = RawQueryService.escapeQueryWithParameters(
      'select sum (total_cod_value) as todayawbcod from awb where awb_date >= :starttoday AND awb_date <=:endtoday',
      { starttoday, endtoday },
    );

    const [
      querycount,
      parameterscount,
    ] = RawQueryService.escapeQueryWithParameters(
      'select count (is_cod )as is_cod from awb where awb_date >= :starttoday AND awb_date <=:endtoday',
      { starttoday, endtoday },
    );
    // exec raw query
    const data = await RawQueryService.query(querytodaycod, parameters);
    const total = await RawQueryService.query(querycount, parameterscount);
    const result = new MobileDashboardFindAllResponseVm();
    const res = [];

    total.forEach((itm, i) => {
      res.push(Object.assign({}, itm, data[i]));
    });
    result.data = res;
    return result;
  }

  public static async getTransitDetailScanIn(
    payload: DetailTransitPayloadVm,
  ): Promise<MobileDetailTransitResponseVm> {
    // const authMeta = AuthService.getAuthMetadata();
    const currentMoment = moment();
    const mobileTransitResponseVm = new MobileTransitResponseVm();
    const result = new MobileDetailTransitResponseVm();
    const dateFrom = payload.dateFrom
      ? moment(payload.dateFrom, 'ddd MMM DD YYYY').format('YYYY-MM-DD') +
        ' 00:00:00'
      : currentMoment.format('YYYY-MM-DD 00:00:00');
    const dateTo = payload.dateTo
      ? moment(payload.dateTo, 'ddd MMM DD YYYY').format('YYYY-MM-DD') +
        ' 23:59:59'
      : currentMoment.format('YYYY-MM-DD 23:59:59');
    result.status = 'ok';

    if (moment(dateTo).isBefore(dateFrom)) {
      result.status = 'error';
      result.message = 'Tanggal yang dipilih tidak valid';
      return result;
    }

    // Total barang scan masuk
    const qb = createQueryBuilder();
    qb.addSelect('pcbd.awb_number)', 'totalScanInAwb');
    qb.from('pod_scan_in_branch_detail', 'pcbd');
    qb.innerJoin(
      'pod_scan_in_branch',
      'pcb',
      'pcb.pod_scan_in_branch_id = pcbd.pod_scan_in_branch_id AND pcbd.user_id_created = :userId ',
      { userId: 5240 },
    );
    qb.where(
      'pcb.created_time >= :dateTimeStart AND pcb.created_time <= :dateTimeEnd',
      {
        dateTimeStart: dateFrom,
        dateTimeEnd: dateTo,
      },
    );
    mobileTransitResponseVm.total = await qb.getCount();

    mobileTransitResponseVm.dateTime = currentMoment.format('YYYY-MM-DD');

    result.scanInAwb = mobileTransitResponseVm;

    return result;
  }

  public static async getTransitDetailNotScanOut(
    payload: DetailTransitPayloadVm,
  ): Promise<MobileDetailTransitResponseVm> {
    const authMeta = AuthService.getAuthMetadata();
    const currentMoment = moment();
    const mobileTransitResponseVm = new MobileTransitResponseVm();
    const result = new MobileDetailTransitResponseVm();

    const dateFrom = payload.dateFrom
      ? moment(payload.dateFrom, 'ddd MMM DD YYYY').format('YYYY-MM-DD') +
        ' 00:00:00'
      : currentMoment.format('YYYY-MM-DD 00:00:00');
    const dateTo = payload.dateTo
      ? moment(payload.dateTo, 'ddd MMM DD YYYY').format('YYYY-MM-DD') +
        ' 23:59:59'
      : currentMoment.format('YYYY-MM-DD 23:59:59');
    result.status = 'ok';

    if (moment(dateTo).isBefore(dateFrom)) {
      result.status = 'error';
      result.message = 'Tanggal yang dipilih tidak valid';
      return result;
    }

    // Total barang belum scan keluar
    const qb = createQueryBuilder();
    qb.addSelect('aia.awb_number', 'awbNumber');
    qb.from('awb_item_attr', 'aia');
    qb.innerJoin(
      'pod_scan_in_branch_detail',
      'pcbd',
      'pcbd.awb_number = aia.awb_number',
    );
    qb.innerJoin(
      'pod_scan_in_branch',
      'pcb',
      'pcb.pod_scan_in_branch_id = pcbd.pod_scan_in_branch_id AND pcb.user_id_created = :userId ',
      { userId: authMeta.userId },
    );
    qb.where(
      'pcbd.created_time >= :dateTimeStart AND pcbd.created_time <= :dateTimeEnd',
      {
        dateTimeStart: dateFrom,
        dateTimeEnd: dateTo,
      },
    );
    qb.andWhere('aia.awb_status_id_last = :inBranchCode', {
      inBranchCode: AWB_STATUS.IN_BRANCH,
    });
    mobileTransitResponseVm.total = await qb.getCount();

    mobileTransitResponseVm.dateTime = currentMoment.format('YYYY-MM-DD');

    result.notScanOutAwb = mobileTransitResponseVm;

    return result;
  }

  public static async getTransitDetail(
    payload: DetailTransitPayloadVm,
  ): Promise<MobileDetailTransitResponseVm> {
    const result = new MobileDetailTransitResponseVm();

    // ambil total barang belum scan keluar
    const transitScanIn = await this.getTransitDetailScanIn(payload);
    const transitNotScanOut = await this.getTransitDetailNotScanOut(payload);

    if (transitScanIn.status == 'error') {
      result.status = 'error';
      result.message = transitScanIn.message;
      return result;
    } else if (transitNotScanOut.status == 'error') {
      result.status = 'error';
      result.message = transitNotScanOut.message;
      return result;
    }

    result.status = 'ok';
    result.message = 'Success';
    result.notScanOutAwb = transitNotScanOut.notScanOutAwb;
    result.scanInAwb = transitScanIn.scanInAwb;

    return result;
  }
}

// NOTE: query total barang belum scan masuk dibawah di pakai jika diperlukan
// Total barang belum scan masuk
// const qb = createQueryBuilder();
// qb.addSelect(
//   'aia.awb_number',
//   'awbNumber',
// );
// qb.from('awb_item_attr', 'aia');
// qb.innerJoin('pod_scan_in_branch_detail', 'pcbd', 'pcbd.awb_number = aia.awb_number');
// qb.innerJoin(
//   'pod_scan_in_branch',
//   'pcb',
//   'pcb.pod_scan_in_branch_id = pcbd.pod_scan_in_branch_id AND pcb.user_id_created = :userId ', { userId: authMeta.userId }
// );
// qb.where(
//   'pcbd.created_time BETWEEN :dateTimeStart AND :dateTimeEnd',
//   {
//     dateTimeStart: dateFrom,
//     dateTimeEnd: dateTo
//   },
// );
// qb.andWhere('aia.awb_status_id_last = :outBranchCode', { outBranchCode: AWB_STATUS.OUT_BRANCH });
// mobileTransitResponseVm.total = await qb.getCount();
