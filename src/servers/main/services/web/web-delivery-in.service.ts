// #region import
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ContextualErrorService } from '../../../../shared/services/contextual-error.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { toInteger } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { WebDeliveryListFilterPayloadVm } from '../../models/web-delivery-payload.vm';
import { WebScanInListResponseVm } from '../../models/web-scanin-list.response.vm';
import { WebScanInAwbResponseVm, WebScanInBag1ResponseVm } from '../../models/web-scanin-awb.response.vm';
import { WebScanInVm } from '../../models/web-scanin.vm';
import { Bag } from '../../../../shared/orm-entity/bag';
import { AwbRepository } from '../../../../shared/orm-repository/awb.repository';
import { AwbTroubleRepository } from '../../../../shared/orm-repository/awb-trouble.repository';
import { BagRepository } from '../../../../shared/orm-repository/bag.repository';
import { PodScanRepository } from '../../../../shared/orm-repository/pod-scan.repository';
import { InjectRepository } from '@nestjs/typeorm';
import moment = require('moment');
import { BranchRepository } from '../../../../shared/orm-repository/branch.repository';
import { AwbItem } from '../../../../shared/orm-entity/awb-item';
import { WebScanInBagVm } from '../../models/web-scanin-bag.vm';
import { IsNull } from 'typeorm';
import { DoPodRepository } from '../../../../shared/orm-repository/do-pod.repository';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { PodScan } from '../../../../shared/orm-entity/pod-scan';
// #endregion

@Injectable()
export class WebDeliveryInService {
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

  async findAllDeliveryList(
    payload: WebDeliveryListFilterPayloadVm,
  ): Promise<WebScanInListResponseVm> {
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;

    const offset = (page - 1) * take;
    const start = moment(payload.filters.startDeliveryDateTime).toDate();
    const end = moment(payload.filters.endDeliveryDateTime).toDate();

    // TODO: FIX QUERY and Add Additional Where Condition
    const whereCondition =
      'WHERE pod_scanin_date_time >= :start AND pod_scanin_date_time <= :end';
    // TODO: add additional where condition

    const [query, parameters] = RawQueryService.escapeQueryWithParameters(
      `SELECT pod_scanin_date_time as "scanInDateTime",
        awb.awb_number as "awbNumber",
        branch.branch_name as "branchNameScan",
        branch_from.branch_name as "branchNameFrom",
        employee.fullname as "employeeName"
      FROM pod_scan
        JOIN branch ON pod_scan.branch_id = branch.branch_id
        JOIN awb ON awb.awb_id = pod_scan.awb_id AND awb.is_deleted = false
        LEFT JOIN users ON users.user_id = pod_scan.user_id AND users.is_deleted = false
        LEFT JOIN employee ON employee.employee_id = users.employee_id AND employee.is_deleted = false
        LEFT JOIN do_pod ON do_pod.do_pod_id = pod_scan.do_pod_id
        LEFT JOIN branch branch_from ON do_pod.branch_id = branch_from.branch_id
      ${whereCondition}
      LIMIT :take OFFSET :offset`,
      { take, start, end, offset },
    );

    const [
      querycount,
      parameterscount,
    ] = RawQueryService.escapeQueryWithParameters(
      `SELECT COUNT (*) FROM pod_scan where pod_scanin_date_time >= :start AND pod_scanin_date_time <= :end `,
      { start, end },
    );

    // exec raw query
    const data = await RawQueryService.query(query, parameters);
    const total = await RawQueryService.query(querycount, parameterscount);
    const result = new WebScanInListResponseVm();

    result.data = data;
    result.paging = MetaService.set(page, take, Number(total[0].count));

    return result;
  }

  async findAllAwbByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanInListResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'pod_scanin_date_time',
      },
    ];

    // SELECT pod_scanin_date_time as "scanInDateTime",
    //     awb.awb_number as "awbNumber",
    //     branch.branch_name as "branchNameScan",
    //     branch_from.branch_name as "branchNameFrom",
    //     employee.fullname as "employeeName"
    //   FROM pod_scan
    //     JOIN branch ON pod_scan.branch_id = branch.branch_id
    //     JOIN awb ON awb.awb_id = pod_scan.awb_id AND awb.is_deleted = false
    //     LEFT JOIN users ON users.user_id = pod_scan.user_id AND users.is_deleted = false
    //     LEFT JOIN employee ON employee.employee_id = users.employee_id AND employee.is_deleted = false
    //     LEFT JOIN do_pod ON do_pod.do_pod_id = pod_scan.do_pod_id
    //     LEFT JOIN branch branch_from ON do_pod.branch_id = branch_from.branch_id
    const qb = payload.buildQueryBuilder();
    qb.addSelect('pod_scan.pod_scanin_date_time', 'scanInDateTime');
    qb.addSelect('awb.awb_number', 'awbNumber');
    qb.addSelect('branch.branch_name', 'branchNameScan');
    qb.addSelect('branch_from.branch_name', 'branchNameFrom');
    qb.addSelect('employee.fullname', 'employeeName');

    qb.from('pod_scan', 'pod_scan');
    qb.innerJoin(
      'branch',
      'branch',
      'pod_scan.branch_id = branch.branch_id AND branch.is_deleted = false',
    );
    qb.innerJoin(
      'awb',
      'awb',
      'awb.awb_id = pod_scan.awb_id AND awb.is_deleted = false',
    );
    qb.leftJoin(
      'users',
      'users',
      'users.user_id = pod_scan.user_id AND users.is_deleted = false',
    );
    qb.leftJoin(
      'employee',
      'employee',
      'employee.employee_id = users.employee_id AND employee.is_deleted = false',
    );
    qb.leftJoin(
      'do_pod',
      'do_pod',
      'do_pod.do_pod_id = pod_scan.do_pod_id AND do_pod.is_deleted = false',
    );
    qb.leftJoin(
      'branch',
      'branch_from',
      'do_pod.branch_id = branch_from.branch_id AND branch_from.is_deleted = false',
    );

    const total = await qb.getCount();

    payload.applyPaginationToQueryBuilder(qb);
    const data = await qb.execute();

    const result = new WebScanInListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  async scanInAwb(payload: WebScanInVm): Promise<WebScanInAwbResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    if (!!authMeta) {
      const dataItem = [];
      const result = new WebScanInAwbResponseVm();
      const timeNow = moment().toDate();
      const permissonPayload = AuthService.getPermissionTokenPayload();

      let totalSuccess = 0;
      let totalError = 0;

      for (const awbNumber of payload.awbNumber) {
        // NOTE:
        // find data to awb where awbNumber and awb status not cancel
        const awb = await this.awbRepository.findOne({
          select: ['awbId', 'branchId', 'awbStatusIdLast'],
          where: { awbNumber },
        });

        if (awb) {
          // find data pod scan if exists
          const checkPodScan = await this.podScanRepository.findOne({
            where: {
              awbId: awb.awbId,
              doPodId: IsNull(),
            },
          });

          if (checkPodScan) {
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

            const branch = await this.branchRepository.findOne({
              where: { branchId: checkPodScan.branchId },
            });

            dataItem.push({
              awbNumber,
              status: 'error',
              message: `Resi sudah Scan In pada Gerai ${
                branch.branchName
              } (${moment(checkPodScan.podScaninDateTime).format(
                'YYYY-MM-DD HH:mm:ss',
              )})`,
            });
          } else {
            const awbItem = await AwbItem.findOne({
              select: ['awbItemId'],
              where: { awbId: awb.awbId },
            });

            // save data to table pod_scan
            const podScan = this.podScanRepository.create();
            podScan.awbId = awb.awbId;
            podScan.branchId = permissonPayload.branchId;
            podScan.awbItemId = awbItem.awbItemId;
            // podScan.doPodId = null; fill from scan out
            podScan.userId = authMeta.userId;
            podScan.podScaninDateTime = moment().toDate();
            this.podScanRepository.save(podScan);

            // TODO:
            // save data to table awb_history
            // update data history id last on awb??

            totalSuccess += 1;
            dataItem.push({
              awbNumber,
              status: 'ok',
              message: 'Success',
            });
          }
        } else {
          totalError += 1;
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
      ContextualErrorService.throwObj(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAllBag(payload: WebScanInBagVm): Promise<WebScanInBag1ResponseVm> {
    const dataItem = [];
    const result = new WebScanInBag1ResponseVm();
    let totalSuccess = 0;
    let totalError = 0;

    for (const bagNumber of payload.bagNumber) {
      const bag = await Bag.findOne({
        select: ['bagId', 'branchId'],
        where: { bagNumber },
      });

      if (bag) {
        const webbag = this.bagRepository.create();
        webbag.bagId = bag.bagId;
        webbag.branchId = bag.branchId;
        webbag.createdTime = moment().toDate();
        // webbag.createdTime = bag.createdTime;
        this.bagRepository.save(webbag);

        totalSuccess += 1;
        dataItem.push({
          bagNumber,
          status: 'ok',
          message: 'Success',
        });
      } else {
        totalError += 1;
        dataItem.push({
          bagNumber,
          status: 'error',
          message: `No Bag ${bagNumber} Tidak di Temukan`,
        });
      }
    }
    result.totalData = payload.bagNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }

  public static async findAllByRequest(payload: BaseMetaPayloadVm) {
    const repository = new OrionRepositoryService(PodScan);
    const q = repository.findAllRaw();

    payload.globalSearchFields = [
      {
        field: 'pod_scanin_date_time',
      },
    ];

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['pod_scanin_date_time', 'scanInDateTime'],
      ['awb.awb_number', 'awbNumber'],
      ['branch.branch_name', 'branchNameScan'],
      ['branch_from.branch_name', 'branchNameFrom'],
      ['employee.fullname', 'employeeName'],
    );

    // TODO: Masih belum jalan
    // q.innerJoin(e => e.branch);
    // q.innerJoin(e => e.awb);
    // q.leftJoin(e => e.user);
    // q.leftJoin(e => e.user.employee);
    // q.leftJoin(e => e.do_pod);
    // q.leftJoin(e => e.branch.do_pod);

    q.innerJoin(
      'branch ON branch_id = branch.branch_id AND branch.is_deleted = false',
    );
    q.innerJoin(
      'awb ON awb.awb_id = awb_id AND awb.is_deleted = false',
    );
    q.leftJoin(
      'users ON users.user_id = user_id AND users.is_deleted = false',
    );
    q.leftJoin(
      'employee ON employee.employee_id = users.employee_id AND employee.is_deleted = false',
    );
    q.leftJoin(
      'do_pod ON do_pod.do_pod_id = do_pod_id AND do_pod.is_deleted = false',
    );
    q.leftJoin(
      'branch branch_from ON do_pod.branch_id = branch_from.branch_id AND branch_from.is_deleted = false',
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const response = new WebScanInListResponseVm();
    response.data = data;
    response.paging = MetaService.set(payload.page, payload.limit, total);

    return response;
  }
}
