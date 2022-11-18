import {HttpStatus, Inject, Injectable} from '@nestjs/common';
import { SortationFinishHistoryResponVm } from '../../../models/sortation/web/sortation-l2-module-list.response.vm';
import { SortationFinishHistory } from '../../../../../shared/orm-entity/sortation-finish-history';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import {
  SORTATION_EXTERNAL_MODULE_SERVICE,
  SortationExternalModulesService
} from "../../../interfaces/sortation-external-modules.service";

@Injectable()
export class SortationL2ListModuleService {

  constructor(
      @Inject(SORTATION_EXTERNAL_MODULE_SERVICE) private readonly externalL2: SortationExternalModulesService,
  ) {
  }

  public static async finishListSortation(payload: BaseMetaPayloadVm): Promise<SortationFinishHistoryResponVm> {
    payload.sortBy = payload.sortBy || 'createdTime';

    payload.fieldResolverMap['createdTime'] = 'sfh.created_time';
    payload.fieldResolverMap['driverId'] = 'dsv.employee_driver_id';

    const repo = new OrionRepositoryService(SortationFinishHistory, 'sfh');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    const selectColumn = [
      ['sfh.sortation_finish_history_id', 'sortationFinishHistoryId'],
      ['ds.do_sortation_id', 'doSortationId'],
      ['ds.do_sortation_code', 'doSortationCode'],
      ['TO_CHAR(sfh.created_time, \'DD Mon YYYY HH24:MI\')', 'createdTime'],
      ['TO_CHAR(sfh.updated_time, \'DD Mon YYYY HH24:MI\')', 'updatedTime'],
      ['sfh.user_id_created', 'userIdCreated'],
      ['sfh.user_id_updated', 'userIdUpdated'],
      ['ea.fullname', 'adminName'],
      ['ea.nik', 'adminNik'],
      ['dsv.employee_driver_id', 'driverId'],
      ['e.fullname', 'driverName'],
      ['e.nik', 'driverNik'],
    ];

    q.selectRaw(...selectColumn)
      .innerJoin(e => e.doSortation, 'ds', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()))
      .innerJoin(e => e.doSortation.doSortationVehicle, 'dsv', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()))
      .innerJoin(e => e.doSortation.doSortationVehicle.employee, 'e', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()))
      .innerJoin(e => e.admin.employee, 'ea', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()));
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const [objSortationFinish, count] = await Promise.all([
      q.exec(),
      q.countWithoutTakeAndSkip(),
    ]);

    const result = new SortationFinishHistoryResponVm();
    result.statusCode = HttpStatus.OK;
    result.message = 'Sukses ambil data history';
    result.data =  objSortationFinish;
    result.buildPagingWithPayload(payload, count);

    return result;
  }

  public async externalFinishListSortation(payload: BaseMetaPayloadVm): Promise<SortationFinishHistoryResponVm> {
    const newPayload = {
      page: payload.page,
      limit: payload.limit,
      sortBy: payload.sortBy || 'created_time',
      sortDir: payload.sortDir || 'desc',
      filters: [],
    };
    for (const filter of payload.filters) {
      const field = filter.field.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
      const newObjFilter = {
        field,
        operator: filter.operator,
        value: filter.value,
      };
      newPayload.filters.push(newObjFilter);
    }



    const res = await this.externalL2.listFinish(newPayload);
    const resultData = [];

    for (const resData of res.data.list) {
      const newObjList = {
        sortationFinishHistoryId : resData.sortation_finish_history_id,
        doSortationCode : resData.do_sortation_code,
        doSortationId : resData.do_sortation_id,
        driverId : resData.driver_id,
        createdTime : resData.created_time,
        updatedTime : resData.updated_time,
        userIdCreated : resData.user_id_created,
        userIdUpdated : resData.user_id_updated,
        adminName : resData.admin_name,
        driverName : resData.driver_name,
        driverNik : resData.driver_nik,
        adminNik : resData.admin_nik,
      };
      resultData.push(newObjList);
    }
    const result = new SortationFinishHistoryResponVm();
    result.statusCode = HttpStatus.OK;
    result.message = 'Sukses ambil data history';
    result.data =  resultData;
    result.buildPagingWithPayload(payload, res.data.paging.total_page);

    return result;
  }
}
