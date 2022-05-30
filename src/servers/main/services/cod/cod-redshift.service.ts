import { BadRequestException, Injectable } from "@nestjs/common";
import { AWB_STATUS } from "../../../../shared/constants/awb-status.constant";
import { TRANSACTION_STATUS } from "../../../../shared/constants/transaction-status.constant";
import { BaseMetaPayloadFilterVm, BaseMetaPayloadVm } from "../../../../shared/models/base-meta-payload.vm";
import { CodPayment } from "../../../../shared/orm-entity/cod-payment";
import { MetaService } from "../../../../shared/services/meta.service";
import { OrionRepositoryService } from "../../../../shared/services/orion-repository.service";
import { QueryServiceApi } from "../../../../shared/services/query.service.api";

import { BaseAwbCodDlvV2PayloadVm } from "../../models/cod/web-awb-cod-payload.vm";
import { WebAwbCodDlvV2ListResponseVm, WebCodCountResponseVm } from "../../models/cod/web-awb-cod-response.vm";



@Injectable()
export class CodRedshiftService {

  async getAwbCodDlvV2Redshift(
    params: BaseAwbCodDlvV2PayloadVm,
  ): Promise<WebAwbCodDlvV2ListResponseVm> {

    if (params.limit > 50){
      throw new BadRequestException(`limit maximum is 50`)
    }
    const payload = this.remapParamsAwbDlvV2ToPayload(params)

    payload.fieldResolverMap['branchIdFinal'] = 't4.branch_id';

    if (payload.sortBy === '') {
      payload.sortBy = 'driverName';
    }

    const repo = new OrionRepositoryService(CodPayment, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t3.first_name', 'driverName'],
      ['count(t3.user_id)', 'totalResi'],
      ['t3.user_id', 'userIdDriver'],
      ['t4.branch_name', 'branchNameFinal'],
      ['t4.branch_id', 'branchIdFinal'],
    );

    q.innerJoin(e => e.awbItemAttr, 't2', j => {
      j.andWhere(e => e.isDeleted, w => w.isFalse());
      j.andWhere(
        e => e.transactionStatusId,
        w => w.equals(TRANSACTION_STATUS.DEFAULT),
      );
      j.andWhere(e => e.awbStatusIdFinal, w => w.equals(AWB_STATUS.DLV));
    });

    q.innerJoin(e => e.userDriver, 't3');

    q.innerJoin(e => e.branchFinal, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());

    q.groupByRaw(
      't3.user_id, t4.branch_id, t3.first_name, t4.branch_name'
    );

    const query = await q.getQuery();
    let data = await QueryServiceApi.executeQuery(query, false, null);
    const result = new WebAwbCodDlvV2ListResponseVm();
    const total = 0;
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  async getCountAwbCodDlvV2Redshift(
    params: BaseAwbCodDlvV2PayloadVm,
  ): Promise<WebCodCountResponseVm> {
    
    const payload = this.remapParamsAwbDlvV2ToPayload(params)
  
    payload.fieldResolverMap['branchIdFinal'] = 't4.branch_id';

    if (payload.sortBy === '') {
      payload.sortBy = 'driverName';
    }

    const repo = new OrionRepositoryService(CodPayment, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, false);

    q.selectRaw(
      ['t3.first_name', 'driverName'],
      ['count(t3.user_id)', 'totalResi'],
      ['t3.user_id', 'userIdDriver'],
      ['t4.branch_name', 'branchNameFinal'],
      ['t4.branch_id', 'branchIdFinal'],
    );

    q.innerJoin(e => e.awbItemAttr, 't2', j => {
      j.andWhere(e => e.isDeleted, w => w.isFalse());
      j.andWhere(
        e => e.transactionStatusId,
        w => w.equals(TRANSACTION_STATUS.DEFAULT),
      );
      j.andWhere(e => e.awbStatusIdFinal, w => w.equals(AWB_STATUS.DLV));
    });

    q.innerJoin(e => e.userDriver, 't3');

    q.innerJoin(e => e.branchFinal, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());

    q.groupByRaw(
      't3.user_id, t4.branch_id, t3.first_name, t4.branch_name'
    );

    let queryCount = await q.getQuery();
    let cnt = await QueryServiceApi.executeQuery(queryCount, true, null);

    const result = new WebCodCountResponseVm();
    result.total = cnt;
    return result;
  }

  remapParamsAwbDlvV2ToPayload(params: BaseAwbCodDlvV2PayloadVm): BaseMetaPayloadVm {

    const payload = new  BaseMetaPayloadVm(); 
    payload.page = params.page;
    payload.limit = params.limit;
    payload.sortDir = params.sortDir;
    payload.sortBy = params.sortBy

    const filters = new BaseMetaPayloadFilterVm();
    filters.field = 'branchIdFinal';
    filters.operator = 'eq';
    filters.value = params.branchIdFinal
    payload.filters = [filters] 

    return payload;
  }
}