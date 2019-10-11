// #region import
import { WebScanOutCreateDeliveryVm, WebScanOutLoadForEditVm, WebScanOutAwbVm, WebScanOutEditVm, WebScanOutDeliverEditVm } from '../../../models/web-scan-out.vm';
import { WebScanOutCreateResponseVm, WebScanOutResponseForEditVm, WebScanOutAwbResponseVm } from '../../../models/web-scan-out-response.vm';
import { AuthService } from '../../../../../shared/services/auth.service';
import { DoPodDeliver } from '../../../../../shared/orm-entity/do-pod-deliver';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { DoPodDeliverDetail } from '../../../../../shared/orm-entity/do-pod-deliver-detail';
import { DeliveryService } from '../../../../../shared/services/delivery.service';
import { DoPodDetailPostMetaQueueService } from '../../../../queue/services/do-pod-detail-post-meta-queue.service';
import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { RedisService } from '../../../../../shared/services/redis.service';
import { AwbTroubleService } from '../../../../../shared/services/awb-trouble.service';
import moment = require('moment');
import { createQueryBuilder } from 'typeorm';
import { DoPodDeliverRepository } from '../../../../../shared/orm-repository/do-pod-deliver.repository';
import { AuditHistory } from '../../../../../shared/orm-entity/audit-history';
// #endregion

export class LastMileDeliveryOutService {

  /**
   * Create DO POD Deliver
   * with type: Deliver (Sigesit)
   * @param {WebScanOutCreateDeliveryVm} payload
   * @returns {Promise<WebScanOutCreateResponseVm>}
   * @memberof WebDeliveryOutService
   */
  static async scanOutCreateDelivery(
    payload: WebScanOutCreateDeliveryVm,
  ): Promise<WebScanOutCreateResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new WebScanOutCreateResponseVm();

    // create do_pod_deliver (Surat Jalan Antar sigesit)
    const doPod = DoPodDeliver.create();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const doPodDateTime = moment(payload.doPodDateTime).toDate();

    // NOTE: Tipe surat (jalan Antar Sigesit)
    doPod.doPodDeliverCode = await CustomCounterCode.doPodDeliver(
      doPodDateTime,
    ); // generate code

    // doPod.userIdDriver = payload.
    doPod.userIdDriver = payload.userIdDriver || null;
    doPod.doPodDeliverDateTime = doPodDateTime;
    doPod.description = payload.desc || null;

    doPod.branchId = permissonPayload.branchId;
    doPod.userId = authMeta.userId;

    // await for get do pod id
    await DoPodDeliver.save(doPod);

    await LastMileDeliveryOutService.createAuditDeliveryHistory(
      doPod.doPodDeliverId,
    );

    // Populate return value
    result.status = 'ok';
    result.message = 'success';
    result.doPodId = doPod.doPodDeliverId;

    return result;
  }

  /**
   * Update DO POD Deliver AWB
   * with type: Transit (Internal/3PL) and Criss Cross
   * @param {WebScanOutCreateVm} payload
   * @returns {Promise<WebScanOutCreateResponseVm>}
   * @memberof WebDeliveryOutService
   */
  static async scanOutUpdateDelivery(
    payload: WebScanOutDeliverEditVm,
  ): Promise<WebScanOutCreateResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new WebScanOutCreateResponseVm();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    let totalAdd = 0;
    let totalRemove = 0;
    // edit do_pod (Surat Jalan)
    const doPod = await DoPodDeliverRepository.getDataById(
      payload.doPodDeliverId,
    );
    if (doPod) {
      // looping data list remove awb number
      if (payload.removeAwbNumber && payload.removeAwbNumber.length) {
        for (const addAwb of payload.removeAwbNumber) {
          const awb = await DeliveryService.validAwbNumber(addAwb);
          const doPodDeliverDetail = await DoPodDeliverDetail.findOne(
            {
              where: {
                doPodDeliverId: payload.doPodDeliverId,
                awbItemId: awb.awbItemId,
                isDeleted: false,
              },
            },
          );

          if (doPodDeliverDetail) {
            DoPodDeliverDetail.update(
              doPodDeliverDetail.doPodDeliverDetailId,
              {
                isDeleted: true,
              },
            );
            // NOTE: update awb_item_attr and awb_history
            await DeliveryService.updateAwbAttr(
              awb.awbItemId,
              null,
              AWB_STATUS.IN_BRANCH,
            );
            // NOTE: queue by Bull
            DoPodDetailPostMetaQueueService.createJobByAwbDeliver(
              awb.awbItemId,
              AWB_STATUS.IN_BRANCH,
              permissonPayload.branchId,
              authMeta.userId,
              doPod.userDriver.employeeId,
            );
          }
        }
        totalRemove = payload.removeAwbNumber.length;
      }
      // looping data list add awb number
      if (payload.addAwbNumber && payload.addAwbNumber.length) {
        for (const addAwb of payload.addAwbNumber) {
          // find awb_item_attr
          const awb = await DeliveryService.validAwbNumber(addAwb);
          // add data do_pod_detail
          const doPodDeliverDetail = DoPodDeliverDetail.create();
          doPodDeliverDetail.doPodDeliverId = payload.doPodDeliverId;
          doPodDeliverDetail.awbItemId = awb.awbItemId;
          doPodDeliverDetail.awbStatusIdLast = AWB_STATUS.ANT;
          await DoPodDeliverDetail.save(doPodDeliverDetail);

          // awb_item_attr and awb_history ??
          await DeliveryService.updateAwbAttr(
            awb.awbItemId,
            null,
            AWB_STATUS.OUT_BRANCH,
          );

          // TODO: need refactoring
          // NOTE: queue by Bull
          DoPodDetailPostMetaQueueService.createJobByAwbDeliver(
            awb.awbItemId,
            AWB_STATUS.OUT_BRANCH,
            permissonPayload.branchId,
            authMeta.userId,
            doPod.userDriver.employeeId,
          );
        }
        totalAdd = payload.addAwbNumber.length;
      }

      const totalAwb = await LastMileDeliveryOutService.getTotalDetailById(
        doPod.doPodDeliverId,
      );
      // update data
      // NOTE: (current status) (next feature, ada scan berangkat dan tiba)
      const updateDoPod = {
        userIdDriver: payload.userIdDriver,
        description: payload.desc,
        branchId: permissonPayload.branchId,
        userId: authMeta.userId,
        totalAwb,
      };
      await DoPodDeliver.update(doPod.doPodDeliverId, updateDoPod);

      // NOTE: insert table audit history
      await LastMileDeliveryOutService.createAuditDeliveryHistory(
        doPod.doPodDeliverId,
      );

      result.status = 'ok';
      result.message = 'success';
    } else {
      result.status = 'error';
      result.message = 'Surat Jalan tidak valid/Sudah pernah Scan In';
    }
    result.doPodId = payload.doPodDeliverId;
    return result;
  }

  static async scanOutDeliverLoadForEdit(
    payload: WebScanOutLoadForEditVm,
  ): Promise<WebScanOutResponseForEditVm> {
    const doPodDeliverId = payload.doPodId;

    // Get Data from do_pod scanout start
    const repo = new OrionRepositoryService(DoPodDeliver, 't1');
    const q = repo.findAllRaw();

    // Get Data for internal Method
    q.selectRaw(
      ['t1.do_pod_deliver_id', 'doPodId'],
      ['t1.user_id_driver', 'userIdDriver'],
      ['t1.branch_id', 'branchIdTo'],
      ['t2.fullname', 'employeeName'],
      ['t2.nik', 'nik'],
      ['t3.branch_name', 'branchTo'],
      ['t3.branch_code', 'branchCode'],
    );
    // TODO: fix query relation to employee
    q.innerJoin(e => e.userDriver.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.doPodDeliverId, w => w.equals(doPodDeliverId));

    const data = await q.exec();
    // Get Data from do_pod scanout end

    // Get Data for scanout detail start
    const repo2 = new OrionRepositoryService(DoPodDeliverDetail, 'tb1');
    const q2 = repo2.findAllRaw();

    // Get Data for scanout for awb detail
    q2.selectRaw(
      ['tb2.awb_number', 'awbNumber'],
      [`CONCAT(CAST(tb2.total_weight AS NUMERIC(20,2)),' Kg')`, 'weight'],
      ['tb2.consignee_name', 'consigneeName'],
    );

    q2.innerJoin(e => e.awbItem.awb, 'tb2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q2.andWhere(e => e.doPodDeliverId, w => w.equals(doPodDeliverId));
    q2.andWhere(e => e.isDeleted, w => w.isFalse());

    const data2 = await q2.exec();
    // Get Data for scanout detail end

    const result = new WebScanOutResponseForEditVm();

    result.data = data;
    result.data_detail = data2;

    return result;
  }

  static async scanOutAwbDeliver(
    payload: WebScanOutAwbVm,
  ): Promise<WebScanOutAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const result = new WebScanOutAwbResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    for (const awbNumber of payload.awbNumber) {
      const response = {
        status: 'ok',
        message: 'Success',
      };

      const awb = await DeliveryService.validAwbNumber(awbNumber);
      if (awb) {
        const statusCode = await DeliveryService.awbStatusGroup(
          awb.awbStatusIdLast,
        );

        switch (statusCode) {
          case 'OUT':
            // check condition
            if (awb.branchIdLast == permissonPayload.branchId) {
              totalSuccess += 1;
              response.message = `Resi ${awbNumber} sudah pernah scan out`;
            } else {
              // save data to awb_trouble
              await AwbTroubleService.fromScanOut(
                awbNumber,
                awb.branchLast.branchName,
                awb.awbStatusIdLast,
              );

              totalError += 1;
              response.status = 'error';
              response.message =
                `Resi ${awbNumber} belum scan in, mohon untuk` +
                `melakukan scan in terlebih dahulu di gerai` +
                ` - ${awb.branchLast.branchName}`;
            }
            break;

          case 'POD':
            totalError += 1;
            response.status = 'error';
            response.message = `Resi ${awbNumber} sudah di proses POD`;
            break;

          case 'IN':
            if (awb.branchIdLast == permissonPayload.branchId) {
              // Add Locking setnx redis
              const holdRedis = await RedisService.locking(
                `hold:scanoutant:${awb.awbItemId}`,
                'locking',
              );
              if (holdRedis) {
                // save table do_pod_detail
                // NOTE: create data do pod detail per awb number
                const doPodDeliverDetail = DoPodDeliverDetail.create();
                doPodDeliverDetail.doPodDeliverId = payload.doPodId;
                doPodDeliverDetail.awbItemId = awb.awbItemId;
                doPodDeliverDetail.awbStatusIdLast = AWB_STATUS.ANT;
                await DoPodDeliverDetail.save(doPodDeliverDetail);

                // AFTER Scan OUT ===============================================
                // #region after scanout

                // Update do_pod
                const doPodDeliver = await DoPodDeliver.findOne({
                  select: ['doPodDeliverId', 'totalAwb'],
                  where: {
                    doPodDeliverId: payload.doPodId,
                    isDeleted: false,
                  },
                });

                // counter total scan out
                doPodDeliver.totalAwb = doPodDeliver.totalAwb + 1;
                await DoPodDeliver.save(doPodDeliver);
                await DeliveryService.updateAwbAttr(
                  awb.awbItemId,
                  null,
                  AWB_STATUS.ANT,
                );

                // NOTE: queue by Bull
                DoPodDetailPostMetaQueueService.createJobByAwbDeliver(
                  awb.awbItemId,
                  AWB_STATUS.ANT,
                  permissonPayload.branchId,
                  authMeta.userId,
                  doPodDeliver.userDriver.employeeId,
                );
                // #endregion after scanout

                totalSuccess += 1;
                // remove key holdRedis
                RedisService.del(`hold:scanoutant:${awb.awbItemId}`);
              } else {
                totalError += 1;
                response.status = 'error';
                response.message = 'Server Busy';
              }
            } else {
              // save data to awb_trouble
              await AwbTroubleService.fromScanOut(
                awbNumber,
                awb.branchLast.branchName,
                awb.awbStatusIdLast,
              );

              totalError += 1;
              response.status = 'error';
              response.message =
                `Resi ${awbNumber} milik gerai, ` +
                `${awb.branchLast.branchCode} - ${awb.branchLast.branchName}.`;
            }
            break;

          default:
            totalError += 1;
            response.status = 'error';
            response.message = `Resi ${awbNumber} tidak dapat SCAN OUT, Harap hubungi kantor pusat`;
            break;
        }
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `Resi ${awbNumber} Tidak di Temukan`;
      }

      // push item
      dataItem.push({
        awbNumber,
        ...response,
      });
    } // end of loop

    // Populate return value
    result.totalData = payload.awbNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }

  // private
  private static async getTotalDetailById(doPodDeliverId: string) {
    const qb = createQueryBuilder();
    qb.from('do_pod_deliver_detail', 'do_pod_deliver_detail');
    qb.where('do_pod_deliver_detail.do_pod_deliver_id = :doPodDeliverId', {
      doPodDeliverId,
    });
    return await qb.getCount();
  }

  // TODO: send to background job process
  private static async createAuditDeliveryHistory(doPodDeliveryId: string) {
    // find doPodDeliver
    const doPodDeliver = await DoPodDeliverRepository.getDataById(
      doPodDeliveryId,
    );
    if (doPodDeliver) {
      // construct note for information
      const description = doPodDeliver.description
        ? doPodDeliver.description
        : '';
      const note = `
        Nama Driver  : ${doPodDeliver.userDriver.employee.employeeName}
        Gerai Assign : ${doPodDeliver.branch.branchName}
        Note         : ${description}
      `;
      // create new object AuditHistory
      const auditHistory = AuditHistory.create();
      auditHistory.changeId = doPodDeliveryId;
      auditHistory.transactionStatusId = 1300; // NOTE: doPodDelivery
      auditHistory.note = note;
      return await AuditHistory.save(auditHistory);
    }
  }
}
