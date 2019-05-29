// #region import
import { HttpStatus, Injectable } from '@nestjs/common';
import { ContextualErrorService } from '../../../../shared/services/contextual-error.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { toInteger } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { WebDeliveryListFilterPayloadVm } from '../../models/web-delivery.vm';
import { WebScanInListResponseVm } from '../../models/web-scanin-list.response.vm';
import { WebScanInAwbResponseVm } from '../../models/web-scanin-awb.response.vm';
import { WebScanInVm } from '../../models/web-scanin.vm';
import { AwbRepository } from '../../../../shared/orm-repository/awb.repository';
import { AwbTroubleRepository } from '../../../../shared/orm-repository/awb-trouble.repository';
import { PodScanRepository } from '../../../../shared/orm-repository/pod-scan.repository';
import { InjectRepository } from '@nestjs/typeorm';
import moment = require('moment');
import { BranchRepository } from '../../../../shared/orm-repository/branch.repository';
import { AwbItem } from '../../../../shared/orm-entity/awb-item';
// #endregion

@Injectable()
export class WebDeliveryService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(AwbRepository)
    private readonly awbRepository: AwbRepository,
    @InjectRepository(AwbTroubleRepository)
    private readonly awbTroubleRepository: AwbTroubleRepository,
    @InjectRepository(PodScanRepository)
    private readonly podScanRepository: PodScanRepository,
    @InjectRepository(BranchRepository)
    private readonly branchRepository: BranchRepository,
  ) {}
  async findAllDeliveryList(
    payload: WebDeliveryListFilterPayloadVm,
    ): Promise<WebScanInListResponseVm> {
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;

    const offset = (page - 1) * take;
    const start = moment(payload.filters.startDeliveryDateTime).toDate();
    const end = moment(payload.filters.endDeliveryDateTime).toDate();

    const [query, parameters] = RawQueryService.escapeQueryWithParameters(
      `SELECT pod_scanin_date_time as "podScaninDateTime",
        awb_id as "awbId", branch_id as "branchId", user_id as "employeId"
      FROM pod_scan where pod_scanin_date_time >= :start AND pod_scanin_date_time <= :end
      LIMIT :take OFFSET :offset`,
      { take, start, end , offset },
    );

    const [querycount, parameterscount] = RawQueryService.escapeQueryWithParameters(
      `SELECT COUNT (*) FROM pod_scan where pod_scanin_date_time >= :start AND pod_scanin_date_time <= :end `,
      { start, end  },
    );

    // exec raw query
    const data = await RawQueryService.query(query, parameters);
    const total = await RawQueryService.query(querycount, parameterscount);
    const result = new WebScanInListResponseVm();

    result.data = data;
    result.paging = MetaService.set(page, take, Number(total[0].count));

    return result;
  }

  async scanInAwb(payload: WebScanInVm): Promise<WebScanInAwbResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    if (!!authMeta) {
      const dataItem = [];
      const result = new WebScanInAwbResponseVm();
      const timeNow = moment().toDate();
      const permissonPayload = await this.authService.handlePermissionJwtToken(payload.permissionToken);

      let awb;
      let checkPodScan;
      let totalSuccess = 0;
      let totalError = 0;

      for (const awbNumber of payload.awbNumber) {
        // NOTE:
        // find data to awb where awbNumber and awb status not cancel
        awb = await this.awbRepository.findOne({
          select: ['awbId', 'branchId'],
          where: { awbNumber },
        });
        if (awb) {
          // find data pod scan
          checkPodScan = await this.podScanRepository.findOne({
            where: { awbId: awb.awbId },
          });

          if (checkPodScan) {
            totalError += 1;
            // TODO: branch id ??
            // gerai name ??
            // save data to awb_trouble
            const awbTrouble = this.awbTroubleRepository.create({
              awbNumber,
              resolveDateTime: timeNow,
              employeeId: authMeta.employeeId,
              branchId: permissonPayload.branchId,
              userIdCreated: authMeta.userId,
              createdTime: timeNow,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            });
            await this.awbTroubleRepository.save(awbTrouble);

            const branch = await this.branchRepository.findOne({
              where: { branchId: checkPodScan.branchId },
            });

            dataItem.push({
              awbNumber,
              status: 'error',
              message: `Resi sudah Scan In pada Gerai ${branch.branchName} (${moment(checkPodScan.podScaninDateTime).format('YYYY-MM-DD HH:mm:ss')})`,
            });

          } else {
            // TODO: awbitemid ??
            const awbItem = await AwbItem.findOne({
              select: ['awbItemId'],
              where: { awbId: awb.awbId },
            });
            // doPodId ??

            // save data to table pod_scan
            const podScan = this.podScanRepository.create();
            podScan.awbId = awb.awbId;
            podScan.branchId = permissonPayload.branchId;
            podScan.awbItemId = awbItem.awbItemId;
            // podScan.doPodId = null;
            podScan.userId = authMeta.userId;
            podScan.podScaninDateTime = moment().toDate();
            this.podScanRepository.save(podScan);

            // TODO:
            // save data to table awb_history
            // update data history id las on awb??

            totalSuccess += 1;
            dataItem.push({
              awbNumber,
              status: 'ok',
              message: 'Success',
            });
          }
        } else {
          totalError += 1;
          // save data to awb_trouble
          const awbTrouble = this.awbTroubleRepository.create({
            awbNumber,
            resolveDateTime: timeNow,
            employeeId: authMeta.employeeId,
            branchId: permissonPayload.branchId,
            userIdCreated: authMeta.userId,
            createdTime: timeNow,
            userIdUpdated: authMeta.userId,
            updatedTime: timeNow,
          });
          await this.awbTroubleRepository.save(awbTrouble);

          dataItem.push({
            awbNumber,
            status: 'error',
            message: `No Resi ${awbNumber} Tidak di Temukan`,
          });
        }
      } // end of loop

      // Populate return value
      result.totalData = payload.awbNumber.length;
      result.totalSuccess = totalSuccess;
      result.totalError = totalError;
      result.data = dataItem;

      return result;
    } else {
      ContextualErrorService.throw(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
