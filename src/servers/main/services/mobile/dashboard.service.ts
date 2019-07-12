import { HttpStatus, Injectable } from '@nestjs/common';
import { ContextualErrorService } from '../../../../shared/services/contextual-error.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import moment = require('moment');
import { MobileDashboardFindAllResponseVm } from '../../models/mobile-dashboard.response.vm';
import _ from 'lodash';
import { MobileInitDataResponseVm } from '../../models/mobile-init-response.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { Reason } from '../../../../shared/orm-entity/reason';
import { BaseQueryPayloadVm } from '../../../../shared/models/base-query-payload.vm';
import { AwbStatus } from '../../../../shared/orm-entity/awb-status';

@Injectable()
export class DashboardService {
  constructor() {}
  async findalldashboard(): // payload: DeliveryFilterPayloadVm
  Promise<MobileDashboardFindAllResponseVm> {
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

  async initData(): Promise<MobileInitDataResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    if (!!authMeta) {
      // Populate return value
      const result = new MobileInitDataResponseVm();

      result.reason = await this.getReason();
      result.awbStatus = await this.getAwbStatus();
      result.delivery = await this.getDelivery();

      return result;
    } else {
      ContextualErrorService.throwObj(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async getReason() {
    const repository = new OrionRepositoryService(Reason);
    const q = repository.findAllRaw();
    q.selectRaw(
      ['reason_id', 'reasonId'],
      ['reason_name', 'reasonName'],
      ['reason_code', 'reasonCode'],
      ['reason_category', 'reasonCategory'],
      ['reason_type', 'reasonType'],
    );
    q.where(e => e.isDeleted, w => w.isFalse());
    q.andWhere(e => e.reasonCategory, w => w.equals('pod'));

    return await q.exec();
  }

  public async getAwbStatus() {
    const repository = new OrionRepositoryService(AwbStatus);
    const q = repository.findAllRaw();
    q.selectRaw(
      ['awb_status_id', 'awbStatusId'],
      ['awb_status_name', 'awbStatusCode'],
      ['awb_status_title', 'awbStatusName'],
    );

    return await q.exec();
  }

  public async getDelivery() {
    // TODO: Fix Query get data to do_pod_deliver
    // add filter with employee id driver
    // =============================================================
    const queryPayload = new BaseQueryPayloadVm();
    queryPayload.skip = 0;
    queryPayload.take = 10;
    queryPayload.filter = [
      [
        {
          field: 't4.is_cod',
          operator: 'eq',
          value: false,
        },
      ],
    ];

    const qb = queryPayload.buildQueryBuilder();

    qb.addSelect('t4.awb_id', 'awbId');
    qb.addSelect('t4.awb_date', 'awbDate');
    qb.addSelect('t4.awb_number', 'awbNumber');
    qb.addSelect('t4.ref_customer_account_id', 'merchant');
    qb.addSelect('t4.consignee_name', 'consigneeName');
    qb.addSelect('t4.consignee_address', 'consigneeAddress');
    qb.addSelect('t4.consignee_phone', 'consigneeNumber');
    qb.addSelect('t4.is_cod', 'isCOD');
    qb.addSelect('t5.package_type_name', 'packageTypeName');
    qb.addSelect('t6.awb_status_name', 'awbStatusName');
    qb.addSelect('array_to_json(t13.data)', 'redeliveryHistory');
    qb.from('do_pod', 't1');
    qb.innerJoin('do_pod_detail', 't2', 't2.do_pod_id = t1.do_pod_id');
    qb.innerJoin('awb_item', 't3', 't3.awb_item_id = t2.awb_item_id');
    qb.innerJoin('awb', 't4', 't4.awb_id = t3.awb_id');
    qb.innerJoin(
      'package_type',
      't5',
      't5.package_type_id = t4.package_type_id',
    );
    qb.innerJoin(
      'awb_status',
      't6',
      't6.awb_status_id = t4.awb_status_id_last',
    );
    qb.leftJoin(
      qbJoin => {
        qbJoin
          .select('array_agg(row_to_json(t13))', 'data')
          .from(qbJoinFrom => {
            qbJoinFrom.addSelect('t10.history_date_time', 'historyDateTime');
            qbJoinFrom.addSelect('t11.reason_code', 'reasonCode');
            qbJoinFrom.addSelect('t12.fullname', 'employeeName');
            qbJoinFrom.from('do_pod_history', 't10');
            qbJoinFrom.where('t10.do_pod_id = t1.do_pod_id');
            qbJoinFrom.leftJoin(
              qbJoinFromJoin => {
                qbJoinFromJoin.addSelect('t11.reason_code');
                qbJoinFromJoin.from('reason', 't11');
                qbJoinFromJoin.where('t11.reason_id = t10.reason_id');
                return qbJoinFromJoin;
              },
              't11',
              'true',
            );
            qbJoinFrom.leftJoin(
              qbJoinFromJoin => {
                qbJoinFromJoin.addSelect('t12.fullname');
                qbJoinFromJoin.from('employee', 't12');
                qbJoinFromJoin.where(
                  't12.employee_id = t10.employee_id_driver',
                );
                return qbJoinFromJoin;
              },
              't12',
              'true',
            );
            return qbJoinFrom;
          }, 't13');
        return qbJoin;
      },
      't13',
      'true',
    );
    return await qb.getRawMany();
  }
}
