import {HttpStatus, Injectable} from '@nestjs/common';
import {AuthService} from '../../../../../shared/services/auth.service';
import moment = require('moment');
import {createQueryBuilder} from 'typeorm';
import {MobileSortationScanoutDetailPayloadVm} from '../../../models/sortation/mobile/mobile-sortation-scanout-detail.payload.vm';
import {MobileSortationScanoutResponseVm} from '../../../models/sortation/mobile/mobile-sortation-scanout-list.response.vm';
import {MobileSortationScanoutDetailResponseVm} from '../../../models/sortation/mobile/mobile-sortation-scanout-detail.response.vm';
import {MobileSortationScanoutDetailBagPayloadVm} from '../../../models/sortation/mobile/mobile-sortation-scanout-detail-bag.payload.vm';
import {MobileSortationScanoutDetailBagResponseVm} from '../../../models/sortation/mobile/mobile-sortation-scanout-detail-bag.response.vm';
import { DO_SORTATION_STATUS } from '../../../../../shared/constants/do-sortation-status.constant';
import {
    MobileSortationScanoutListHistoryPayloadVm
} from '../../../models/sortation/mobile/mobile-sortation-scanout-list-history.payload.vm';

@Injectable()
export class MobileSortationListService {

    public static async getDataBag(doSortationDetailId : string, isSortir: boolean) {
        const qb = createQueryBuilder();
        qb.addSelect('dsd.do_sortation_detail_id', 'doSortationDetailId');
        qb.addSelect('b.bag_id', 'bagId');
        qb.addSelect('b.bag_number', 'bagNumber');
        qb.addSelect('bi.bag_seq', 'bagSeq');
        // qb.addSelect(`SUBSTR(CONCAT(b.bag_number, LPAD(CONCAT('', bi.bag_seq), 3, '0')), 1, 10)`, 'bagNumber');
        qb.from('do_sortation_detail_item', 'dsdi');
        qb.innerJoin(
          'do_sortation_detail',
          'dsd',
          'dsdi.do_sortation_detail_id = dsd.do_sortation_detail_id AND dsd.is_deleted = FALSE',
        );
        qb.innerJoin(
          'bag_item',
          'bi',
          'dsdi.bag_item_id = bi.bag_item_id AND bi.is_deleted = FALSE',
        );
        qb.innerJoin(
          'bag',
          'b',
          'bi.bag_id = b.bag_id AND b.is_deleted = FALSE',
        );
        qb.where(
          'dsdi.do_sortation_detail_id = :do_sortation_detail_id',
          {
              do_sortation_detail_id: doSortationDetailId,
          },
        );
        qb.andWhere(
          'dsdi.is_sortir = :is_sortir',
          {
              is_sortir: isSortir,
          },
        );

        qb.andWhere('dsdi.is_deleted = false');
        const data = await qb.getRawMany();
        const populateData = [];
        data.forEach(element => {
            const objQuery = {
                bagNumber: (element.bagNumber.length === 10) ? element.bagNumber : element.bagNumber + ('000' + element.bagSeq).slice(-3),
            };
            populateData.push(objQuery);
        });

        return populateData;
    }

    public static async getScanoutSortationMobileDetailBag(payload: MobileSortationScanoutDetailBagPayloadVm) {
        try {
            const data = await this.getDataBag(payload.doSortationDetailId, payload.isSortir);
            const result = new MobileSortationScanoutDetailBagResponseVm();
            result.statusCode = HttpStatus.OK;
            result.message = 'Success get mobile sortation detail bag';
            result.data = data;
            return result;
        } catch (e) {
            throw e.error;
        }
    }

    public static async getScanoutSortationMobileDetail(payload: MobileSortationScanoutDetailPayloadVm) {
        try {
            const qb = createQueryBuilder();
            qb.addSelect('dsd.do_sortation_detail_id', 'doSortationDetailId');
            qb.addSelect('ds.do_sortation_code', 'doSortationCode');
            qb.addSelect('ds.do_sortation_time', 'doSortationTime');
            qb.addSelect('b.branch_name', 'branchNameTo');
            qb.addSelect('b.address', 'branchAddressTo');
            qb.addSelect('ds.total_bag', 'totalBag');
            qb.addSelect('ds.total_bag_sortir', 'totalBagSortir');
            qb.addSelect(`(
                    SELECT
                        at.url
                    FROM attachment_tms at
                    INNER JOIN do_sortation_attachment dsda ON at.attachment_tms_id = dsda.attachment_tms_id AND dsda.attachment_type = 'photo' AND dsda.is_deleted = FALSE
                    WHERE dsda.do_sortation_detail_id = dsd.do_sortation_detail_id
                    ORDER BY at.created_time DESC
                    LIMIT 1
                )`, 'photoImgPath');
            qb.addSelect(`(
                    SELECT
                        at.url
                    FROM attachment_tms at
                    INNER JOIN do_sortation_attachment dsda ON at.attachment_tms_id = dsda.attachment_tms_id AND dsda.attachment_type = 'signature' AND dsda.is_deleted = FALSE
                    WHERE dsda.do_sortation_detail_id = dsd.do_sortation_detail_id
                    ORDER BY at.created_time DESC
                    LIMIT 1
                )`, 'signatureImgPath');
            qb.from('do_sortation', 'ds');
            qb.innerJoin(
              'do_sortation_detail',
              'dsd',
              `ds.do_sortation_id = dsd.do_sortation_id and dsd.do_sortation_detail_id = '${payload.doSortationDetailId}' and dsd.is_deleted = false `,
            );
            qb.innerJoin(
              'do_sortation_vehicle',
              'dsv',
              'ds.do_sortation_vehicle_id_last = dsv.do_sortation_vehicle_id  and dsv.is_deleted = false',
            );
            // qb.innerJoin(
            //   'users',
            //   'u',
            //   `dsv.employee_driver_id = u.employee_id and u.is_deleted = false`,
            // );
            qb.leftJoin(
              'branch',
              'b',
              'dsd.branch_id_to = b.branch_id and b.is_deleted = false',
            );
            qb.andWhere('ds.is_deleted = false');
            const data = await qb.getRawMany();
            const paramResult = [];

            for (const res of data) {
                const obj = {
                   ...res,
                    bagList: await this.getDataBag(payload.doSortationDetailId, false),
                    bagSortirList: await this.getDataBag(payload.doSortationDetailId, true),
                };

                paramResult.push(obj);
            }

            paramResult.push(data);

            const result = new MobileSortationScanoutDetailResponseVm();
            result.statusCode = HttpStatus.OK;
            result.message = 'Success get mobile sortation detail';
            result.data = paramResult;
            return result;
        } catch (e) {
            throw e.error;
        }
    }

    public static async getScanoutSortationMobileListHistory(payload: MobileSortationScanoutListHistoryPayloadVm) {
        const authMeta = AuthService.getAuthData();
        const paramEmployeeId =  authMeta.userId;
        let dateFrom = null;
        let dateTo = null;

        if (payload.startDate && payload.endDate) {
            if (moment(payload.startDate, 'ddd MMM DD YYYY', true).isValid()) {
                dateFrom = moment(payload.startDate, 'ddd MMM DD YYYY');
                dateTo = moment(payload.endDate, 'ddd MMM DD YYYY');
            } else if (moment(payload.startDate, 'DD MMM YYYY', true).isValid()) {
                dateFrom = moment(payload.startDate, 'DD MMM YYYY');
                dateTo = moment(payload.endDate, 'DD MMM YYYY');
            } else {
                dateFrom = moment(payload.startDate);
                dateTo = moment(payload.endDate);
            }
        }

        const startDate = dateFrom
          ? dateFrom.format('YYYY-MM-DD 00:00:00')
          : moment().format('YYYY-MM-DD 00:00:00');
        const endDate = dateTo
          ? dateTo.format('YYYY-MM-DD 23:59:59')
          : moment().format('YYYY-MM-DD 23:59:59');
        const qb = createQueryBuilder();
        qb.addSelect('ds.do_sortation_id', 'doSortationId');
        qb.addSelect('dsd.do_sortation_detail_id', 'doSortationDetailId');
        qb.addSelect('ds.do_sortation_code', 'doSortationCode');
        qb.addSelect('b.branch_name', 'branchNameTo');
        qb.addSelect('b.address', 'branchAddressTo');
        qb.addSelect('ds.total_bag', 'totalBag');
        qb.addSelect('ds.total_bag_sortir', 'totalBagSortir');
        qb.addSelect('ds.do_sortation_time', 'doSortationTime');
        qb.from('do_sortation', 'ds');
        qb.innerJoin(
          'do_sortation_detail',
          'dsd',
          `ds.do_sortation_id = dsd.do_sortation_id and dsd.arrival_date_time >= '${startDate}' and dsd.arrival_date_time < '${endDate}' and dsd.is_deleted = false`,
        );
        qb.innerJoin(
          'do_sortation_vehicle',
          'dsv',
          `ds.do_sortation_vehicle_id_last = dsv.do_sortation_vehicle_id and dsv.employee_driver_id = ${paramEmployeeId} and dsv.is_deleted = false `,
        );
        qb.leftJoin(
          'branch',
          'b',
          'dsd.branch_id_to = b.branch_id and b.is_deleted = false',
        );

        qb.where('ds.is_deleted = false');
        const data = await qb.getRawMany();

        const result = new MobileSortationScanoutResponseVm();
        result.statusCode = HttpStatus.OK;
        result.message = 'Success get mobile sortation history';
        result.data = data;
        return result;
    }

    public static async getScanoutSortationMobileList() {
        try {
            const authMeta = AuthService.getAuthData();
            const paramEmployeeId = authMeta.employeeId;
            const startDate = moment().add(-4, 'days').format('YYYY-MM-DD 00:00:00');
            const endDate = moment().add(1, 'days').format('YYYY-MM-DD 00:00:00');
            const qb = createQueryBuilder();
            qb.addSelect('ds.do_sortation_id', 'doSortationId');
            qb.addSelect('dsd.do_sortation_detail_id', 'doSortationDetailId');
            qb.addSelect('ds.do_sortation_code', 'doSortationCode');
            qb.addSelect('b.branch_name', 'branchNameTo');
            qb.addSelect('b.address', 'branchAddressTo');
            qb.addSelect('ds.total_bag', 'totalBag');
            qb.addSelect('ds.total_bag_sortir', 'totalBagSortir');
            qb.addSelect('ds.do_sortation_time', 'doSortationTime');
            qb.from('do_sortation', 'ds');
            qb.innerJoin(
              'do_sortation_detail',
              'dsd',
              `ds.do_sortation_id = dsd.do_sortation_id and dsd.do_sortation_status_id_last not in (${DO_SORTATION_STATUS.FINISHED}, ${DO_SORTATION_STATUS.RECEIVED}) and dsd.is_deleted = false `,
            );
            qb.innerJoin(
              'do_sortation_vehicle',
              'dsv',
              `ds.do_sortation_vehicle_id_last = dsv.do_sortation_vehicle_id and dsv.employee_driver_id = ${paramEmployeeId} and dsv.is_deleted = false`,
            );
            // qb.innerJoin(
            //   'users',
            //   'u',
            //   `dsv.employee_driver_id = u.employee_id and u.user_id = ${paramUserId} and u.is_deleted = false`,
            // );
            qb.leftJoin(
              'branch',
              'b',
              'dsd.branch_id_to = b.branch_id and b.is_deleted = false',
            );
            qb.where(
              'ds.do_sortation_time >= :startDate',
              {
                  startDate,
              },
            );
            qb.andWhere(
              'ds.do_sortation_time < :endDate',
              {
                  endDate,
              },
            );
            qb.andWhere('ds.is_deleted = false');
            const data = await qb.getRawMany();

            const result = new MobileSortationScanoutResponseVm();
            result.statusCode = HttpStatus.OK;
            result.message = 'Success get mobile sortation list';
            result.data = data;
            return result;
        } catch (e) {
            throw e.error;
        }
    }
}
