import { Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { WebMonitoringCoordinatorResponse, WebMonitoringCoordinatorTaskResponse, WebMonitoringCoordinatorPhotoResponse, WebMonitoringCoordinatorListResponse } from '../../models/web-monitoring-coordinator.response.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { KorwilTransaction } from '../../../../shared/orm-entity/korwil-transaction';
import { WebMonitoringCoordinatorTaskPayload, WebMonitoringCoordinatorPhotoPayload } from '../../models/web-monitoring-coordinator-payload.vm';
import { createQueryBuilder } from 'typeorm';
import { KorwilTransactionDetailPhoto } from '../../../../shared/orm-entity/korwil-transaction-detail-photo';
import { UserToBranch } from '../../../../shared/orm-entity/user-to-branch';

@Injectable()
export class WebMonitoringCoordinatorService {
  constructor() {}

  static async findListAllBranch(
    payload: BaseMetaPayloadVm,
  ): Promise<WebMonitoringCoordinatorResponse> {
    // mapping field
    payload.fieldResolverMap['countTask'] = 't1.total_task';
    payload.fieldResolverMap['branchId'] = 't2.branch_id';
    payload.fieldResolverMap['date'] = 't1.date';
    payload.fieldResolverMap['userId'] = 't1.user_id';

    const repo = new OrionRepositoryService(KorwilTransaction, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t3.korwil_transaction_id', 'korwilTransactionId'],
      ['t1.total_task', 'countTask'],
      ['t2.branch_name', 'branchName'],
      ['t2.branch_id', 'branchId'],
      ['t1.date', 'date'],
      [`CASE
          WHEN t3.is_done = true THEN 1
          ELSE 0
      END`, 'countChecklist'],
      ['t4.check_in_date', 'checkInDatetime'],
      ['t4.check_out_date', 'checkOutDatetime'],
      [`CONCAT(t5.first_name, ' ', t5.last_name)`, 'coordinatorName'],
      ['t1.user_id', 'userId'],
      ['t1.status', 'statusTransaction'],
    );
    q.innerJoin(e => e.branches, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.korwilTransactionDetail, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.employeeJourney, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.users, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw('t2.branch_id, t2.branch_name, t3.is_done, t1.total_task, t4.check_in_date, t4.check_out_date, t1.date, t3.korwil_transaction_id, "coordinatorName", t1.user_id, t1.status');
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();
    const result = new WebMonitoringCoordinatorResponse();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async listTask(
    payload: WebMonitoringCoordinatorTaskPayload,
  ): Promise<WebMonitoringCoordinatorTaskResponse> {
    const qb = createQueryBuilder();
    qb.addSelect('a.korwil_transaction_detail_id', 'korwilTransactionDetailId');
    qb.addSelect('b.korwil_item_name', 'task');
    qb.addSelect('a.note', 'note');
    qb.addSelect('a.photo_count', 'countPhoto');
    qb.from('korwil_transaction_detail', 'a');
    qb.innerJoin('korwil_item', 'b', 'b.korwil_item_id = a.korwil_item_id AND b.is_deleted = false');
    qb.addOrderBy('b.sort_order', 'ASC');
    qb.where('a.korwil_transaction_id = :korwilTransactionId', { korwilTransactionId: payload.korwilTransactionId });
    qb.andWhere('a.is_deleted = false');

    const data = await qb.getRawMany();
    const result = new WebMonitoringCoordinatorTaskResponse();
    result.data = data;
    return result;
  }

  static async taskPhoto(
    payload: WebMonitoringCoordinatorPhotoPayload,
  ): Promise<WebMonitoringCoordinatorPhotoResponse> {
    const result = new WebMonitoringCoordinatorPhotoResponse();
    const url = [];
    const qb = createQueryBuilder();
    qb.addSelect('url');
    qb.addFrom('korwil_transaction_detail_photo', 'a');
    qb.innerJoin('attachment_tms', 'b', 'a.photo_id = b.attachment_tms_id AND b.is_deleted = false');
    qb.where('a.is_deleted = false');
    qb.andWhere('a.korwil_transaction_detail_id = :korwilTransactionDetailId', { korwilTransactionDetailId: payload.korwilTransactionDetailId });
    const data = await qb.getRawMany();
    for (const dataDetail of data) {
      url.push(dataDetail.url);
    }
    result.url = url;
    return result;
  }

  static async findListCoordinator(
    payload: BaseMetaPayloadVm,
  ): Promise<WebMonitoringCoordinatorListResponse> {
    // mapping field
    payload.fieldResolverMap['date'] = 'c.date';
    payload.fieldResolverMap['userId'] = 'a.ref_user_id';
    payload.fieldResolverMap['checkInDatetime'] = '"checkInDatetime"';
    payload.fieldResolverMap['checkOutDatetime'] = '"checkOutDatetime"';

    const repo = new OrionRepositoryService(UserToBranch, 'a');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      [`CONCAT(b.first_name, ' ', b.last_name)`, 'coordinatorName'],
      [`COUNT(a.ref_user_id)`, 'countBranch'],
      [`COUNT(c.user_id)`, 'countVisit'],
      [`MIN(d.check_in_date)`, 'checkInDatetime'],
      [`MAX(d.check_out_date)`, 'checkOutDatetime'],
      // ['c.date', 'date'],
      ['a.ref_user_id', 'userId'],
    );
    q.innerJoin(e => e.users, 'b', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.korwilTransaction, 'c', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.korwilTransaction.employeeJourney, 'd', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw('a.ref_user_id, "coordinatorName"');
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();
    const result = new WebMonitoringCoordinatorListResponse();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}