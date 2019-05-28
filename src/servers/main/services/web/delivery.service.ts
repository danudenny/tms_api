import { HttpStatus, Injectable, Query, Logger } from '@nestjs/common';
import { ContextualErrorService } from '../../../../shared/services/contextual-error.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { GetRoleResult } from '../../../../shared/models/get-role-result';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { toInteger } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import moment = require('moment');
import { WebDeliveryFindAllResponseVm } from '../../models/web-delivery.response.vm';
import { WebDeliveryListFilterPayloadVm } from '../../models/web-delivery.vm';
import { getManager } from 'typeorm';
import { Awb } from 'src/shared/orm-entity/awb';
import { AwbItem } from 'src/shared/orm-entity/awb-item';
import { WebScanInListResponseVm } from '../../models/web-scanin-list.response.vm';
import { WebScanInAwbResponseVm } from '../../models/web-scanin-awb.response.vm';
import { WebScanInVm } from '../../models/web-scanin.vm';
import { AwbRepository } from 'src/shared/orm-repository/awb.repository';
import { AwbTroubleRepository } from 'src/shared/orm-repository/awb-trouble.repository';
import { PodScanRepository } from 'src/shared/orm-repository/pod-scan.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class WebDeliveryService {
  constructor(
    @InjectRepository(AwbRepository)
    private readonly awbRepository: AwbRepository,
    @InjectRepository(AwbTroubleRepository)
    private readonly awbTroubleRepository: AwbTroubleRepository,
    @InjectRepository(PodScanRepository)
    private readonly podScanRepository: PodScanRepository,
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
      'select pod_scanin_date_time as "podScaninDateTime", awb_id as "awbId",branch_id as "branchId", user_id as "employeId" from pod_scan where pod_scanin_date_time >= :start AND pod_scanin_date_time <= :end LIMIT :take OFFSET :offset',
      { take, start, end , offset },
    );

    const [querycount, parameterscount] = RawQueryService.escapeQueryWithParameters(
      'select count (*) from pod_scan where pod_scanin_date_time >= :start AND pod_scanin_date_time <= :end ',
      { start, end  },
    );
    // exec raw query
    const data = await RawQueryService.query(query, parameters);
    const total = await RawQueryService.query(querycount, parameterscount);
    const result = new WebScanInListResponseVm();

    result.data = data;
    result.paging = MetaService.set(page, take, total[0].count);

    return result;
  }

  async scanInAwb(payload: WebScanInVm): Promise<WebScanInAwbResponseVm> {
    const authMeta = AuthService.getAuthMetadata();
    Logger.log(authMeta);
    // const user = await this.userRepository.findByUserIdWithRoles());
    // check user present
    if (!!authMeta) {

      const dataItem = [];
      const result = new WebScanInAwbResponseVm();
      const timeNow = moment().toDate();
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
            // save data to awb_trouble
            const awbTrouble = this.awbTroubleRepository.create({
              awbNumber,
              resolveDateTime: timeNow,
              employeeId: authMeta.employeeId,
              // branchId: null,
              userIdCreated: authMeta.userId,
              createdTime: timeNow,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            });
            await this.awbTroubleRepository.save(awbTrouble);

            dataItem.push({
              awbNumber,
              status: 'error',
              message: `Resi sudah Scan In pada Gerai X (${moment(checkPodScan.podScaninDateTime).format('YYYY-MM-DD HH:mm:ss')})`,
            });

          } else {
            // save data to table pod_scan
            const podScan = this.podScanRepository.create();
            podScan.awbId = awb.awbId;
            podScan.branchId = awb.branchId;
            // podScan.awbItemId = null;
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
            // branchId: null,
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
