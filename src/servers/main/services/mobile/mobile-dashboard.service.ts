import { RawQueryService } from '../../../../shared/services/raw-query.service';
import {
  MobileDashboardFindAllResponseVm,
  MobileDetailTransitResponseVm,
  MobileTransitResponseVm,
} from '../../models/mobile-dashboard.response.vm';
import { createQueryBuilder } from 'typeorm';
import { AuthService } from 'src/shared/services/auth.service';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import moment = require('moment');

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

  public static async getTransitDetail(): Promise<
    MobileDetailTransitResponseVm
  > {
    const authMeta = AuthService.getAuthMetadata();
    const currentMoment = moment();
    const mobileTransitResponseVm = new MobileTransitResponseVm();
    const mobileTransitResponseVm2 = new MobileTransitResponseVm();
    const mobileTransitResponseVm3 = new MobileTransitResponseVm();

    // Total barang belum scan masuk
    const qb = createQueryBuilder();
    qb.addSelect(
      'aia.awb_number',
      'awbNumber',
    );
    qb.from('awb_item_attr', 'aia');
    qb.innerJoin('do_pod_detail', 'dpd', 'dpd.awb_item_id = aia.awb_item_id');
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
    mobileTransitResponseVm.total = await qb.getCount();

    // Total barang belum scan keluar
    const qb2 = createQueryBuilder();
    qb2.addSelect(
      'aia.awb_number',
      'awbNumber',
    );
    qb2.from('awb_item_attr', 'aia');
    qb2.innerJoin('do_pod_detail', 'dpd', 'dpd.awb_item_id = aia.awb_item_id');
    qb2.innerJoin(
      'do_pod',
      'dp',
      'dp.do_pod_id = dpd.do_pod_id AND dp.user_id_driver = :userId ', { userId: authMeta.userId }
    );
    qb2.where(
      'dp.created_time BETWEEN :currentDateTimeStart AND :currentDateTimeEnd',
      {
        currentDateTimeStart: currentMoment.format('YYYY-MM-DD 00:00:00'),
        currentDateTimeEnd: currentMoment.format('YYYY-MM-DD 23:59:59'),
      },
    );
    qb2.andWhere('aia.awb_status_id_last = :inBranchCode', { inBranchCode: AWB_STATUS.IN_BRANCH });
    mobileTransitResponseVm2.total = await qb2.getCount();

    // Total barang scan masuk
    const qb3 = createQueryBuilder();
    qb3.addSelect('pcbd.awb_number)', 'totalScanInAwb');
    qb3.from('pod_scan_in_branch_detail', 'pcbd');
    qb3.innerJoin(
        'pod_scan_in_branch',
        'pcb',
        'pcb.pod_scan_in_branch_id = pcbd.pod_scan_in_branch_id AND pcbd.user_id_created = :userId ', { userId: authMeta.userId }
      );
    qb3.where(
      'pcb.created_time BETWEEN :currentDateTimeStart AND :currentDateTimeEnd',
      {
        currentDateTimeStart: currentMoment.format('YYYY-MM-DD 00:00:00'),
        currentDateTimeEnd: currentMoment.format('YYYY-MM-DD 23:59:59'),
      },
    );
    mobileTransitResponseVm3.total = await qb3.getCount();

    mobileTransitResponseVm.dateTime = mobileTransitResponseVm2.dateTime = mobileTransitResponseVm3.dateTime = currentMoment.format('YYYY-MM-DD');

    const result = new MobileDetailTransitResponseVm();
    result.notScanInAwb = mobileTransitResponseVm;
    result.notScanOutAwb = mobileTransitResponseVm2;
    result.scanInAwb = mobileTransitResponseVm3;

    return result;
  }
}
