import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { HistoryModuleFinish } from '../../../../shared/orm-entity/history-module-finish';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { ScanHistoryModuleFinishResponseVm } from '../../models/history-module-finish-respon.vm';

@Injectable()
export class HistoryModuleFinishService {
  public static async getHistoryModuleFinish(payload: BaseMetaPayloadVm): Promise<ScanHistoryModuleFinishResponseVm> {
    payload.sortBy = payload.sortBy || 'createdTime';

    payload.fieldResolverMap['createdTime'] = 'hmf.created_time';
    payload.fieldResolverMap['driverId'] = 'hmf.driver_id';
    payload.fieldResolverMap['doSmdCode'] = 'hmf.do_smd_code';
    payload.fieldResolverMap['adminName'] = 'ea.fullname';

    const repo = new OrionRepositoryService(HistoryModuleFinish, 'hmf');
    const q = repo.findAllRaw();

    // SELECT CLAUSE
    const selectColumns = [
      ['hmf.history_module_finish_id', 'historyModuleFinishId'],
      ['hmf.do_smd_code', 'doSmdCode'],
      ['hmf.vehicle_id', 'vehicleId'],
      ['hmf.driver_id', 'driverId'],
      ['hmf.branch_id', 'branchId'],
      ['TO_CHAR(hmf.created_time, \'DD Mon YYYY HH24:MI\')', 'createdTime'],
      ['TO_CHAR(hmf.updated_time, \'DD Mon YYYY HH24:MI\')', 'updatedTime'],
      ['hmf.user_id_created', 'userIdCreated'],
      ['hmf.user_id_updated', 'userIdUpdated'],
      ['ea.fullname', 'adminName'],
      ['ed.fullname', 'driverName'],
      ['ed.nik', 'driverNik'],
      ['ea.nik', 'adminNik'],
    ];

    q.selectRaw(...selectColumns)
      .innerJoin(e => e.employee, 'ed', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
        )
      .innerJoin(e => e.admin, 'a' , j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()))
      .innerJoin(e => e.admin.employee, 'ea', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()) );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    payload.applyToOrionRepositoryQuery(q, true);

    const [historyModuleFinish, count] = await Promise.all([
      q.exec(),
      q.countWithoutTakeAndSkip(),
    ]);

    const result = new ScanHistoryModuleFinishResponseVm();
    result.statusCode = HttpStatus.OK;
    result.message = 'Sukses ambil data history module finish.';
    result.data = historyModuleFinish;
    result.buildPagingWithPayload(payload, count);

    return result;
}
}
