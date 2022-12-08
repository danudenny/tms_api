import {Injectable} from '@nestjs/common';
import {SortationExternalModulesService} from '../../interfaces/sortation-external-modules.service';
import {
    SortationL2ModuleSearchPayloadVm,
} from '../../models/sortation/web/sortation-l2-module-search.payload.vm';

@Injectable()
export class MockSortationExternalModuleService implements SortationExternalModulesService {
    async finish(params): Promise<any> {
        return {
            status_code: 200,
            code: 200000,
            message: 'Success finish manual sortation',
            data: [
                {
                    do_sortation_id: '1c383032-5a8c-11ed-98d3-e7cc73f3a087',
                    do_sortation_code: 'DOPS/2203/14/IMLH7901',
                },
            ],
        };
    }

    async listFinish(params): Promise<any> {
        return {
            data: {
                data: [
                    {
                        sortation_finish_history_id: 'e8e40569-ffbd-462a-9aef-aaef7189f304',
                        do_sortation_code: 'DOPS/2211/15/GOET5319',
                        do_sortation_id: '5501c298-64af-11ed-832b-67a66b196314',
                        driver_id: 17359,
                        created_time: '2022-11-22 10:13:31',
                        updated_time: '2022-11-22 10:13:31',
                        user_id_created: 18116,
                        user_id_updated: 18116,
                        admin_name: '',
                        driver_name: 'iwan cahya',
                        driver_nik: '20101033',
                        admin_nik: 'Pandu',
                    },
                    {
                        sortation_finish_history_id: '793648f9-7f58-4799-b74b-19facf685597',
                        do_sortation_code: 'DOPS/2211/15/GOET5319',
                        do_sortation_id: '5501c298-64af-11ed-832b-67a66b196314',
                        driver_id: 17359,
                        created_time: '2022-11-21 15:01:40',
                        updated_time: '2022-11-21 15:01:40',
                        user_id_created: 18116,
                        user_id_updated: 18116,
                        admin_name: '',
                        driver_name: 'iwan cahya',
                        driver_nik: '20101033',
                        admin_nik: 'Pandu',
                    },
                ],
                paging: {
                    prev_page: 0,
                    current_page: 1,
                    next_page: 0,
                    limit: 10,
                },
            },
            message: 'Sukses ambil data history',
            code: '200000',
            statusCode: 200,
            latency: '4.35 ms',
        };
    }

    async search(params: SortationL2ModuleSearchPayloadVm): Promise<any> {
        return {
            status_code: 200,
            code: '200000',
            message: 'Success search sortation code',
            data: ['DOPS/2203/14/IMLH7901'],
        };
    }

}
