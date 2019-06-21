// #region import
import { Injectable, HttpStatus } from '@nestjs/common';
import { WebScanOutCreateVm, WebScanOutAwbResponseVm, WebScanOutCreateResponseVm, WebScanOutAwbVm } from '../../models/web-scan-out.vm';
import { AuthService } from '../../../../shared/services/auth.service';
import { AwbRepository } from '../../../../shared/orm-repository/awb.repository';
import { AwbTroubleRepository } from '../../../../shared/orm-repository/awb-trouble.repository';
import { PodScanRepository } from '../../../../shared/orm-repository/pod-scan.repository';
import { DoPodRepository } from '../../../../shared/orm-repository/do-pod.repository';
import { BranchRepository } from '../../../../shared/orm-repository/branch.repository';
import { BagRepository } from '../../../../shared/orm-repository/bag.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ContextualErrorService } from '../../../../shared/services/contextual-error.service';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import moment = require('moment');
// #endregion

@Injectable()
export class WebDeliveryOutService {

  constructor(
    private readonly authService: AuthService,
    @InjectRepository(AwbRepository)
    private readonly awbRepository: AwbRepository,
    @InjectRepository(AwbTroubleRepository)
    private readonly awbTroubleRepository: AwbTroubleRepository,
    @InjectRepository(PodScanRepository)
    private readonly podScanRepository: PodScanRepository,
    @InjectRepository(DoPodRepository)
    private readonly doPodRepository: DoPodRepository,
    @InjectRepository(BranchRepository)
    private readonly branchRepository: BranchRepository,
    @InjectRepository(BagRepository)
    private readonly bagRepository: BagRepository,
  ) {}

  async scanOutCreate(payload: WebScanOutCreateVm): Promise<WebScanOutCreateResponseVm> {
    const authMeta = AuthService.getAuthMetadata();
    const result = new WebScanOutCreateResponseVm();
    const timeNow = moment().toDate();

    if (!!authMeta) {
      // create do_pod (Surat Jalan)
      // mapping payload to field table do_pod
      const doPod = this.doPodRepository.create();
      const permissonPayload = await this.authService.handlePermissionJwtToken(payload.permissionToken);
      const doPodDateTime = moment(payload.doPodDateTime).toDate();

      // NOTE: Ada 4 tipe surat jalan
      doPod.doPodCode = await CustomCounterCode.doPod(doPodDateTime.toDateString()); // generate code

      // TODO: doPodType
      // 1. tipe surat jalan criss cross
      // 2.A tipe transit(internal)
      // 3. tipe retur

      // gerai tujuan di gunakan selain tipe Surat Jalan Antar dan transit (3pl)
      // doPod.branchIdTo = payload.branchIdTo

      // doPod.userIdDriver = payload.??;
      // doPod.employeeIdDriver = payload.employeeIdDriver;
      // doPod.vehicleNumPlate = payload.vehicleNumPlate

      doPod.doPodDateTime = doPodDateTime;
      // doPod.description = ??

      // 2.B tipe transit (3pl)
      // doPod.partnerLogisticId = partnerLogisticId

      // tipe antar (sigesit)
      // resi antar/ retur

      // general purpose
      doPod.branchId = permissonPayload.branchId;
      doPod.userId = authMeta.userId;
      doPod.userIdCreated = authMeta.userId;
      doPod.userIdUpdated = authMeta.userId;
      doPod.createdTime = timeNow;
      doPod.updatedTime = timeNow;
      await this.doPodRepository.save(doPod);

      result.status = '200';
      result.message = 'ok';
      // get do pod id
      result.doPodId = doPod.doPodId;

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

  async scanOutAwb(payload: WebScanOutAwbVm): Promise<WebScanOutAwbResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    if (!!authMeta) {
      const dataItem = [];
      const result = new WebScanOutAwbResponseVm();
      const timeNow = moment().toDate();
      // const permissonPayload = await this.authService.handlePermissionJwtToken(payload.permissionToken);

      const totalSuccess = 0;
      const totalError = 0;

      for (const awbNumber of payload.awbNumber) {
      // TODO: create data do_pod_detail

      //   // NOTE:
      //   // find data to awb where awbNumber and awb status not cancel
      //   awb = await this.awbRepository.findOne({
      //     select: ['awbId', 'branchId'],
      //     where: { awbNumber },
      //   });
      //   if (awb) {
      //     // find data pod scan if exists
      //     checkPodScan = await this.podScanRepository.findOne({
      //       where: {
      //         awbId: awb.awbId,
      //         doPodId: IsNull(),
      //       },
      //     });

      //     if (checkPodScan) {
      //       totalError += 1;
      //       // save data to awb_trouble
      //       const awbTrouble = this.awbTroubleRepository.create({
      //         awbNumber,
      //         resolveDateTime: timeNow,
      //         employeeId: authMeta.employeeId,
      //         branchId: permissonPayload.branchId,
      //         userIdCreated: authMeta.userId,
      //         createdTime: timeNow,
      //         userIdUpdated: authMeta.userId,
      //         updatedTime: timeNow,
      //       });
      //       await this.awbTroubleRepository.save(awbTrouble);

      //       const branch = await this.branchRepository.findOne({
      //         where: { branchId: checkPodScan.branchId },
      //       });

      //       dataItem.push({
      //         awbNumber,
      //         status: 'error',
      //         message: `Resi sudah Scan In pada Gerai ${branch.branchName} (${moment(checkPodScan.podScaninDateTime).format('YYYY-MM-DD HH:mm:ss')})`,
      //       });

      //     } else {
      //       const awbItem = await AwbItem.findOne({
      //         select: ['awbItemId'],
      //         where: { awbId: awb.awbId },
      //       });

      //       // save data to table pod_scan
      //       const podScan = this.podScanRepository.create();
      //       podScan.awbId = awb.awbId;
      //       podScan.branchId = permissonPayload.branchId;
      //       podScan.awbItemId = awbItem.awbItemId;
      //       // podScan.doPodId = null; fill from scan out
      //       podScan.userId = authMeta.userId;
      //       podScan.podScaninDateTime = moment().toDate();
      //       this.podScanRepository.save(podScan);

      //       // TODO:
      //       // save data to table awb_history
      //       // update data history id last on awb??

      //       totalSuccess += 1;
      //       dataItem.push({
      //         awbNumber,
      //         status: 'ok',
      //         message: 'Success',
      //       });
      //     }
      //   } else {
      //     totalError += 1;
      //     // save data to awb_trouble
      //     const awbTrouble = this.awbTroubleRepository.create({
      //       awbNumber,
      //       resolveDateTime: timeNow,
      //       employeeId: authMeta.employeeId,
      //       branchId: permissonPayload.branchId,
      //       userIdCreated: authMeta.userId,
      //       createdTime: timeNow,
      //       userIdUpdated: authMeta.userId,
      //       updatedTime: timeNow,
      //     });
      //     await this.awbTroubleRepository.save(awbTrouble);

      //     dataItem.push({
      //       awbNumber,
      //       status: 'error',
      //       message: `No Resi ${awbNumber} Tidak di Temukan`,
      //     });
      //   }
      } // end of loop

      // Populate return value
      result.status = 'ok';
      result.message = 'success';
      result.data = 'file/base64';

      // Populate return value
      // result.totalData = payload.awbNumber.length;
      // result.totalSuccess = totalSuccess;
      // result.totalError = totalError;
      // result.data = dataItem;

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

  // Type DO POD
  public handleTypeDoPod(type: string) {

    return null;
  }
}
