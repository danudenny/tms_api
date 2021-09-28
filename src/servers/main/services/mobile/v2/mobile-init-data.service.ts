import moment = require('moment');
import { createQueryBuilder, IsNull } from 'typeorm';

import { AwbStatus } from '../../../../../shared/orm-entity/awb-status';
import { EmployeeJourney } from '../../../../../shared/orm-entity/employee-journey';
import { Reason } from '../../../../../shared/orm-entity/reason';
import { AuthService } from '../../../../../shared/services/auth.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { MobileCheckInResponseVm } from '../../../models/mobile-check-in-response.vm';
import {
    MobileInitDataResponseVm, MobileInitDataDeliveryV2ResponseVm, MobileInitDataResponseV2Vm,
} from '../../../models/mobile-init-data-response.vm';
import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';

export class V2MobileInitDataService {

  public static async getInitDataByRequest(
    fromDate?: string,
  ): Promise<MobileInitDataResponseV2Vm> {
    const authMeta = AuthService.getAuthData();
    const result = new MobileInitDataResponseV2Vm();

    result.reason = await this.getReason(fromDate);
    result.awbStatus = await this.getAwbStatus(fromDate);
    result.delivery = await this.getDelivery(fromDate);
    result.serverDateTime = new Date().toISOString();
    result.checkIn = await this.getStatusCheckIn(authMeta.employeeId);

    return result;
  }

  public static async getInitData(
    fromDate?: string,
  ): Promise<MobileInitDataResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new MobileInitDataResponseVm();

    result.reason = await this.getReason(fromDate);
    result.awbStatus = await this.getAwbStatus(fromDate);
    result.serverDateTime = moment().format();
    result.checkIn = await this.getStatusCheckIn(authMeta.employeeId);

    return result;
  }

  public static async getInitDataDelivery(
    fromDate?: string,
  ): Promise<MobileInitDataDeliveryV2ResponseVm> {
    const result = new MobileInitDataDeliveryV2ResponseVm();
    result.delivery = await this.getDelivery(fromDate);
    result.serverDateTime = moment().format();
    return result;
  }

  public static async getHistoryByRequest(doPodDeliverDetailId: string) {
    const qb = createQueryBuilder();
    qb.addSelect(
      'do_pod_deliver_history.do_pod_deliver_history_id',
      'doPodDeliverHistoryId',
    );
    qb.addSelect(
      'do_pod_deliver_history.history_date_time',
      'historyDateTime',
    );
    qb.addSelect('reason.reason_id', 'reasonId');
    qb.addSelect('reason.reason_code', 'reasonCode');
    qb.addSelect('do_pod_deliver_history.desc', 'reasonNotes');
    qb.addSelect('employee_history.employee_id', 'employeeId');
    qb.addSelect('employee_history.fullname', 'employeeName');
    qb.addSelect(
      'do_pod_deliver_history.awb_status_id',
      'awbStatusId',
    );
    qb.addSelect(
      'awb_status.awb_status_name',
      'awbStatusCode',
    );
    qb.addSelect(
      'awb_status.awb_status_title',
      'awbStatusName',
    );
    qb.addSelect(
      'do_pod_deliver_history.latitude_delivery',
      'latitudeDelivery',
    );
    qb.addSelect(
      'do_pod_deliver_history.longitude_delivery',
      'longitudeDelivery',
    );
    qb.from('do_pod_deliver_history', 'do_pod_deliver_history');
    qb.leftJoin(
      'reason',
      'reason',
      'reason.reason_id = do_pod_deliver_history.reason_id',
    );
    qb.leftJoin(
      'awb_status',
      'awb_status',
      'awb_status.awb_status_id = do_pod_deliver_history.awb_status_id',
    );
    qb.leftJoin(
      'employee',
      'employee_history',
      'employee_history.employee_id = do_pod_deliver_history.employee_id_driver',
    );
    qb.where(
      'do_pod_deliver_history.do_pod_deliver_detail_id = :doPodDeliverDetailId',
      {
        doPodDeliverDetailId,
      },
    );
    qb.andWhere('do_pod_deliver_history.is_deleted = false');
    return await qb.getRawMany();
  }

  // private
  private static async getReason(fromDate?: string) {
    const repository = new OrionRepositoryService(Reason);
    const q = repository.findAllRaw();
    q.selectRaw(
      ['reason_id', 'reasonId'],
      ['reason_name', 'reasonName'],
      ['reason_code', 'reasonCode'],
      ['reason_category', 'reasonCategory'],
      ['reason_type', 'reasonType'],
      ['is_deleted', 'isDeleted'],
    );
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
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const repository = new OrionRepositoryService(AwbStatus);
    const q = repository.findAllRaw();
    q.selectRaw(
      ['awb_status_id', 'awbStatusId'],
      ['awb_status_name', 'awbStatusCode'],
      ['awb_status_title', 'awbStatusName'],
      ['is_deleted', 'isDeleted'],
    );
    q.andWhere(e => e.isProblem, w => w.isTrue());
    q.andWhere(e => e.isMobile, w => w.isTrue());
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

    const result = await q.exec();

    // NOTE: add status RTC if role Ops - Sigesit Transit
    if (Number(permissonPayload.roleId) == 50) {
      const statusRTC = await repository
        .findAllRaw()
        .selectRaw(
          ['awb_status_id', 'awbStatusId'],
          ['awb_status_name', 'awbStatusCode'],
          ['awb_status_title', 'awbStatusName'],
          ['is_deleted', 'isDeleted'],
        )
        .andWhere(e => e.awbStatusId, w => w.equals(AWB_STATUS.RTC))
        .take(1)
        .exec();

      if (statusRTC.length) {
        result.push(statusRTC[0]);
      }
    }

    return result;
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
    qb.addSelect('do_pod_deliver_detail.awb_item_id', 'awbItemId');
    qb.addSelect(
      'do_pod_deliver_detail.awb_status_date_time_last',
      'awbStatusDateTimeLast',
    );
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
    qb.addSelect('package_type.package_type_code', 'packageTypeCode');
    qb.addSelect('awb.total_cod_value', 'totalCodValue');
    qb.addSelect('awb.is_cod', 'isCOD');
    qb.addSelect('reason.reason_code', 'reasonCode');
    qb.addSelect('reason.reason_name', 'reasonName');
    qb.addSelect('do_pod_deliver_detail.consignee_name', 'consigneeNameNote');
    qb.addSelect('do_pod_deliver_detail.is_deleted', 'isDeleted');
    qb.addSelect(
      'pickup_request_detail.recipient_longitude',
      'recipientLongitude',
    );
    qb.addSelect(
      'pickup_request_detail.recipient_latitude',
      'recipientLatitude',
    );
    qb.addSelect('pickup_request_detail.do_return', 'isDoReturn');
    qb.addSelect('pickup_request_detail.do_return_number', 'doReturnNumber');
    qb.addSelect(
      'COALESCE(awb_item_attr.is_high_value, pickup_request_detail.is_high_value, false)',
      'isHighValue',
    );

    qb.from('do_pod_deliver_detail', 'do_pod_deliver_detail');
    qb.innerJoin(
      'do_pod_deliver',
      'do_pod_deliver',
      'do_pod_deliver.do_pod_deliver_id = do_pod_deliver_detail.do_pod_deliver_id',
    );
    qb.innerJoin(
      'awb',
      'awb',
      'awb.awb_id = do_pod_deliver_detail.awb_id',
    );
    qb.innerJoin(
      'awb_item_attr',
      'awb_item_attr',
      'awb_item_attr.awb_item_id = do_pod_deliver_detail.awb_item_id AND awb_item_attr.is_deleted = false',
    );
    qb.innerJoin(
      'awb_status',
      'awb_status',
      'awb_status.awb_status_id = do_pod_deliver_detail.awb_status_id_last',
    );
    qb.innerJoin(
      'users',
      'users',
      'users.user_id = do_pod_deliver.user_id_driver',
    );
    qb.innerJoin(
      'employee',
      'employee',
      'employee.employee_id = users.employee_id',
    );
    qb.leftJoin(
      'pickup_request_detail',
      'pickup_request_detail',
      'pickup_request_detail.awb_item_id = do_pod_deliver_detail.awb_item_id',
    );
    qb.leftJoin(
      'package_type',
      'package_type',
      'package_type.package_type_id = awb.package_type_id',
    );
    qb.leftJoin(
      'reason',
      'reason',
      'reason.reason_id = do_pod_deliver_detail.reason_id_last',
    );

    // Filter
    qb.andWhere('do_pod_deliver.user_id_driver = :userIdDriver', {
      userIdDriver: authMeta.userId,
    });

    const currentMoment = moment();
    const oneDaysAgo = moment().subtract(1, 'd');
    qb.andWhere(
      'do_pod_deliver.do_pod_deliver_date_time BETWEEN :currentDateTimeStart AND :currentDateTimeEnd',
      {
        currentDateTimeStart: oneDaysAgo.format('YYYY-MM-DD 00:00:00'),
        currentDateTimeEnd: currentMoment.format('YYYY-MM-DD 23:59:59'),
      },
    );

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
