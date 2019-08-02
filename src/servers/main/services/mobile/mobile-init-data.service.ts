import { HttpStatus } from '@nestjs/common';
import moment = require('moment');
import { createQueryBuilder } from 'typeorm';

import { AwbStatus } from '../../../../shared/orm-entity/awb-status';
import { Reason } from '../../../../shared/orm-entity/reason';
import { AuthService } from '../../../../shared/services/auth.service';
import { ContextualErrorService } from '../../../../shared/services/contextual-error.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { MobileInitDataResponseVm } from '../../models/mobile-init-response.vm';

export class MobileInitDataService {
  public static async getInitDataByRequest(
    fromDate?: string,
  ): Promise<MobileInitDataResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    if (authMeta) {
      // TODO: query reason, awbStatus, and delivery based on fromDate (updated_time)
      const result = new MobileInitDataResponseVm();

      result.reason = await this.getReason();
      result.awbStatus = await this.getAwbStatus();
      result.delivery = await this.getDelivery();
      result.serverDateTime = new Date().toISOString();

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

  private static async getReason() {
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
    q.orWhere(e => e.reasonCategory, w => w.equals('pod_cod'));
    return await q.exec();
  }

  private static async getAwbStatus() {
    const repository = new OrionRepositoryService(AwbStatus);
    const q = repository.findAllRaw();
    q.selectRaw(
      ['awb_status_id', 'awbStatusId'],
      ['awb_status_name', 'awbStatusCode'],
      ['awb_status_title', 'awbStatusName'],
    );
    q.where(e => e.isDeleted, w => w.isFalse());
    q.andWhere(e => e.isProblem, w => w.isTrue());

    return await q.exec();
  }

  private static async getDelivery() {
    const qb = createQueryBuilder();
    qb.addSelect(
      'do_pod_deliver_detail.do_pod_deliver_detail_id',
      'doPodDeliverDetailId',
    );
    qb.addSelect('do_pod_deliver.do_pod_deliver_id', 'doPodDeliverId');
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
          qbJoinFrom.addSelect('employee.employee_id', 'employeeId');
          qbJoinFrom.addSelect('employee.fullname', 'employeeName');
          qbJoinFrom.addSelect('do_pod_deliver_history.awb_status_id', 'awbStatusId');
          qbJoinFrom.addSelect('do_pod_deliver_history.latitude_delivery', 'latitudeDelivery');
          qbJoinFrom.addSelect('do_pod_deliver_history.longitude_delivery', 'longitudeDelivery');
          qbJoinFrom.from('do_pod_deliver_history', 'do_pod_deliver_history');
          qbJoinFrom.where(
            'do_pod_deliver_history.do_pod_deliver_detail_id = do_pod_deliver_detail.do_pod_deliver_detail_id',
          );
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
          qbJoinFrom.leftJoin(
            qbJoinFromJoin => {
              qbJoinFromJoin.addSelect('employee.employee_id');
              qbJoinFromJoin.addSelect('employee.fullname');
              qbJoinFromJoin.from('employee', 'employee');
              qbJoinFromJoin.where(
                'employee.employee_id = do_pod_deliver_history.employee_id_driver',
              );
              return qbJoinFromJoin;
            },
            'employee',
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

    // COMMENTED FOR TEST PURPOSE
    // const authMeta = AuthService.getAuthMetadata();
    // qb.andWhere('do_pod_deliver.employee_id_driver = :currentUserId', {
    //   currentUserId: authMeta.userId,
    // });

    // const permissionTokenPayload = AuthService.getPermissionTokenPayload();
    // qb.andWhere('do_pod_deliver.branch_id = :currentBranchId', {
    //   currentBranchId: permissionTokenPayload.branchId,
    // });

    // const currentMoment = moment();
    // qb.andWhere(
    //   'do_pod_deliver.do_pod_deliver_date_time BETWEEN :currentDateTimeStart AND :currentDateTimeEnd',
    //   {
    //     currentDateTimeStart: currentMoment.format('YYYY-MM-DD 00:00:00'),
    //     currentDateTimeEnd: currentMoment.format('YYYY-MM-DD 23:59:59'),
    //   },
    // );
    return await qb.getRawMany();
  }
}
