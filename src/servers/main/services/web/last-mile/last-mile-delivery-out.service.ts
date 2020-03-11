// #region import
import { createQueryBuilder, getManager, MoreThan } from 'typeorm';
import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { AuditHistory } from '../../../../../shared/orm-entity/audit-history';
import { DoPodDeliver } from '../../../../../shared/orm-entity/do-pod-deliver';
import { DoPodDeliverDetail } from '../../../../../shared/orm-entity/do-pod-deliver-detail';
import {
    DoPodDeliverRepository,
} from '../../../../../shared/orm-repository/do-pod-deliver.repository';
import { AuthService } from '../../../../../shared/services/auth.service';
import { AwbTroubleService } from '../../../../../shared/services/awb-trouble.service';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { RedisService } from '../../../../../shared/services/redis.service';
import {
    DoPodDetailPostMetaQueueService,
} from '../../../../queue/services/do-pod-detail-post-meta-queue.service';
import {
    WebScanOutAwbResponseVm, WebScanOutCreateResponseVm, WebScanOutResponseForEditVm, WebAwbThirdPartyListResponseVm, ScanAwbVm,
} from '../../../models/web-scan-out-response.vm';
import {
    WebScanOutAwbVm, WebScanOutCreateDeliveryVm, WebScanOutDeliverEditVm, WebScanOutLoadForEditVm, TransferAwbDeliverVm,
} from '../../../models/web-scan-out.vm';
import { AwbService } from '../../v1/awb.service';
import moment = require('moment');
import { AutoUpdateAwbStatusService } from '../../v1/auto-update-awb-status.service';
import { ProofDeliveryResponseVm, ProofDeliveryPayloadVm } from '../../../models/last-mile/proof-delivery.vm';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../../shared/services/meta.service';
import { QueryBuilderService } from '../../../../../shared/services/query-builder.service';
import { DoPod } from '../../../../../shared/orm-entity/do-pod';
import { POD_TYPE } from '../../../../../shared/constants/pod-type.constant';
import { AwbThirdPartyVm, AwbThirdPartyUpdateResponseVm } from '../../../models/last-mile/awb-third-party.vm';
import { PodScanIn } from '../../../../../shared/orm-entity/pod-scan-in';
import { Employee } from '../../../../../shared/orm-entity/employee';
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
    const authMeta             = AuthService.getAuthData();
    const result               = new WebScanOutCreateResponseVm();

    // create do_pod_deliver (Surat Jalan Antar sigesit)
    const doPod                = DoPodDeliver.create();
    const permissonPayload     = AuthService.getPermissionTokenPayload();
    // NOTE                    : moment(payload.doPodDateTime).toDate();
    const doPodDateTime        = moment().toDate();

    // NOTE                    : Tipe surat (jalan Antar Sigesit)
    doPod.doPodDeliverCode     = await CustomCounterCode.doPodDeliver(
      doPodDateTime,
    ); // generate code

    // doPod.userIdDriver      = payload.
    doPod.userIdDriver         = payload.userIdDriver || null;
    doPod.doPodDeliverDateTime = doPodDateTime;
    doPod.description          = payload.desc || null;

    doPod.branchId             = permissonPayload.branchId;
    doPod.userId               = authMeta.userId;

    // NOTE: check if delivery with partner
    if (payload.isPartner) {
      doPod.isPartner = true;
      doPod.partnerId = payload.partnerId;
    } else {
      doPod.isPartner = false;
    }

    // await for get do pod id
    await DoPodDeliver.save(doPod);

    await this.createAuditDeliveryHistory(
      doPod.doPodDeliverId,
      false,
    );

    // Populate return value
    result.status = 'ok';
    result.message = 'success';
    result.doPodId = doPod.doPodDeliverId;

    // query for get Employee

    if (!payload.isPartner) {
        const repo = new OrionRepositoryService(Employee, 't1');
        const q = repo.findAllRaw();

        q.selectRaw(
          [
            't1.nik',
            'nik',
          ],
          ['t1.nickname', 'nickname'],
        );

        q.innerJoin(e => e.user, 't2');
        q.where(
          e => e.user.userId,
          w => w.equals(payload.userIdDriver),
        );
        const dataUser = await q.exec();

        // For printDoPodDeliverMetadata
        result.printDoPodDeliverMetadata.doPodDeliverCode             = doPod.doPodDeliverCode;
        result.printDoPodDeliverMetadata.description                  = payload.desc;
        result.printDoPodDeliverMetadata.userDriver.employee.nik      = dataUser[0].nik;
        result.printDoPodDeliverMetadata.userDriver.employee.nickname = dataUser[0].nickname;

    }

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
          const awb = await AwbService.validAwbNumber(addAwb);
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
            await AwbService.updateAwbAttr(
              awb.awbItemId,
              AWB_STATUS.IN_BRANCH,
              null,
            );
            // NOTE: queue by Bull
            DoPodDetailPostMetaQueueService.createJobByAwbUpdateStatus(
              awb.awbItemId,
              AWB_STATUS.IN_BRANCH,
              permissonPayload.branchId,
              authMeta.userId,
            );
          }
        }
        totalRemove = payload.removeAwbNumber.length;
      }
      // looping data list add awb number
      if (payload.addAwbNumber && payload.addAwbNumber.length) {
        for (const addAwb of payload.addAwbNumber) {
          // find awb_item_attr
          const awb = await AwbService.validAwbNumber(addAwb);
          // add data do_pod_detail
          const doPodDeliverDetail = DoPodDeliverDetail.create();
          doPodDeliverDetail.doPodDeliverId = payload.doPodDeliverId;
          doPodDeliverDetail.awbId = awb.awbId;
          doPodDeliverDetail.awbItemId = awb.awbItemId;
          doPodDeliverDetail.awbNumber = addAwb;
          doPodDeliverDetail.awbStatusIdLast = AWB_STATUS.ANT;
          await DoPodDeliverDetail.save(doPodDeliverDetail);

          // awb_item_attr and awb_history ??
          await AwbService.updateAwbAttr(
            awb.awbItemId,
            AWB_STATUS.OUT_BRANCH,
            null,
          );

          // TODO: need refactoring
          // NOTE: queue by Bull
          DoPodDetailPostMetaQueueService.createJobByAwbUpdateStatus(
            awb.awbItemId,
            AWB_STATUS.OUT_BRANCH,
            permissonPayload.branchId,
            authMeta.userId,
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
        branchId: permissonPayload.branchId,
        userId: authMeta.userId,
        totalAwb,
      };
      await DoPodDeliver.update(doPod.doPodDeliverId, updateDoPod);

      // NOTE: insert table audit history
      await this.createAuditDeliveryHistory(
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

    // find data doPod Deliver
    // const doPodDeliver = await DoPodDeliver.findOne({
    //   where: {
    //     doPodDeliverId: payload.doPodId,
    //     isDeleted: false,
    //   },
    //   lock: { mode: 'pessimistic_write' },
    // });

    for (const awbNumber of payload.awbNumber) {
      const response = new ScanAwbVm();
      response.status = 'ok';
      response.message = 'success';

      const awb = await AwbService.validAwbNumber(awbNumber);
      if (awb) {
        // TODO: validation need improvement
        // handle if awb status is null
        let notDeliver = true;
        if (awb.awbStatusIdLast && awb.awbStatusIdLast != 0) {
          notDeliver = awb.awbStatusIdLast != AWB_STATUS.ANT ? true : false;
        }

        // NOTE: first must scan in branch
        if (notDeliver) {
          // add handel final status
          const statusFinal = [AWB_STATUS.DLV, AWB_STATUS.RTN, AWB_STATUS.RTS];
          if (statusFinal.includes(awb.awbStatusIdLast)) {
            totalError += 1;
            response.status = 'error';
            response.message = `Resi ${awbNumber} sudah Final Status !`;
          } else {
            const statusCode = await AwbService.awbStatusGroup(
              awb.awbStatusIdLast,
            );
            // save data to awb_troubleß
            if (statusCode != 'IN') {
              const branchName = awb.branchLast ? awb.branchLast.branchName : '';
              await AwbTroubleService.fromScanOut(
                awbNumber,
                branchName,
                awb.awbStatusIdLast,
              );
            }

            // AUTO STATUS
            // TODO: set enable and disble
            // if (statusCode == 'IN' && awb.branchIdLast != permissonPayload.branchId) {
            //   await AutoUpdateAwbStatusService.awbDeliver(
            //     awb,
            //     authMeta.userId,
            //     permissonPayload.branchId,
            //   );
            // }

            // Add Locking setnx redis
            const holdRedis = await RedisService.locking(
              `hold:scanoutant:${awb.awbItemId}`,
              'locking',
            );
            if (holdRedis) {
              // AFTER Scan OUT ===============================================
              // #region after scanout
              // Update do_pod
              const doPodDeliver = await DoPodDeliverRepository.getDataById(
                payload.doPodId,
              );

              if (doPodDeliver) {
                // save table do_pod_detail
                // NOTE: create data do pod detail per awb number
                const doPodDeliverDetail = DoPodDeliverDetail.create();
                doPodDeliverDetail.doPodDeliverId = payload.doPodId;
                doPodDeliverDetail.awbId = awb.awbId;
                doPodDeliverDetail.awbItemId = awb.awbItemId;
                doPodDeliverDetail.awbNumber = awbNumber;
                doPodDeliverDetail.awbStatusIdLast = AWB_STATUS.ANT;
                await DoPodDeliverDetail.insert(doPodDeliverDetail);

                // Assign print metadata - Scan Out & Deliver
                response.printDoPodDetailMetadata.awbItem.awb.awbId = awb.awbId;
                response.printDoPodDetailMetadata.awbItem.awb.awbNumber = awbNumber;
                response.printDoPodDetailMetadata.awbItem.awb.consigneeName = awb.awbItem.awb.consigneeName;

                // Assign print metadata - Deliver
                response.printDoPodDetailMetadata.awbItem.awb.consigneeAddress = awb.awbItem.awb.consigneeAddress;
                response.printDoPodDetailMetadata.awbItem.awb.consigneeNumber = awb.awbItem.awb.consigneeNumber;
                response.printDoPodDetailMetadata.awbItem.awb.consigneeZip = awb.awbItem.awb.consigneeZip;
                response.printDoPodDetailMetadata.awbItem.awb.isCod = awb.awbItem.awb.isCod;
                response.printDoPodDetailMetadata.awbItem.awb.totalCodValue = awb.awbItem.awb.totalCodValue;
                response.printDoPodDetailMetadata.awbItem.awb.awbItemId = awb.awbItemId;

                // TODO: need improvement counter total scan out
                const totalAwb = doPodDeliver.totalAwb + 1;
                await DoPodDeliver.update(doPodDeliver.doPodDeliverId, {
                  totalAwb,
                });

                // NOTE: queue by Bull ANT
                let employeeId   = doPodDeliver.userDriver.employeeId;
                let employeeName = doPodDeliver.userDriver.employee.employeeName;
                if (doPodDeliver.isPartner) {
                  employeeId   = 0; // partner does'n have employee id
                  employeeName = null;
                }

                DoPodDetailPostMetaQueueService.createJobByAwbDeliver(
                  awb.awbItemId,
                  AWB_STATUS.ANT,
                  permissonPayload.branchId,
                  authMeta.userId,
                  employeeId,
                  employeeName,
                );
                totalSuccess += 1;
              } else {
                totalError += 1;
                response.status = 'error';
                response.message = `Surat Jalan: Resi ${awbNumber} tidak valid.`;
              }
              // #endregion after scanout
              // remove key holdRedis
              RedisService.del(`hold:scanoutant:${awb.awbItemId}`);
            } else {
              totalError += 1;
              response.status = 'error';
              response.message = `Server Busy: Resi ${awbNumber} sudah di proses.`;
            }
          } // handle status final
        } else {
          totalError += 1;
          response.status = 'error';
          response.message = `Resi ${awbNumber} sudah di proses.`;
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

    // TODO: need improvement
    // if (doPodDeliver && totalSuccess > 0) {
    //   const totalAwb = doPodDeliver.totalAwb + totalSuccess;
    //   await DoPodDeliver.update(doPod.doPodId, {
    //     totalAwb,
    //   });
    // }

    // Populate return value
    result.totalData = payload.awbNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }

  static async listProofDelivery(payload: BaseMetaPayloadVm)
  : Promise<ProofDeliveryResponseVm> {
    // mapping field
    payload.fieldResolverMap['awbNumber'] = 't3.awb_number';
    payload.fieldResolverMap['doPodDeliverCode'] = 't1.do_pod_deliver_code';
    payload.fieldResolverMap['doPodDeliverDateTime'] = 't1.do_pod_deliver_date_time';

    const repo = new OrionRepositoryService(DoPodDeliver, 't1');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.innerJoin(e => e.userDriver.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodDeliverDetails, 't3', j =>
    j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodDeliverDetails.awbStatus, 't5', j =>
    j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodDeliverDetails.awb, 't6', j =>
    j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    const result = new ProofDeliveryResponseVm();

    // GET TOTAL STATUS AWB
    const q1 = q;
    q1.selectRaw(
      [
        'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last = 30000)',
        'totalSuccessAwb',
      ],
      [
        'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last <> 30000)',
        'totalErrorAwb',
      ],
      );
    const dataTotal = await q1.exec();
    result.totalSuccessAwb = 0;
    result.totalErrorAwb = 0;

    if (dataTotal.length != 0) {
      const temp = dataTotal[0];
      result.totalSuccessAwb = temp.totalSuccessAwb;
      result.totalErrorAwb = temp.totalErrorAwb;
    }

    if (payload.sortBy === '') {
      payload.sortBy = 'doPodDeliverDateTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doPodDeliverCode',
      },
      {
        field: 'awbNumber',
      },
    ];
    // GET SELECTED QUERY
    const q2 = q;
    payload.applyToOrionRepositoryQuery(q, true);
    q2.selectRaw(
      ['t1.do_pod_deliver_code', 'doPodDeliverCode'],
      ['t1.do_pod_deliver_id', 'doPodDeliverId'],
      ['t2.nik', 'driverNik'],
      ['t2.fullname', 'driverFullName'],
      ['t3.awb_number', 'awbNumber'],
      [`COALESCE(t3.awb_status_date_time_last, t1.do_pod_deliver_date_time)`, 'awbStatusDateLast'],
      [`COALESCE(t3.consignee_name, '')`, 'refConsigneeName'],
      ['t5.awb_status_name', 'awbStatusCode'],
      ['t5.awb_status_title', 'awbStatusName'],
      [`COALESCE(t6.consignee_name, '')`, 'consigneeName'],
      [`COALESCE(t6.consignee_address, '')`, 'consigneeAddress'],
    );
    q2.groupByRaw(`t1.do_pod_deliver_code, t3.awb_number, t2.nik, t2.fullname, t3.awb_status_date_time_last, t1.do_pod_deliver_id, t3.awb_status_id_last,
                t3.consignee_name, t6.consignee_name, t6.consignee_address, t5.awb_status_name, t5.awb_status_title, t1.do_pod_deliver_date_time`);
    const data = await q2.exec();
    const total = await q2.countWithoutTakeAndSkip();

    result.doPodDeliverCode = '';
    result.driverNik = '';
    result.driverFullName = '';
    result.doPodDeliverId = '';

    if (data.length != 0) {
      const temp = data[0];
      result.doPodDeliverCode = temp.doPodDeliverCode;
      result.driverNik        = temp.driverNik;
      result.driverFullName   = temp.driverFullName;
      result.doPodDeliverId   = temp.doPodDeliverId;
    }

    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }

  static async transferAwbNumber(
    payload: TransferAwbDeliverVm,
  ): Promise<WebScanOutAwbResponseVm> {
    const authMeta = AuthService.getAuthData();

    const dataItem = [];
    const result = new WebScanOutAwbResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    for (const awbNumber of payload.awbNumber) {
      const response = {
        status: 'ok',
        message: 'Success',
      };

      const awb = await AwbService.validAwbNumber(awbNumber);
      if (awb) {
        // add handel final status
        const statusFinal = [AWB_STATUS.DLV, AWB_STATUS.RTN, AWB_STATUS.RTS];
        if (statusFinal.includes(awb.awbStatusIdLast)) {
          totalError += 1;
          response.status = 'error';
          response.message = `Resi ${awbNumber} sudah Final Status !`;
        } else {
          // NOTE: TRANSFER AWB NUMBER
          const awbDeliver = await DoPodDeliverDetail.findOne({
            where: {
              awbNumber,
              awbStatusIdLast: AWB_STATUS.ANT,
              isDeleted: false,
            },
          });
          // handle only status ANT
          if (awbDeliver) {
            // Add Locking setnx redis
            const holdRedis = await RedisService.locking(
              `hold:scanout-transfer:${awbDeliver.awbItemId}`,
              'locking',
            );
            if (holdRedis) {
              // Update data do pod detail per awb number
              // doPodDeliverId;
              await DoPodDeliverDetail.update(
                awbDeliver.doPodDeliverDetailId,
                {
                  isDeleted: true,
                  userIdUpdated: authMeta.userId,
                  updatedTime: moment().toDate(),
                },
              );

              // balance total awb
              await getManager().transaction(
                async transactionEntityManager => {
                  const awbItemAttr = await AwbItemAttr.findOne({
                    where: {
                      awbItemId: awbDeliver.awbItemId,
                      isDeleted: false,
                    },
                  });
                  if (awbItemAttr) {
                    await transactionEntityManager.update(
                      AwbItemAttr,
                      awbItemAttr.awbItemAttrId,
                      {
                        awbStatusIdLast: AWB_STATUS.IN_BRANCH,
                        updatedTime: moment().toDate(),
                      },
                    );
                  }

                  await transactionEntityManager.decrement(
                    DoPodDeliver,
                    {
                      doPodDeliverId: awbDeliver.doPodDeliverId,
                      totalAwb: MoreThan(0),
                    },
                    'totalAwb',
                    1,
                  );
                },
              );

              totalSuccess += 1;
              // remove key holdRedis
              RedisService.del(`hold:scanout-transfer:${awbDeliver.awbItemId}`);
            } else {
              totalError += 1;
              response.status = 'error';
              response.message = `Server Busy: Resi ${awbNumber} sudah di proses.`;
            }
          } else {
            totalError += 1;
            response.status = 'error';
            response.message = `Resi ${awbNumber}, bermasalah harap scan Antar terlebih dahulu`;
          }
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
    } // end loop

    // Populate return value
    result.totalData = payload.awbNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }

  static async awbThirdPartyList(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbThirdPartyListResponseVm> {
    // mapping field
    payload.fieldResolverMap['doPodDateTime'] = 't1.do_pod_date_time';
    payload.fieldResolverMap['doPodCode'] = 't1.do_pod_code';
    payload.fieldResolverMap['userIdDriver'] = 't1.user_id_driver';
    payload.fieldResolverMap['partnerLogisticId'] = 't1.partner_logistic_id';
    payload.fieldResolverMap['nickname'] = 't2.nickname';
    payload.fieldResolverMap['awbNumber'] = 't4.awb_number';
    payload.fieldResolverMap['branchTo'] = 't1.branch_id_to';
    payload.fieldResolverMap['branchId'] = 't1.branch_id';
    if (payload.sortBy === '') {
      payload.sortBy = 'doPodDateTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doPodDateTime',
      },
      {
        field: 'doPodCode',
      },
      {
        field: 'nickname',
      },
    ];

    const repo = new OrionRepositoryService(DoPod, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_pod_code', 'doPodCode'],
      ['t1.do_pod_date_time', 'doPodDateTime'],
      ['t2.employee_id', 'employeeIdDriver'],
      ['t2.fullname', 'nickname'],
      ['t3.partner_logistic_name', 'partnerLogisticName'],
      ['t4.awb_number', 'awbNumber'],
      ['t4.awb_item_id', 'awbItemId'],
      ['t5.awb_third_party', 'awbThirdParty'],
    );
    // TODO: relation userDriver to Employee Driver

    q.innerJoin(e => e.userDriver.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.partnerLogistic, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.doPodDetails, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.doPodDetails.awbItemAttr, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    // q.andWhere(e => e.doPodType, w => w.equals(POD_TYPE.OUT_BRANCH));
    q.andWhere(e => e.doPodMethod, w => w.equals(3000)); // 3pl

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebAwbThirdPartyListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async awbThirdPartyUpdate(
    payload: AwbThirdPartyVm,
  ): Promise<AwbThirdPartyUpdateResponseVm> {
    // const authMeta = AuthService.getAuthData();
    const response = {
      status: 'ok',
      message: 'Success',
    };

    const awb = await AwbItemAttr.findOne({
      where: {
        awbItemId: payload.awbItemId,
        isDeleted: false,
      },
    });

    if (awb) {
      await AwbItemAttr.update(awb.awbItemAttrId, {
        awbThirdParty: payload.awbThirdParty,
        updatedTime: moment().toDate(),
      });
    } else {
      response.status = 'error';
      response.message = `Resi ${payload.awbNumber} Tidak di Temukan`;
    }
    return response;
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
  private static async createAuditDeliveryHistory(
    doPodDeliveryId: string,
    isUpdate: boolean = true,
  ) {
    // find doPodDeliver
    const doPodDeliver = await DoPodDeliverRepository.getDataById(
      doPodDeliveryId,
    );
    if (doPodDeliver) {
      // construct note for information
      const description = doPodDeliver.description
        ? doPodDeliver.description
        : '';
      const stage = isUpdate ? 'Updated' : 'Created';
      const note = `
        Data ${stage} \n
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
