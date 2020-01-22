import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { MobileDashboardFindAllResponseVm, MobileDetailTransitResponseVm } from '../../models/mobile-dashboard.response.vm';
import { createQueryBuilder } from 'typeorm';
import { AuthService } from 'src/shared/services/auth.service';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';

export class MobileDashboardService {
  public static async getDashboardDataByRequest(): Promise<MobileDashboardFindAllResponseVm> {
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

  public static async getTransitDetail(): Promise<MobileDetailTransitResponseVm>{
    let qb = createQueryBuilder();
    const authMeta = AuthService.getAuthMetadata();
    const outBranchCode = AWB_STATUS.OUT_BRANCH;
    const inBranchCode = AWB_STATUS.IN_BRANCH;
    const antCode = AWB_STATUS.ANT;
    const result = new MobileDetailTransitResponseVm();

    // Total barang belum scan masuk
    qb.addSelect('COUNT(aia.awb_item_attr_id)', 'totalOutBranch')
    .from('awb_item_attr', 'aia')
    .where(
      'aia.awb_status_id_last = :outBranchCode',
      {
        outBranchCode,
      },
    )
    .innerJoin(
      'do_pod_detail',
      'dpd',
      'dpd.awb_item_id = aia.awb_item_id',
    )
    .innerJoin(
      'do_pod',
      'dp',
      'dp.do_pod_id = dpd.do_pod_id AND dp.user_id_driver = '+authMeta.userId,
    );
    let res = await qb.getRawOne();
    result.totalNotScanInAwb = res.totalOutBranch;
    
    // Total barang scan masuk
    qb = createQueryBuilder();
    qb.addSelect('COUNT(dpd.awb_number)', 'totalInBranch')
    .from('do_pod_detail', 'dpd')
    .innerJoin(
      'do_pod',
      'dp',
      'dp.do_pod_id = dpd.do_pod_id AND dp.user_id_driver = '+authMeta.userId,
    );
    res = await qb.getRawOne();
    result.totalScanInAwb = res.totalInBranch;
    
    // Total barang belum scan keluar
    qb = createQueryBuilder();
    qb.addSelect('COUNT(aia.awb_item_attr_id)', 'totalAnt')
    .from('awb_item_attr', 'aia')
    .where(
      'aia.awb_status_id_last = :inBranchCode',
      {
        inBranchCode,
      },
    )
    .innerJoin(
      'do_pod_detail',
      'dpd',
      'dpd.awb_item_id = aia.awb_item_id',
    )
    .innerJoin(
      'do_pod',
      'dp',
      'dp.do_pod_id = dpd.do_pod_id AND dp.user_id_driver = '+authMeta.userId,
    );
    res = await qb.getRawOne();
    result.totalNotScanOutAwb = res.totalAnt;
    
    return result;
  }
}
