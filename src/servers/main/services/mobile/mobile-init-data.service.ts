import moment = require('moment');
import { createQueryBuilder, IsNull } from 'typeorm';

import { AwbStatus } from '../../../../shared/orm-entity/awb-status';
import { Reason } from '../../../../shared/orm-entity/reason';
import { AuthService } from '../../../../shared/services/auth.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { MobileInitDataResponseVm } from '../../models/mobile-init-data-response.vm';
import { EmployeeJourney } from '../../../../shared/orm-entity/employee-journey';
import { MobileCheckInResponseVm } from '../../models/mobile-check-in-response.vm';

export class MobileInitDataService {
  public static async getInitDataByRequest(
    fromDate?: string,
  ): Promise<MobileInitDataResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new MobileInitDataResponseVm();

    result.reason = await this.getReason(fromDate);
    result.awbStatus = await this.getAwbStatus(fromDate);
    result.delivery = await this.getDelivery(fromDate);
    result.serverDateTime = new Date().toISOString();
    result.checkIn = await this.getStatusCheckIn(authMeta.employeeId);

    return result;
  }

  private static async getReason(fromDate?: string) {
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
    q.andWhereIsolated(qw => {
      qw.where(p => p.reasonCategory, w => w.equals('pod'));
      qw.orWhere(p => p.reasonCategory, w => w.equals('pod_cod'));
    });

    if (fromDate) {
      q.andWhereIsolated(qw => {
        qw.where(
          e => e.updatedTime,
          w => w.greaterThanOrEqual(moment(fromDate).toDate()),
        );
        qw.orWhere(
          e => e.createdTime,
          w => w.greaterThanOrEqual(moment(fromDate).toDate()),
        );
      });
    }
    return await q.exec();
  }

  private static async getAwbStatus(fromDate?: string) {
    const repository = new OrionRepositoryService(AwbStatus);
    const q = repository.findAllRaw();
    q.selectRaw(
      ['awb_status_id', 'awbStatusId'],
      ['awb_status_name', 'awbStatusCode'],
      ['awb_status_title', 'awbStatusName'],
    );
    q.where(e => e.isDeleted, w => w.isFalse());
    q.andWhere(e => e.isProblem, w => w.isTrue());
    if (fromDate) {
      q.andWhereIsolated(qw => {
        qw.where(
          e => e.updatedTime,
          w => w.greaterThanOrEqual(moment(fromDate).toDate()),
        );
        qw.orWhere(
          e => e.createdTime,
          w => w.greaterThanOrEqual(moment(fromDate).toDate()),
        );
      });
    }

    return await q.exec();
  }

  private static async getDelivery(fromDate?: string) {
    const qb = createQueryBuilder();
    const authMeta = AuthService.getAuthMetadata();

    qb.addSelect(
      'do_pod_deliver_detail.do_pod_deliver_detail_id',
      'doPodDeliverDetailId',
    );
    qb.addSelect('do_pod_deliver.do_pod_deliver_id', 'doPodDeliverId');
    qb.addSelect(
      'do_pod_deliver.do_pod_deliver_date_time',
      'doPodDeliverDateTime',
    );
    qb.addSelect('employee.employee_id', 'employeeId');
    qb.addSelect('employee.fullname', 'employeeName');
    qb.addSelect('awb.awb_id', 'awbId');
    qb.addSelect('awb_item_attr.awb_item_id', 'awbItemId');
    qb.addSelect('awb.awb_date', 'awbDate');
    qb.addSelect('awb.awb_number', 'awbNumber');
    qb.addSelect('awb_status.awb_status_id', 'awbStatusId');
    qb.addSelect('awb_status.awb_status_name', 'awbStatusName');
    qb.addSelect('awb.ref_customer_account_id', 'merchant');
    qb.addSelect('awb.consignee_name', 'consigneeName');
    qb.addSelect('awb.consignee_address', 'consigneeAddress');
    qb.addSelect('awb.notes', 'consigneeNote');
    qb.addSelect('awb.consignee_phone', 'consigneeNumber');
    qb.addSelect('package_type.package_type_name', 'packageTypeName');
    qb.addSelect('awb.total_cod_value', 'totalCodValue');
    qb.addSelect('awb.is_cod', 'isCOD');
    qb.addSelect('array_to_json(t.data)', 'deliveryHistory');
    qb.from('do_pod_deliver_detail', 'do_pod_deliver_detail');
    qb.innerJoin(
      'do_pod_deliver',
      'do_pod_deliver',
      'do_pod_deliver.do_pod_deliver_id = do_pod_deliver_detail.do_pod_deliver_id',
    );
    qb.innerJoin(
      'awb_item',
      'awb_item',
      'awb_item.awb_item_id = do_pod_deliver_detail.awb_item_id',
    );
    qb.innerJoin(
      'awb_item_attr',
      'awb_item_attr',
      'awb_item_attr.awb_item_id = do_pod_deliver_detail.awb_item_id',
    );
    qb.innerJoin('awb', 'awb', 'awb.awb_id = awb_item.awb_id');
    qb.leftJoin(
      'package_type',
      'package_type',
      'package_type.package_type_id = awb.package_type_id',
    );
    qb.innerJoin(
      'awb_status',
      'awb_status',
      'awb_status.awb_status_id = awb_item_attr.awb_status_id_last',
    );
    qb.innerJoin(
      'employee',
      'employee',
      'employee.employee_id = do_pod_deliver.employee_id_driver',
    );
    qb.leftJoin(
      qbJoin => {
        qbJoin.select('array_agg(row_to_json(t))', 'data').from(qbJoinFrom => {
          qbJoinFrom.addSelect(
            'do_pod_deliver_history.do_pod_deliver_history_id',
            'doPodDeliverHistoryId',
          );
          qbJoinFrom.addSelect(
            'do_pod_deliver_history.history_date_time',
            'historyDateTime',
          );
          qbJoinFrom.addSelect('reason.reason_id', 'reasonId');
          qbJoinFrom.addSelect('reason.reason_code', 'reasonCode');
          qbJoinFrom.addSelect('do_pod_deliver_history.desc', 'reasonNotes');
          qbJoinFrom.addSelect('employee_history.employee_id', 'employeeId');
          qbJoinFrom.addSelect('employee_history.fullname', 'employeeName');
          qbJoinFrom.addSelect(
            'do_pod_deliver_history.awb_status_id',
            'awbStatusId',
          );
          qbJoinFrom.addSelect(
            'awb_status.awb_status_name',
            'awbStatusName',
          );
          qbJoinFrom.addSelect(
            'do_pod_deliver_history.latitude_delivery',
            'latitudeDelivery',
          );
          qbJoinFrom.addSelect(
            'do_pod_deliver_history.longitude_delivery',
            'longitudeDelivery',
          );
          qbJoinFrom.from('do_pod_deliver_history', 'do_pod_deliver_history');
          qbJoinFrom.where(
            'do_pod_deliver_history.do_pod_deliver_detail_id = do_pod_deliver_detail.do_pod_deliver_detail_id',
          );
          qbJoinFrom.andWhere('do_pod_deliver_history.is_deleted = false');
          qbJoinFrom.leftJoin(
            qbJoinFromJoin => {
              qbJoinFromJoin.addSelect('reason.reason_id');
              qbJoinFromJoin.addSelect('reason.reason_code');
              qbJoinFromJoin.from('reason', 'reason');
              qbJoinFromJoin.where(
                'reason.reason_id = do_pod_deliver_history.reason_id',
              );
              return qbJoinFromJoin;
            },
            'reason',
            'true',
          );
          qbJoinFrom.innerJoin(
            qbJoinFromJoin => {
              qbJoinFromJoin.addSelect('awb_status.awb_status_id');
              qbJoinFromJoin.addSelect('awb_status.awb_status_name');
              qbJoinFromJoin.from('awb_status', 'awb_status');
              qbJoinFromJoin.where(
                'awb_status.awb_status_id = do_pod_deliver_history.awb_status_id',
              );
              return qbJoinFromJoin;
            },
            'awb_status',
            'true',
          );
          qbJoinFrom.innerJoin(
            qbJoinFromJoin => {
              qbJoinFromJoin.addSelect('employee_history.employee_id');
              qbJoinFromJoin.addSelect('employee_history.fullname');
              qbJoinFromJoin.from('employee', 'employee_history');
              qbJoinFromJoin.where(
                'employee_history.employee_id = do_pod_deliver_history.employee_id_driver',
              );
              return qbJoinFromJoin;
            },
            'employee_history',
            'true',
          );
          return qbJoinFrom;
        }, 't');
        return qbJoin;
      },
      't',
      'true',
    );

    qb.take(0);
    qb.skip(200);

    qb.andWhere('do_pod_deliver.employee_id_driver = :employeeIdDriver', {
      employeeIdDriver: authMeta.employeeId,
    });

    // COMMENTED FOR TEST PURPOSE
    // const permissionTokenPayload = AuthService.getPermissionTokenPayload();
    // qb.andWhere('do_pod_deliver.branch_id = :currentBranchId', {
    //   currentBranchId: permissionTokenPayload.branchId,
    // });

    const currentMoment = moment();
    qb.andWhere(
      'do_pod_deliver.do_pod_deliver_date_time BETWEEN :currentDateTimeStart AND :currentDateTimeEnd',
      {
        currentDateTimeStart: currentMoment.format('YYYY-MM-DD 00:00:00'),
        currentDateTimeEnd: currentMoment.format('YYYY-MM-DD 23:59:59'),
      },
    );

    qb.andWhere('do_pod_deliver_detail.is_deleted = false');

    if (fromDate) {
      // TODO: andWhereIsolated condition
      qb.andWhere(
        '(do_pod_deliver_detail.updated_time >= :fromDate OR do_pod_deliver_detail.created_time >= :fromDate)',
        {
          fromDate: moment(fromDate).toDate(),
        },
      );
    }
    return await qb.getRawMany();
  }

  private static async getStatusCheckIn(
    employeeId: number,
  ): Promise<MobileCheckInResponseVm> {
    const result: MobileCheckInResponseVm = {
      status: 'ok',
      message: 'success',
      branchName: '',
      checkInDate: '',
      attachmentId: null,
      isCheckIn: false,
    };

    const employeeJourneyCheck = await EmployeeJourney.findOne(
      {
        where: {
          employeeId,
          checkOutDate: IsNull(),
        },
        order: {
          checkInDate: 'DESC',
        },
      },
    );
    if (employeeJourneyCheck) {
      result.status = 'error';
      result.isCheckIn = true;
      result.message =
        'Check In sedang aktif, Harap CheckOut terlebih dahulu';
      result.checkInDate = moment(employeeJourneyCheck.checkInDate)
        .format('YYYY-MM-DD HH:mm:ss');
    }
    return result;
  }
}
