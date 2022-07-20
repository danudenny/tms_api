import { HttpStatus, Injectable } from '@nestjs/common';
import { SortationFinishHistoryResponVm } from '../../../models/sortation/web/sortation-l2-module-search.response.vm';
import moment = require('moment');
import { SortationFinishHistory } from '../../../../../shared/orm-entity/sortation-finish-history';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';

@Injectable()
export class SortationL2ListModuleService {

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
}
