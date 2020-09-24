import { Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { WebMonitoringCoordinatorResponse, WebMonitoringCoordinatorTaskResponse, WebMonitoringCoordinatorPhotoResponse, WebMonitoringCoordinatorListResponse, WebMonitoringCoordinatorDetailResponse, CreateTransactionCoordinatorResponse, WebMonitoringCoordinatorTaskReportResponse, WebMonitoringCoordinatorBranchResponse } from '../../models/web-monitoring-coordinator.response.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { KorwilTransaction } from '../../../../shared/orm-entity/korwil-transaction';
import { WebMonitoringCoordinatorTaskPayload, WebMonitoringCoordinatorPhotoPayload, WebMonitoringCoordinatorDetailPayload } from '../../models/web-monitoring-coordinator-payload.vm';
import { createQueryBuilder, Raw } from 'typeorm';
import { KorwilTransactionDetailPhoto } from '../../../../shared/orm-entity/korwil-transaction-detail-photo';
import { UserToBranch } from '../../../../shared/orm-entity/user-to-branch';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import moment = require('moment');
import { assign } from 'lodash';

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
    payload.fieldResolverMap['coordinatorName'] = '"coordinatorName"';
    payload.fieldResolverMap['employeeJourneyId'] = 't1.employee_journey_id';
    payload.fieldResolverMap['representativeId'] = 't5.representative_id';
    payload.fieldResolverMap['representativeCode'] = 't5.representative_code';

    const repo = new OrionRepositoryService(KorwilTransaction, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.korwil_transaction_id', 'korwilTransactionId'],
      ['t1.total_task', 'countTask'],
      ['t2.branch_name', 'branchName'],
      ['t2.branch_id', 'branchId'],
      ['t1.date', 'date'],
      [`COUNT(t3.is_done = true OR NULL)`, 'countChecklist'],
      ['t4.check_in_date', 'checkInDatetime'],
      ['t4.check_out_date', 'checkOutDatetime'],
      [`CONCAT(t5.first_name, ' ', t5.last_name)`, 'coordinatorName'],
      ['t1.user_id', 'userId'],
      ['t1.status', 'statusTransaction'],
      ['t6.representative_id', 'representativeId'],
      ['t6.representative_code', 'representativeCode'],
    );
    q.innerJoin(e => e.branches, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.korwilTransactionDetail, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.employeeJourney, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.users, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branches.representative, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw('t2.branch_id, t2.branch_name, t1.total_task, t4.check_in_date, t4.check_out_date, t1.date, t1.korwil_transaction_id, "coordinatorName", t1.user_id, t1.status, t6.representative_id, t6.representative_code');
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
    qb.addSelect(`CASE
                    WHEN a.status = 1 THEN 'Belum dikerjakan'
                    WHEN a.status = 2 THEN 'Sudah dikerjakan'
                    ELSE ''
                  END`, 'status');
    qb.from('korwil_transaction_detail', 'a');
    qb.innerJoin('korwil_item', 'b', 'b.korwil_item_id = a.korwil_item_id AND b.is_deleted = false');
    qb.addOrderBy('b.sort_order', 'ASC');
    qb.where('a.korwil_transaction_id = :korwilTransactionId', { korwilTransactionId: payload.korwilTransactionId });
    qb.andWhere('a.is_done = true');
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
    payload.fieldResolverMap['date'] = 'a.date';
    payload.fieldResolverMap['userId'] = 'b.ref_user_id';
    payload.fieldResolverMap['checkInDatetime'] = '"checkInDatetime"';
    payload.fieldResolverMap['checkOutDatetime'] = '"checkOutDatetime"';
    payload.fieldResolverMap['branchId'] = 'a.branch_id';
    payload.fieldResolverMap['coordinatorName'] = '"coordinatorName"';
    payload.fieldResolverMap['representativeId'] = 'f.representative_id';
    payload.fieldResolverMap['representativeCode'] = 'f.representative_code';

    const repo = new OrionRepositoryService(KorwilTransaction, 'a');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      [`CONCAT(c.first_name, ' ', c.last_name)`, 'coordinatorName'],
      [`COUNT(DISTINCT a.branch_id)`, 'countBranch'],
      [`COUNT(*) FILTER (WHERE a.employee_journey_id IS NOT NULL)`, 'countVisit'],
      [`MIN(d.check_in_date)`, 'checkInDatetime'],
      [`MAX(d.check_out_date)`, 'checkOutDatetime'],
      ['b.ref_user_id', 'userId'],
    );
    q.innerJoin(e => e.userToBranch, 'b', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.users, 'c', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.employeeJourney, 'd', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branches, 'e', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branches.representative, 'f', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw('b.ref_user_id, "coordinatorName"');
    q.orderByRaw('"checkInDatetime"', 'ASC');
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();
    const result = new WebMonitoringCoordinatorListResponse();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async taskReport(
    payload: WebMonitoringCoordinatorTaskPayload,
  ): Promise<WebMonitoringCoordinatorTaskReportResponse> {
    const result = new WebMonitoringCoordinatorTaskReportResponse();
    const qb = createQueryBuilder();
    qb.addSelect('d.representative_name', 'representative');
    qb.addSelect('d.representative_code', 'representativeCode');
    qb.addSelect('a.date', 'date');
    qb.addSelect('c.branch_name', 'branchName');
    qb.addSelect('e.check_in_date', 'checkInDatetime');
    qb.addSelect('e.check_out_date', 'checkOutDatetime');
    qb.addSelect(`COUNT(f.is_done = true OR NULL)`, 'countChecklist');
    qb.addFrom('korwil_transaction', 'a');
    qb.innerJoin('user_to_branch', 'b', 'b.user_to_branch_id = a.user_to_branch_id AND b.is_deleted = false');
    qb.innerJoin('branch', 'c', 'c.branch_id = b.ref_branch_id AND c.is_deleted = false');
    qb.innerJoin('representative', 'd', 'd.representative_id = c.representative_id AND d.is_deleted = false');
    qb.innerJoin('employee_journey', 'e', 'e.employee_journey_id = a.employee_journey_id AND e.is_deleted = false');
    qb.innerJoin('korwil_transaction_detail', 'f', 'f.korwil_transaction_id = a.korwil_transaction_id AND f.is_deleted = false');
    qb.where('a.is_deleted = false');
    qb.andWhere('a.korwil_transaction_id = :korwilTransactionId', { korwilTransactionId: payload.korwilTransactionId });
    qb.groupBy(' a.korwil_transaction_id, d.representative_name, a.date, c.branch_name, e.check_in_date, e.check_out_date, d.representative_code');

    const taskHeader = await qb.getRawOne();
    if (taskHeader) {
      result.transactionHeader = taskHeader;
      const qbDetail = createQueryBuilder();
      qbDetail.addSelect('a.korwil_transaction_detail_id', 'korwilTransactionDetailId');
      qbDetail.addSelect('b.korwil_item_name', 'task');
      qbDetail.addSelect('a.note', 'note');
      qbDetail.addFrom('korwil_transaction_detail', 'a');
      qbDetail.innerJoin('korwil_item', 'b', 'b.korwil_item_id = a.korwil_item_id AND b.is_deleted = false');
      qbDetail.where('a.is_deleted = false');
      qbDetail.andWhere('a.is_done = true');
      qbDetail.andWhere('a.korwil_transaction_id = :korwilTransactioId', { korwilTransactioId: payload.korwilTransactionId });
      const taskDetail = await qbDetail.getRawMany();

      if (taskDetail) {
        for (const task of taskDetail) {
          const params = {
            korwilTransactionDetailId: task.korwilTransactionDetailId,
          };
          const photoUrl = await this.taskPhoto(params);
          task.url = photoUrl.url;
        }
        result.transactionDetail = taskDetail;
      }
    }
    return result;
  }

  static async detailCoordinator(
    payload: WebMonitoringCoordinatorDetailPayload,
  ): Promise<WebMonitoringCoordinatorDetailResponse> {

    const qb = createQueryBuilder();
    qb.addSelect('b.user_id', 'userId');
    qb.addSelect(`CONCAT(b.first_name, ' ', b.last_name)`, 'coordinatorName');
    qb.addSelect('a.ref_branch_id', 'branchId');
    qb.from('user_to_branch', 'a');
    qb.innerJoin('users', 'b', 'a.ref_user_id = b.user_id AND b.is_deleted = false');
    qb.where('a.ref_user_id = :userId', { userId: payload.userId });
    qb.andWhere('a.is_deleted = false');

    const data = await qb.getRawMany();
    const result = new WebMonitoringCoordinatorDetailResponse();
    result.branch = [];
    result.coordinatorName = '';
    result.userId = payload.userId;

    const branch = [];
    for (const dataDetail of data) {
        branch.push(Number(dataDetail.branchId));
    }
    result.branch = branch;
    result.userId = payload.userId;
    result.coordinatorName = data[0].coordinatorName;
    return result;
  }

  static async findListBranchCoordinator(
    payload: BaseMetaPayloadVm,
  ): Promise<WebMonitoringCoordinatorBranchResponse> {
    // mapping field
    payload.fieldResolverMap['branchId'] = 't1.branch_id';
    payload.fieldResolverMap['date'] = 't1.date';
    payload.fieldResolverMap['userId'] = 't1.user_id';
    payload.fieldResolverMap['branchName'] = '"branchName"';
    payload.fieldResolverMap['representativeId'] = 't4.representative_id';
    payload.fieldResolverMap['representativeCode'] = 't4.representative_code';

    const repo = new OrionRepositoryService(KorwilTransaction, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(`
      DISTINCT (t1.branch_id) AS "branchId",
      t1.user_id AS "userId",
      t2.branch_name AS "branchName",
      t4.representative_code AS "representativeCode",
      t4.representative_id AS "representativeId"
    `,
    );
    q.innerJoin(e => e.branches, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.users, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branches.representative, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();
    const result = new WebMonitoringCoordinatorBranchResponse();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async createCoordinatorTrans(): Promise<CreateTransactionCoordinatorResponse> {
      const timeNow = moment().format();
      const userId = 3; // super admin;
      const qb = createQueryBuilder();
      qb.from('user_to_branch', 'utb');
      qb.leftJoin('korwil_transaction', 'b', `b.user_to_branch_id = utb.user_to_branch_id AND b.date::date = '${moment().format('YYYY-MM-DD')}' AND b.is_deleted = false`);
      qb.where('utb.is_deleted = false');
      qb.andWhere('b.korwil_transaction_id IS NULL');
      const count = await qb.getCount();

      const execute = await RawQueryService.query(`INSERT INTO korwil_transaction
        (
          date,
          branch_id,
          user_id,
          status,
          created_time,
          user_id_created,
          updated_time,
          user_id_updated,
          user_to_branch_id

        )
        (
          SELECT
            '${timeNow}' AS date,
            a.ref_branch_id,
            a.ref_user_id,
            0 as status,
            '${timeNow}' AS created_time,
            '${userId}' as user_id_created,
            '${timeNow}' AS updated_time,
            '${userId}' as user_id_updated,
            a.user_to_branch_id
            FROM user_to_branch a
            LEFT JOIN korwil_transaction b ON b.user_to_branch_id = a.user_to_branch_id AND b.date::date = '${moment().format('YYYY-MM-DD')}' AND b.is_deleted = false
            WHERE b.korwil_transaction_id IS NULL AND a.is_deleted = false
        )`,
        null,
        false,
      );

      const result = new CreateTransactionCoordinatorResponse();
      if (execute) {
        result.status = true;
        result.message = `${count} Data has been inserted at ${timeNow}`;
      } else {
        result.status = false;
        result.message = 'Data failed inserted';
      }
      return result;
  }
}
