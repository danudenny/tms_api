import moment = require('moment');
import express = require('express');
import { EntityManager, getManager, LessThan, MoreThan } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { DoPodReturn } from '../../../../../shared/orm-entity/do-pod-return';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { User } from '../../../../../shared/orm-entity/user';
import { DoPodReturnDetail } from '../../../../../shared/orm-entity/do-pod-return-detail';
import { DoPodReturnHistory } from '../../../../../shared/orm-entity/do-pod-return-history';
import { AwbStatus } from '../../../../../shared/orm-entity/awb-status';
import { RedisService } from '../../../../../shared/services/redis.service';
import { AwbService } from '../../v1/awb.service';
import { EmployeeService } from '../../master/employee.service';
import { AuthService } from '../../../../../shared/services/auth.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { MetaService } from '../../../../../shared/services/meta.service';
import { DoPodReturnService } from '../../master/do-pod-return.service';
import { DoPodReturnDetailService } from '../../master/do-pod-return-detail.service';
import { DoPodDetailPostMetaQueueService } from '../../../../queue/services/do-pod-detail-post-meta-queue.service';
import { RequestErrorService } from '../../../../../shared/services/request-error.service';
import { PrintByStoreService } from '../../print-by-store.service';
import { RepositoryService } from '../../../../../shared/services/repository.service';
import { PrinterService } from '../../../../../shared/services/printer.service';
import { AwbReturnService } from '../../master/awb-return.service';
import { AwbNotificationMailQueueService } from '../../../../../servers/queue/services/notification/awb-notification-mail-queue.service';

import { PrintDoPodDeliverDataDoPodDeliverDetailVm } from '../../../models/print-do-pod-deliver.vm';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import {
  PhotoReturnDetailVm,
  PrintDoPodReturnPayloadQueryVm,
  PrintDoPodReturnVm,
  WebAwbReturnSyncPayloadVm,
  WebDoPodCreateReturnPayloadVm,
  WebReturnVm,
  WebScanAwbReturnPayloadVm,
} from '../../../models/first-mile/do-pod-return-payload.vm';
import {
  ScanAwbReturnVm,
  WebDoPodCreateReturnResponseVm,
  WebScanAwbReturnResponseVm,
  WebScanOutReturnListResponseVm,
  WebScanOutReturnGroupListResponseVm,
  WebReturnListResponseVm,
  PrintDoPodReturnDataVm,
  WebAwbReturnSyncResponseVm,
  AwbReturnManualSync,
} from '../../../models/first-mile/do-pod-return-response.vm';
import { PhotoResponseVm } from '../../../../../servers/main/models/bag-order-detail-response.vm';
import { AwbStatusService } from '../../master/awb-status.service';


export class FirstMileDoPodReturnService {

  static async scanAwbReturn(
    payload: WebScanAwbReturnPayloadVm,
  ): Promise<WebScanAwbReturnResponseVm> {
    const result = new WebScanAwbReturnResponseVm();

    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    let totalSuccess = 0;
    let totalError = 0;
    let employeeIdDriver = 0; // partner does not have employee id
    let employeeNameDriver = null;

    // find data doPod Return
    const doPodReturn = await DoPodReturnService.byIdCache(payload.doPodReturnId);
    if (!doPodReturn) {
      throw new BadRequestException('Surat Jalan tidak valid!');
    }

    if (doPodReturn && doPodReturn.userIdDriver) {
      // find by user driver
      const userDriver = await User.findOne({
        userId: doPodReturn.userIdDriver,
        isDeleted: false,
      }, { cache: true });
      if (userDriver) {
        employeeIdDriver = userDriver.employeeId;
        employeeNameDriver = userDriver.firstName;
      }
    }

    for (const awbNumber of payload.awbNumber) {
      const response = new ScanAwbReturnVm();
      response.status = 'ok';
      response.message = 'success';

      const awb = await AwbService.validAwbNumber(awbNumber);
      if (awb) {
        const checkValidAwbStatusIdLast = AwbStatusService.checkValidAwbStatusIdLast(awb);
        if (checkValidAwbStatusIdLast.isValid) {
          // Add Locking setnx redis
          const holdRedis = await RedisService.lockingWithExpire(
            `hold:scanoutant:${awb.awbItemId}`,
            'locking',
            60,
          );
          if (holdRedis) {
            try {

              await getManager().transaction(async transactionManager => {
                // flag delete data if exist, handle double awb on spk
                await this.deleteExistDoPodReturnDetail(awb.awbItemId, authMeta.userId, transactionManager);

                // save table do_pod_return_detail
                await DoPodReturnDetailService.createDoPodReturnDetail(payload.doPodReturnId, awb, awbNumber, transactionManager);

                // NOTE: queue by Bull ANT
                DoPodDetailPostMetaQueueService.createJobByAwbReturn(
                  awb.awbItemId,
                  AWB_STATUS.ANT,
                  permissonPayload.branchId,
                  authMeta.userId,
                  employeeIdDriver,
                  employeeNameDriver,
                );

                totalSuccess += 1;
                // handle print metadata - Scan Out & Return
                response.printDoPodReturnMetadata = this.handlePrintMetadata(awb);

              });
            } catch (e) {
              totalError += 1;
              response.status = 'error';
              response.message = `Gangguan Server: ${e.message}`;
            }
            // remove key holdRedis
            RedisService.del(`hold:scanoutant:${awb.awbItemId}`);
          } else {
            totalError += 1;
            response.status = 'error';
            response.message = `Server Busy: Resi ${awbNumber} sedang di proses.`;
          }
        } else {
          totalError += 1;
          response.status = 'error';
          response.message = checkValidAwbStatusIdLast.message;
        }
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `Resi ${awbNumber} Tidak di Temukan`;
      }

      dataItem.push({
        awbNumber,
        ...response,
      });
    }

    // NOTE: counter total scan out
    if (doPodReturn && totalSuccess > 0) {
      await DoPodReturnService.updateTotalAwbById(
        doPodReturn.totalAwb,
        totalSuccess,
        doPodReturn.doPodReturnId,
      );
    }

    // Populate return value
    result.totalData = payload.awbNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }

  static async createDoPodReturn(
    payload: WebDoPodCreateReturnPayloadVm,
  ): Promise<WebDoPodCreateReturnResponseVm> {
    const result = new WebDoPodCreateReturnResponseVm();

    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    // create do_pod_return (jalan Antar Retur Sigesit)
    const doPodReturn = await DoPodReturnService.createDoPodReturn(
      payload.userIdDriver,
      payload.desc,
      permissonPayload.branchId,
      authMeta.userId,
      false,
    );

    await DoPodReturnService.createAuditReturnHistory(doPodReturn.doPodReturnId, false);

    // Populate return value
    result.status = 'ok';
    result.message = 'success';
    result.doPodReturnId = doPodReturn.doPodReturnId;

    // For printDoPodReturnMetadata
    result.printDoPodReturnMetadata.doPodReturnCode = doPodReturn.doPodReturnCode;
    result.printDoPodReturnMetadata.description = payload.desc;

    const dataUser = await EmployeeService.findByUserIdDriver(payload.userIdDriver);
    if (dataUser) {
      result.printDoPodReturnMetadata.userDriver.employee.nik =
        dataUser[0].nik;
      result.printDoPodReturnMetadata.userDriver.employee.nickname =
        dataUser[0].nickname;
    }

    return result;
  }

  static async findAllScanOutAwbReturnGroupList(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanOutReturnGroupListResponseVm> {
    // mapping field
    payload.fieldResolverMap['doPodRetrunDateTime'] =
      't1.do_pod_return_date_time';
    payload.fieldResolverMap['datePOD'] = 'datePOD';
    payload.fieldResolverMap['branchFrom'] = 't1.branch_id';
    payload.fieldResolverMap['branchName'] = 't5.branch_name';
    payload.fieldResolverMap['userIdDriver'] = 't1.user_id_driver';
    payload.fieldResolverMap['doPodReturnCode'] = 't1.do_pod_return_code';
    payload.fieldResolverMap['totalSuratJalan'] = 'totalSuratJalan';
    payload.fieldResolverMap['totalAssigned'] = 'totalAssigned';
    payload.fieldResolverMap['totalOnProcess'] = 'totalOnProcess';
    payload.fieldResolverMap['totalSuccess'] = 'totalSuccess';
    payload.fieldResolverMap['totalProblem'] = 'totalProblem';

    if (payload.sortBy === '') {
      payload.sortBy = 'datePOD';
    }

    const repo = new OrionRepositoryService(DoPodReturn, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.user_id_driver', 'userIdDriver'],
      ['t2.fullname', 'nickname'],
      ['t1.do_pod_return_date_time::date', 'datePOD'],
      ['t5.branch_name', 'branchName'],
      ['t1.branch_id', 'branchId'],
      ['COUNT(DISTINCT(t1.do_pod_return_id))', 'totalSuratJalan'],
      ['COUNT(t3.awb_number)', 'totalAssigned'],
      [
        'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last = 14000)',
        'totalOnProcess',
      ],
      [
        'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last = 25650)',
        'totalSuccess',
      ],
      [
        'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last IN (24550, 25000))',
        'totalProblem',
      ],
      // [
      //   'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last <> 30000 AND t3.awb_status_id_last <> 14000)',
      //   'totalProblem',
      // ],
    );

    q.innerJoin(e => e.userDriver.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodReturnDetails, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw(
      '"datePOD", t1.user_id_driver, t1.branch_id, t2.fullname, t5.branch_name',
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanOutReturnGroupListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async findAllScanOutAwbReturnList(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanOutReturnListResponseVm> {
    // mapping field
    payload.fieldResolverMap['doPodReturnDateTime'] =
      't1.do_pod_return_date_time';
    payload.fieldResolverMap['branchFrom'] = 't1.branch_id';
    payload.fieldResolverMap['doPodReturnCode'] = 't1.do_pod_return_code';
    payload.fieldResolverMap['description'] = 't1.description';
    payload.fieldResolverMap['nickname'] = 't2.nickname';
    payload.fieldResolverMap['totalAssigned'] = 'totalAssigned';
    payload.fieldResolverMap['totalOnProcess'] = 'totalOnProcess';
    payload.fieldResolverMap['totalSuccess'] = 'totalSuccess';
    payload.fieldResolverMap['totalProblem'] = 'totalProblem';
    payload.fieldResolverMap['totalCodValue'] = 'totalCodValue';

    if (payload.sortBy === '') {
      payload.sortBy = 'doPodReturnDateTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doPodReturnDateTime',
      },
      {
        field: 'doPodReturnCode',
      },
      {
        field: 'description',
      },
      {
        field: 'nickname',
      },
    ];

    const repo = new OrionRepositoryService(DoPodReturn, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_pod_return_id', 'doPodReturnId'],
      ['t1.do_pod_return_code', 'doPodReturnCode'],
      ['t1.do_pod_return_date_time', 'doPodReturnDateTime'],
      ['t1.description', 'description'],
      [
        'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last = 25650)',
        'totalSuccess',
      ],
      [
        'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last IN (24550, 25000))',
        'totalProblem',
      ],
      [
        'COUNT (t3.awbNumber) FILTER (WHERE t3.awb_status_id_last = 14000)',
        'totalOnProcess',
      ],
      ['COUNT (t3.awbNumber)', 'totalAssigned'],
      ['t2.fullname', 'nickname'],
      [
        `CONCAT(CAST(SUM(t4.total_cod_value) AS NUMERIC(20,2)))`,
        'totalCodValue',
      ],
    );

    q.innerJoin(e => e.userDriver.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodReturnDetails, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodReturnDetails.awb, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw('t1.do_pod_return_id, t2.fullname');

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanOutReturnListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async detailReturn(
    payload: BaseMetaPayloadVm,
  ): Promise<WebReturnListResponseVm> {
    // mapping field
    payload.fieldResolverMap['doPodReturnId'] = 't1.do_pod_return_id';
    payload.fieldResolverMap['awbStatusIdLast'] = 't1.awb_status_id_last';
    payload.fieldResolverMap['awbNumber'] = 't2.awb_number';
    payload.fieldResolverMap['consigneeName'] = 't1.consignee_name';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'awbNumber',
      },
      {
        field: 'doPodReturnId',
      },
    ];

    const repo = new OrionRepositoryService(DoPodReturnDetail, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_pod_return_detail_id', 'doPodReturnDetailId'],
      ['t2.awb_number', 'awbNumber'],
      ['t1.awb_status_id_last', 'awbStatusIdLast'],
      ['t1.desc_last', 'note'],
      ['t2.is_cod', 'isCod'],
      [`CONCAT(CAST(t2.total_weight AS NUMERIC(20,2)),' Kg')`, 'weight'],
      ['COALESCE(t1.consignee_name, t2.consignee_name)', 'consigneeName'],
      ['t3.awb_status_title', 'awbStatusTitle'],
      ['t4.do_return', 'isDoReturn'],
      ['t4.do_return_number', 'doReturnNumber'],
      [
        'CONCAT(CAST(t2.total_cod_value AS NUMERIC(20,2)))',
        'totalCodValue',
      ],
    );

    q.innerJoin(e => e.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awbStatus, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.pickupRequestDetail, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();
    const result = new WebReturnListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async syncAwbReturn(
    payload: WebAwbReturnSyncPayloadVm,
  ): Promise<WebAwbReturnSyncResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const response = new AwbReturnManualSync();
    const result = new WebAwbReturnSyncResponseVm();

    const dataItem = [];
    let onlyDriver = false;

    try {
      for (const returnData of payload.returnList) {
        // TODO: check awb number
        let syncManualDelivery = false;
        const awb = await AwbService.validAwbNumber(returnData.awbNumber);
        if (awb) {
          // add handel status Cod problem
          const statusCodProblem = [AWB_STATUS.CODB, AWB_STATUS.CODOC];
          if (
            awb.awbItem.awb.isCod == false &&
            statusCodProblem.includes(returnData.awbStatusId)
          ) {
            response.status = 'error';
            response.message = `Resi ${returnData.awbNumber} bukan resi COD !`;
          } else if (returnData.awbStatusId == AWB_STATUS.RTS && awb.awbStatusIdLast != AWB_STATUS.ANT) {
            response.status = 'error';
            response.message = `Resi ${returnData.awbNumber
              }, tidak memiliki surat jalan, harap buatkan surat jalan terlebih dahulu!`;
          } else {

            // const awbDeliverDetail = await this.getDeliverDetail(delivery.awbNumber);
            const awbReturnDetail = await DoPodReturnDetailService.getDoPodReturnDetailByAwbNumber(returnData.awbNumber);
            // let isReturnAwb = false;
            // let isDeliverAwb = false;
            // if (awbReturnDetail && awbDeliverDetail) {
            //   if (awbReturnDetail.updatedTime > awbDeliverDetail.updatedTime) {
            //     isReturnAwb = true;
            //   } else {
            //     isDeliverAwb = true;
            //   }
            // } else if (awbReturnDetail) {
            //   isReturnAwb = true;
            // } else if (awbDeliverDetail) {
            //   isDeliverAwb = true;
            // }

            // if (isDeliverAwb) {
            //   // hardcode check role sigesit
            //   await this.deliverProcess(
            //     permissonPayload,
            //     awbDeliverDetail,
            //     authMeta,
            //     syncManualDelivery,
            //     onlyDriver,
            //     awb,
            //     response,
            //     delivery,
            //     payload);
            // } else if (isReturnAwb) {
            if (awbReturnDetail) {
              const roleIdSigesit = 23;
              if (permissonPayload.roleId == roleIdSigesit) {
                // check only own awb number
                if (awbReturnDetail.awbStatusIdLast == AWB_STATUS.ANT &&
                  awbReturnDetail.doPodReturn.userIdDriver ==
                  authMeta.userId) {
                  syncManualDelivery = true;
                } else {
                  onlyDriver = true;
                }
              } else {
                syncManualDelivery = true;
              }

              if (syncManualDelivery) {
                // add handel final status
                const statusFinal = [AWB_STATUS.DLV];
                if (statusFinal.includes(awb.awbStatusIdLast)) {
                  response.status = 'error';
                  response.message = `Resi ${returnData.awbNumber} sudah Final Status !`;
                } else {
                  // check awb is cod
                  if (awb.awbItem.awb.isCod == true && returnData.awbStatusId == AWB_STATUS.DLV) {
                    response.status = 'error';
                    response.message = `Resi ${returnData.awbNumber}, adalah resi COD, tidak dapat melakukan POD Manual!`;
                  } else {
                    // set data deliver
                    returnData.doPodReturnId = awbReturnDetail.doPodReturnId;
                    returnData.doPodReturnDetailId = awbReturnDetail.doPodReturnDetailId;
                    returnData.awbItemId = awbReturnDetail.awbItemId;
                    await this.syncReturn(returnData);
                    // TODO: if awb status DLV check awbNumber is_return ?? update relation awbNumber (RTS)
                    await AwbReturnService.createAwbReturn(
                      returnData.awbNumber,
                      awb.awbId,
                      permissonPayload.branchId,
                      authMeta.userId,
                      false,
                    );
                    response.status = 'ok';
                    response.message = 'success';
                  }
                }
              } else {
                response.status = 'error';
                if (onlyDriver) {
                  response.message = `Resi ${returnData.awbNumber}, bukan milik user sigesit login`;
                } else {
                  response.message = `Resi ${returnData.awbNumber}, bermasalah harap scan antar terlebih dahulu`;
                }

              }
            } else {
              // NOTE: Manual Status not POD only status problem (not have spk)
              returnData.awbItemId = awb.awbItemId;
              if (returnData.awbStatusId != AWB_STATUS.DLV) {
                const manualStatus = await this.syncStatusManual(
                  authMeta.userId,
                  permissonPayload.branchId,
                  returnData,
                  awb.awbId,
                );
                const messageError = `Resi ${returnData.awbNumber}, tidak dapat update status manual`;
                response.status = manualStatus ? 'ok' : 'error';
                response.message = manualStatus ? 'success' : messageError;
              } else {
                // status DLV, but not have spk
                response.status = 'error';
                response.message = `Resi ${returnData.awbNumber
                  }, tidak memiliki surat jalan, harap buatkan surat jalan terlebih dahulu!`;
              }
            }
          }
        } else {
          response.status = 'error';
          response.message = `Resi ${returnData.awbNumber} tidak ditemukan`;
        }

        // push item
        dataItem.push({
          awbNumber: returnData.awbNumber,
          ...response,
        });
      } // end of for

      // return array of data
      result.data = dataItem;
      return result;
    } catch (error) {
      response.status = 'error';
      response.message = `message error ${error.message}`;
      throw new BadRequestException(response);
    }
  }

  static async storePrintDoPodReturn(payloadBody: PrintDoPodReturnVm) {
    return PrintByStoreService.storeGenericPrintData(
      'do-pod-return',
      payloadBody.data.doPodReturnId,
      payloadBody,
    );
  }

  static async executePrintDoPodReturn(
    res: express.Response,
    queryParams: PrintDoPodReturnPayloadQueryVm,
  ) {
    const printPayload = await PrintByStoreService.retrieveGenericPrintData<
      PrintDoPodReturnVm
    >('do-pod-return', queryParams.id);

    if (!printPayload || (printPayload && !printPayload.data)) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    return this.printDoPodReturnAndQueryMeta(
      res,
      printPayload.data,
      {
        userId: queryParams.userId,
        branchId: queryParams.branchId,
      },
      {
        printCopy: queryParams.printCopy,
      },
    );
  }

  static async printDoPodReturnByRequest(
    res: express.Response,
    queryParams: PrintDoPodReturnPayloadQueryVm,
  ) {
    const repo = new OrionRepositoryService(DoPodReturn, 't1');
    const q = repo.findOne();
    q.leftJoin(e => e.doPodReturnDetails);
    q.leftJoin(e => e.userDriver.employee);

    const doPodReturn = await q
      .select({
        doPodReturnId: true, // needs to be selected due to do_pod_return relations are being included
        doPodReturnCode: true,
        description: true,
        userDriver: {
          userId: true,
          employee: {
            nickname: true,
            nik: true,
          },
        },
        doPodReturnDetails: {
          doPodReturnDetailId: true, // needs to be selected due to do_pod_return_detail relations are being included
          awbItem: {
            awbItemId: true, // needs to be selected due to awb_item relations are being included
            awb: {
              awbId: true,
              awbNumber: true,
              consigneeName: true,
              consigneeNumber: true,
              consigneeAddress: true,
              consigneeZip: true,
              totalCodValue: true,
              isCod: true,
            },
          },
        },
      })
      .where(e => e.doPodReturnId, w => w.equals(queryParams.id))
      .andWhere(e => e.doPodReturnDetails.isDeleted, w => w.isFalse());

    if (!doPodReturn) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    this.printDoPodReturnAndQueryMeta(
      res,
      doPodReturn as any,
      {
        userId: queryParams.userId,
        branchId: queryParams.branchId,
      },
      {
        printCopy: queryParams.printCopy,
      },
    );
  }

  static async getPhotoReturnDetail(
    payload: PhotoReturnDetailVm
  ): Promise<PhotoResponseVm> {
    const result = new PhotoResponseVm();
    result.data = await DoPodReturnDetailService.getPhotoDetail(payload.doPodReturnDetailId, payload.attachmentType);
    return result;
  }

  private static handlePrintMetadata(awb: AwbItemAttr) {
    const meta = new PrintDoPodDeliverDataDoPodDeliverDetailVm();
    // Assign print metadata - Scan Out & Return
    meta.awbItem.awb.awbId = awb.awbId;
    meta.awbItem.awb.awbNumber = awb.awbNumber;
    meta.awbItem.awb.consigneeName = awb.awbItem.awb.consigneeName;

    // Assign print metadata - Return
    meta.awbItem.awb.consigneeAddress = awb.awbItem.awb.consigneeAddress;
    meta.awbItem.awb.awbItemId = awb.awbItemId;
    meta.awbItem.awb.consigneeNumber = awb.awbItem.awb.consigneeNumber;
    meta.awbItem.awb.consigneeZip = awb.awbItem.awb.consigneeZip;
    meta.awbItem.awb.isCod = awb.awbItem.awb.isCod;
    meta.awbItem.awb.totalCodValue = awb.awbItem.awb.totalCodValue;
    meta.awbItem.awb.totalWeight = awb.awbItem.awb.totalWeightFinalRounded;
    return meta;
  }

  private static async deleteExistDoPodReturnDetail(
    awbItemId: number,
    userId: number,
    transactionManager: EntityManager) {
    const dataSpk = await DoPodReturnDetail.find({
      select: ['awbNumber'],
      where: {
        awbItemId,
        awbStatusIdLast: AWB_STATUS.ANT,
        isDeleted: false,
      },
    });
    if (dataSpk.length) {
      transactionManager.update(
        DoPodReturnDetail,
        {
          awbItemId,
          awbStatusIdLast: AWB_STATUS.ANT,
          isDeleted: false,
        },
        {
          isDeleted: true,
          userIdUpdated: userId,
          updatedTime: moment().toDate(),
        },
      );
    }
  }

  private static async printDoPodReturnAndQueryMeta(
    res: express.Response,
    data: Partial<PrintDoPodReturnDataVm>,
    metaQuery: {
      userId: number;
      branchId: number;
    },
    templateConfig: {
      printCopy?: number;
    } = {
        printCopy: 1,
      },
  ) {
    // #region get user login and branch login
    const currentUser = await RepositoryService.user
      .loadById(metaQuery.userId)
      .select({
        userId: true, // needs to be selected due to users relations are being included
        employee: {
          nickname: true,
        },
      })
      .exec();

    if (!currentUser) {
      RequestErrorService.throwObj({
        message: 'User tidak ditemukan',
      });
    }

    const currentBranch = await RepositoryService.branch
      .loadById(metaQuery.branchId)
      .select({
        branchName: true,
      });

    if (!currentBranch) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }
    // #endregion

    const currentDate = moment();
    let totalAllCod = 0;

    // sum totalCodValue from object
    // loop data and sum data totalCodValue
    if (data && data.doPodReturnDetails) {
      data.doPodReturnDetails.map(function (doPod) {
        if (
          doPod &&
          doPod.awbItem &&
          doPod.awbItem.awb &&
          doPod.awbItem.awb.totalCodValue
        ) {
          totalAllCod += Number(doPod.awbItem.awb.totalCodValue);
        }
      });
    }

    return this.printDoPodReturn(
      res,
      data,
      {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: currentDate.format('DD/MM/YY'),
        time: currentDate.format('HH:mm'),
        totalItems: data.doPodReturnDetails.length,
        totalCod: totalAllCod,
      },
      templateConfig,
    );
  }

  private static async printDoPodReturn(
    res: express.Response,
    data: Partial<PrintDoPodReturnDataVm>,
    meta: {
      currentUserName: string;
      currentBranchName: string;
      date: string;
      time: string;
      totalItems: number;
      totalCod: number;
    },
    templateConfig: {
      printCopy?: number;
    } = {
        printCopy: 1,
      },
  ) {
    const jsreportParams = {
      data,
      meta,
    };

    const listPrinterName = ['BarcodePrinter', 'StrukPrinter'];
    PrinterService.responseForJsReport({
      res,
      templates: [
        {
          templateName: 'surat-jalan-antar-return',
          templateData: jsreportParams,
          printCopy: templateConfig.printCopy,
        },
        {
          templateName: 'surat-jalan-antar-return-admin',
          templateData: jsreportParams,
          printCopy: templateConfig.printCopy,
        },
      ],
      listPrinterName,
    });
  }

  private static async syncReturn(returnData: WebReturnVm) {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    // Generate History by Status input pod manual
    const doPodReturnHistory = DoPodReturnHistory.create({
      doPodReturnDetailId: returnData.doPodReturnDetailId,
      awbStatusId: returnData.awbStatusId,
      reasonId: returnData.reasonId,
      syncDateTime: moment().toDate(),
      desc: returnData.reasonNotes,
      awbStatusDateTime: moment().toDate(),
      historyDateTime: moment().toDate(),
      employeeIdDriver: null,
    });

    // TODO: validation check final status last
    const awbReturn = await DoPodReturnDetail.findOne({
      where: {
        doPodReturnDetailId: returnData.doPodReturnDetailId,
        isDeleted: false,
      },
    });
    const finalStatus = [AWB_STATUS.DLV];
    if (awbReturn && !finalStatus.includes(awbReturn.awbStatusIdLast)) {
      const awbStatus = await AwbStatus.findOne({
        where: {
          awbStatusId: doPodReturnHistory.awbStatusId,
          isDeleted: false,
        },
        cache: true,
      });
      // #region transaction data
      await getManager().transaction(async transactionEntityManager => {
        // insert data deliver history
        await transactionEntityManager.insert(
          DoPodReturnHistory,
          doPodReturnHistory,
        );

        // Update data DoPodDeliverDetail
        await transactionEntityManager.update(
          DoPodReturnDetail,
          returnData.doPodReturnDetailId,
          {
            awbStatusIdLast: doPodReturnHistory.awbStatusId,
            awbStatusDateTimeLast: doPodReturnHistory.awbStatusDateTime,
            reasonIdLast: doPodReturnHistory.reasonId,
            syncDateTimeLast: doPodReturnHistory.syncDateTime,
            descLast: doPodReturnHistory.desc,
            consigneeName: returnData.consigneeNameNote,
            updatedTime: moment().toDate(),
          },
        );
        // TODO: validation DoPodDeliver
        const doPodReturn = await DoPodReturn.findOne({
          where: {
            doPodReturnId: returnData.doPodReturnId,
            isDeleted: false,
          },
        });
        if (doPodReturn) {
          if ([AWB_STATUS.RTC, AWB_STATUS.RTS].includes(awbStatus.awbStatusId)) {
            await transactionEntityManager.increment(
              DoPodReturn,
              {
                doPodReturnId: returnData.doPodReturnId,
                totalProblem: LessThan(doPodReturn.totalAwb),
              },
              'totalProblem',
              1,
            );
          } else if (AWB_STATUS.UNRTS == awbStatus.awbStatusId) {
            await transactionEntityManager.increment(
              DoPodReturn,
              {
                doPodReturnId: returnData.doPodReturnId,
                totalReturn: LessThan(doPodReturn.totalAwb),
              },
              'totalReturn',
              1,
            );
            // balance total problem
            await transactionEntityManager.decrement(
              DoPodReturn,
              {
                doPodReturnId: returnData.doPodReturnId,
                totalProblem: MoreThan(0),
              },
              'totalProblem',
              1,
            );
          }
        }
      });
      // #endregion of transaction

      // NOTE: queue by Bull need refactoring
      const reasonId = returnData.reasonId == 0 ? null : returnData.reasonId;
      DoPodDetailPostMetaQueueService.createJobV2ByManual(
        returnData.awbItemId,
        returnData.awbStatusId,
        authMeta.userId,
        permissonPayload.branchId,
        returnData.reasonNotes,
        reasonId,
        returnData.consigneeNameNote,
      );
      // NOTE: mail notification
      AwbNotificationMailQueueService.perform(
        returnData.awbItemId,
        returnData.awbStatusId,
      );

    } else {
      console.log('##### Data Not Valid', returnData);
    }
  }

  private static async syncStatusManual(
    userId: number,
    branchId: number,
    returnData: WebReturnVm,
    awbId: number,
  ) {
    // NOTE: role palkur => CODA, BA, RETUR tidak perlu ANT
    try {
      await AwbReturnService.createAwbReturn(
        returnData.awbNumber,
        awbId,
        branchId,
        userId,
        false,
      );
      // TODO: queue by Bull need refactoring
      DoPodDetailPostMetaQueueService.createJobV2ByManual(
        returnData.awbItemId,
        returnData.awbStatusId,
        userId,
        branchId,
        returnData.reasonNotes,
        null,
        null,
      );
      // NOTE: mail notification
      AwbNotificationMailQueueService.perform(
        returnData.awbItemId,
        returnData.awbStatusId,
      );
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
