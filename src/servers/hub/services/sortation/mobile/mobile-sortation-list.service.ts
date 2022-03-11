import { Injectable } from '@nestjs/common';
import {AuthService} from "../../../../../shared/services/auth.service";
import moment = require('moment');
import {createQueryBuilder} from "typeorm";

@Injectable()
export class MobileSortationListService {

    public static async getScanoutSortationMobileList() {
        const authMeta = AuthService.getAuthData();
        const paramUserId =  authMeta.userId;
        const startDate = moment().add(-4, 'days').format('YYYY-MM-DD 00:00:00');
        const endDate = moment().add(1, 'days').format('YYYY-MM-DD 00:00:00');

        const qb = createQueryBuilder();
        qb.addSelect('ds.do_sortation_id', 'doSortationId');
        qb.addSelect('dsd.do_sortation_detail_id', 'doSortationDetailId');
        qb.addSelect('dsd.do_sortation_code', 'doSortationCode');
        qb.addSelect('b.branch_name', 'branchNameTo');
        qb.addSelect('b.address', 'branchAddressTo');
        qb.addSelect('ds.total_bag', 'totalBag');
        qb.addSelect('ds.total_bag_sortir', 'totalBagSortir');
        qb.addSelect('ds.do_sortation_time', 'doSortationTime');
        qb.from('do_sortation', 'ds');
        qb.innerJoin(
            'do_sortation_detail',
            'dsd',
            `ds.do_sortation_id = dsd.do_sortation_id and dsd.is_deleted = false `,
        );
        qb.innerJoin(
            'do_sortation_vehicle',
            'dsv',
            'ds.do_sortation_vehicle_id_last = dsv.do_sortation_vehicle_id  and dsv.is_deleted = false',
        );
        qb.innerJoin(
            'users',
            'u',
            `dsv.employee_driver_id = u.employee_id and u.user_id = ${paramUserId} and u.is_deleted = false`,
        );
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
        qb.andWhere('dsd.do_sortation_status_id_last not in (5000, 6000) ');
        qb.andWhere('ds.is_deleted = false');
        return await qb.getRawMany();
    }
}
