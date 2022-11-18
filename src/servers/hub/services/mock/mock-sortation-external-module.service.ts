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
            status_code: 200,
            code: 200000,
            message: 'Sukses ambil data history',
            data: {
                paging: {
                    current_page: 1,
                    next_page: 0,
                    prev_page: 0,
                    total_page: 1,
                    total_data: 1,
                    limit: 10,
                },
                list: [
                    {
                        sortation_finish_history_id: '1c383032-5a8c-11ed-98d3-e7cc73f3a087',
                        do_sortation_code: 'DOPS/2203/14/IMLH7901',
                        do_sortation_id: '55ced600-a364-11ec-b497-abd1d9fe36ad',
                        driver_id: 25885,
                        created_time: '02 Nov 2022 15:55',
                        updated_time: '02 Nov 2022 15:55',
                        user_id_created: 83994,
                        user_id_updated: 83994,
                        admin_name: 'Dev Middle',
                        driver_name: 'Anita Maharani',
                        driver_nik: '21081090',
                        admin_nik: '20000666',
                    },
                ],
            },
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
