import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { POD_TYPE } from '../../../../../shared/constants/pod-type.constant';
import { AuditHistory } from '../../../../../shared/orm-entity/audit-history';
import { Branch } from '../../../../../shared/orm-entity/branch';
import { DoPod } from '../../../../../shared/orm-entity/do-pod';
import { DoPodDetail } from '../../../../../shared/orm-entity/do-pod-detail';
import { Employee } from '../../../../../shared/orm-entity/employee';
import { PartnerLogistic } from '../../../../../shared/orm-entity/partner-logistic';
import { DoPodRepository } from '../../../../../shared/orm-repository/do-pod.repository';
import { AuthService } from '../../../../../shared/services/auth.service';
import { AwbTroubleService } from '../../../../../shared/services/awb-trouble.service';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { RedisService } from '../../../../../shared/services/redis.service';
import {
    DoPodDetailPostMetaQueueService,
} from '../../../../queue/services/do-pod-detail-post-meta-queue.service';
import {
    ScanAwbVm, WebScanOutAwbResponseVm, WebScanOutCreateResponseVm,
} from '../../../models/web-scan-out-response.vm';
import { WebScanOutAwbVm, WebScanOutCreateVm } from '../../../models/web-scan-out.vm';
import { AwbService } from '../../v1/awb.service';
import moment = require('moment');

export class HubTransitDeliveryOutService {
  /**
   * Create DO POD AWB
   * handle for hub - transit
   * @param {WebScanOutCreateVm} payload
   * @returns {Promise<WebScanOutCreateResponseVm>}
   * @memberof WebDeliveryOutService
   */
  static async doPodAwbCreate(
    payload: WebScanOutCreateVm,
  ): Promise<WebScanOutCreateResponseVm> {
    const result = new WebScanOutCreateResponseVm();

    // create do_pod (Surat Jalan)
    const doPod = DoPod.create();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const doPodDateTime = moment(payload.doPodDateTime).toDate();
    // internal or 3PL/Third Party
    const method =
      payload.doPodMethod && payload.doPodMethod == '3pl' ? 3000 : 1000;

    doPod.doPodCode = await CustomCounterCode.doPod(doPodDateTime);
    doPod.doPodType = payload.doPodType;
    doPod.doPodMethod = method;
    doPod.partnerLogisticId = payload.partnerLogisticId || null;
    doPod.branchIdTo = payload.branchIdTo || null;
    doPod.userIdDriver = payload.userIdDriver || null;
    doPod.doPodDateTime = doPodDateTime;
    doPod.vehicleNumber = payload.vehicleNumber || null;
    doPod.description = payload.desc || null;
    doPod.branchId = permissonPayload.branchId;
    doPod.transactionStatusId = 300; // HUB
    if (method == 3000 && payload.partnerLogisticName) {
      doPod.partnerLogisticName = payload.partnerLogisticName;
    }

    // await for get do pod id
    await DoPod.save(doPod);
    this.createAuditHistory(doPod.doPodId, false);

    // Populate return value
    result.status = 'ok';
    result.message = 'success';
    result.doPodId = doPod.doPodId;

    // NOTE: Query and populate result printDoPodMetadata,
    // query for get BranchTo
    // TODO: send data branch name from web
    const branchData = await Branch.findOne({
      // cache: true,
      where: {
        branchId: payload.branchIdTo,
      },
    });

    if (payload.doPodType === POD_TYPE.OUT_HUB_AWB) {
      result.printDoPodMetadata.doPodCode = doPod.doPodCode;
      result.printDoPodMetadata.description = payload.desc;
      result.printDoPodMetadata.branchTo.branchName = branchData
        ? branchData.branchName
        : 'Kantor Pusat';

      if (payload.doPodMethod && payload.doPodMethod === '3pl') {
        // NOTE: get partner logistic name;
        let partnerLogisticName = payload.partnerLogisticName;
        if (!partnerLogisticName && payload.partnerLogisticId) {
          const partnerLogistic = await PartnerLogistic.findOne({
            partnerLogisticId: payload.partnerLogisticId,
          });
          partnerLogisticName = partnerLogistic.partnerLogisticName;
        }

        result.printDoPodMetadata.userDriver.employee.nik = '';
        result.printDoPodMetadata.userDriver.employee.nickname = '3PL';
        result.printDoPodMetadata.vehicleNumber = partnerLogisticName;
      } else {
        // internal
        // query for get Employee
        const repo = new OrionRepositoryService(Employee, 't1');
        const q = repo.findAllRaw();
        q.selectRaw(['t1.nik', 'nik'], ['t1.nickname', 'nickname']);
        q.innerJoin(e => e.user, 't2');
        q.where(e => e.user.userId, w => w.equals(payload.userIdDriver));
        const dataUser = await q.exec();
        result.printDoPodMetadata.vehicleNumber = payload.vehicleNumber;
        if (dataUser) {
          result.printDoPodMetadata.userDriver.employee.nik = dataUser[0].nik;
          result.printDoPodMetadata.userDriver.employee.nickname =
            dataUser[0].nickname;
        }
      }
    }
    console.log(' ######## RESULT : ', result);
    return result;
  }

  /**
   * Create DO POD BAG
   * handle for hub - transit
   * @param {WebScanOutCreateVm} payload
   * @returns {Promise<WebScanOutCreateResponseVm>}
   * @memberof WebDeliveryOutService
   */
  static async doPodBagCreate() {
    // TODO: move here do pod hub
  }

    // TODO: need refactoring
  /**
   * Create DO POD Detail
   * with scan awb number
   * @param {WebScanOutAwbVm} payload
   * @returns {Promise<WebScanOutAwbResponseVm>}
   * @memberof WebDeliveryOutService
   */
  static async scanOutAwb(
    payload: WebScanOutAwbVm,
  ): Promise<WebScanOutAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebScanOutAwbResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    // find data doPod
    const doPod = await DoPod.findOne({
      where: {
        doPodId: payload.doPodId,
        isDeleted: false,
      },
      lock: { mode: 'pessimistic_write' },
    });

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
          notDeliver =
            awb.awbStatusIdLast != AWB_STATUS.OUT_BRANCH ? true : false;
        }
        // Add Locking setnx redis
        const holdRedis = await RedisService.locking(
          `hold:scanout:${awb.awbItemId}`,
          'locking',
        );

        if (notDeliver && holdRedis) {
          if (doPod) {
            const statusCode = await AwbService.awbStatusGroup(
              awb.awbStatusIdLast,
            );
            // save data to awb_trouble
            // if (statusCode != 'IN') {
            //   const branchName = awb.branchLast ? awb.branchLast.branchName : '';
            //   await AwbTroubleService.fromScanOut(
            //     awbNumber,
            //     branchName,
            //     awb.awbStatusIdLast,
            //   );
            // }

            // NOTE: create data do pod detail per awb number
            const doPodDetail = DoPodDetail.create();
            doPodDetail.doPodId = payload.doPodId;
            doPodDetail.awbId = awb.awbId;
            doPodDetail.awbNumber = awbNumber;
            doPodDetail.awbItemId = awb.awbItemId;
            doPodDetail.transactionStatusIdLast = 300; // OUT_HUB
            doPodDetail.isScanOut = true;
            doPodDetail.scanOutType = 'awb';
            await DoPodDetail.save(doPodDetail);

            // Assign print metadata - Scan Out & Deliver
            response.printDoPodDetailMetadata.awbItem.awb.awbId         = awb.awbId;
            response.printDoPodDetailMetadata.awbItem.awb.awbNumber     = awbNumber;
            response.printDoPodDetailMetadata.awbItem.awb.consigneeName = awb.awbItem.awb.consigneeName;

            // Assign print metadata - Deliver
            response.printDoPodDetailMetadata.awbItem.awb.consigneeAddress = awb.awbItem.awb.consigneeAddress;
            response.printDoPodDetailMetadata.awbItem.awb.consigneeNumber  = awb.awbItem.awb.consigneeNumber;
            response.printDoPodDetailMetadata.awbItem.awb.consigneeZip     = awb.awbItem.awb.consigneeZip;
            response.printDoPodDetailMetadata.awbItem.awb.isCod            = awb.awbItem.awb.isCod;
            response.printDoPodDetailMetadata.awbItem.awb.totalCodValue    = awb.awbItem.awb.totalCodValue;
            response.printDoPodDetailMetadata.awbItem.awb.totalWeight      = awb.awbItem.weightReal;

            // AFTER Scan OUT ===============================================
            // #region after scanout

            // NOTE: queue by Bull
            let partnerLogisticName = '';
            if (doPod.partnerLogisticName) {
              partnerLogisticName = doPod.partnerLogisticName;
            } else if (doPod.partnerLogisticId) {
              const partnerLogistic = await PartnerLogistic.findOne({ partnerLogisticId: doPod.partnerLogisticId });
              partnerLogisticName = partnerLogistic.partnerLogisticName;
            }
            // NOTE: auto in hub
            DoPodDetailPostMetaQueueService.createJobByAwbFilter(
              awb.awbItemId,
              permissonPayload.branchId,
              authMeta.userId,
            );

            // out hub
            DoPodDetailPostMetaQueueService.createJobByScanOutAwbBranch(
              awb.awbItemId,
              AWB_STATUS.OUT_HUB,
              permissonPayload.branchId,
              authMeta.userId,
              doPod.userIdDriver,
              doPod.branchIdTo,
              partnerLogisticName,
            );

            totalSuccess += 1;
            // #endregion after scanout
          } else {
            totalError += 1;
            response.status = 'error';
            response.message = `Surat Jalan Resi ${awbNumber} tidak valid.`;
          }

          // remove key holdRedis
          RedisService.del(`hold:scanout:${awb.awbItemId}`);
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
    if (doPod) {
      // counter total scan in
      if (doPod.totalScanOutAwb == 0) {
        await DoPod.update(doPod.doPodId, {
          totalScanOutAwb: totalSuccess,
          firstDateScanOut: timeNow,
          lastDateScanOut: timeNow,
        });
      } else {
        const totalScanOutAwb = doPod.totalScanOutAwb + totalSuccess;
        await DoPod.update(doPod.doPodId, {
          totalScanOutAwb,
          lastDateScanOut: timeNow,
        });
      }
    }

    // Populate return value
    result.totalData = payload.awbNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }

  // private
  // TODO: send to background job process ??
  private static async createAuditHistory(
    doPodId: string,
    isUpdate: boolean = true,
  ) {
    // find doPod
    const doPod = await DoPodRepository.getDataById(doPodId);
    if (doPod) {
      // construct note for information
      const description = doPod.description ? doPod.description : '';
      const stage = isUpdate ? 'Updated' : 'Created';
      const note = `
        Data ${stage} \n
        Nama Driver  : ${doPod.userDriver.employee.employeeName}
        Gerai Assign : ${doPod.branch.branchName}
        Gerai Tujuan : ${doPod.branchTo.branchName}
        Note         : ${description}
      `;
      // create new object AuditHistory
      const auditHistory = AuditHistory.create();
      auditHistory.changeId = doPodId;
      auditHistory.transactionStatusId = doPod.transactionStatusId;
      auditHistory.note = note;
      return await AuditHistory.save(auditHistory);
    }
  }
}
