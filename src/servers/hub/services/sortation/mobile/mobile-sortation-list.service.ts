import { Injectable } from '@nestjs/common';
import {AuthService} from "../../../../../shared/services/auth.service";
import moment = require('moment');
import {createQueryBuilder} from "typeorm";

@Injectable()
export class MobileSortationListService {
    async getScanoutSortationMobileList() {
        const authMeta = AuthService.getAuthData();
        const paramUserId =  authMeta.userId;
        const startDate = moment().add(-4, 'days').format('YYYY-MM-DD 00:00:00');
        const endDate = moment().add(1, 'days').format('YYYY-MM-DD 00:00:00');

        const qb = createQueryBuilder();
        qb.from('do_sortation', 'ds');
        qb.innerJoin(
            'do_sortation_detail',
            'dsd',
            `ds.do_sortation_id = dsd.do_sortation_id and dsd.is_deleted = false `,
        );
    }
}
