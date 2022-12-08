import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {SortationExternalModulesService} from '../../../interfaces/sortation-external-modules.service';
import {
    SortationL2ModuleFinishManualPayloadVm,
    SortationL2ModuleHandoverPayloadVm,
    SortationL2ModuleSearchPayloadVm,
} from '../../../models/sortation/web/sortation-l2-module-search.payload.vm';
import {SortationFinishHistoryResponVm} from '../../../models/sortation/web/sortation-l2-module-list.response.vm';
import {BaseMetaPayloadVm} from '../../../../../shared/models/base-meta-payload.vm';
import {ConfigService} from '../../../../../shared/services/config.service';
import {HttpRequestAxiosService} from '../../../../../shared/services/http-request-axios.service';
import {AxiosRequestConfig} from 'axios';
import {PinoLoggerService} from '../../../../../shared/services/pino-logger.service';

@Injectable()
export class DefaultSortationExternalModulesService implements SortationExternalModulesService {
    private readonly BASE_URL = ConfigService.get('hubMonitoring.baseUrl');
    constructor(private readonly httpRequestService: HttpRequestAxiosService) {}
    async finish(params): Promise<any> {
        return this.post('/smu/module/finish', params);
    }

    // handover(params: SortationL2ModuleHandoverPayloadVm): Promise<any> {
    //     return Promise.resolve(undefined);
    // }

    async listFinish(params): Promise<SortationFinishHistoryResponVm> {
        return this.post('/smu/module/finish/list', params);
    }

    async search(params: SortationL2ModuleSearchPayloadVm): Promise<any> {
        return this.post('/smu/module/search', params);
    }

    private async post(path: string, payload: any): Promise<any> {
        try {
            const config = {
                headers: this.getHeaders(),
            } as AxiosRequestConfig;
            const url = `${this.BASE_URL}${path}`;
            return await this.httpRequestService
                .post(url, payload, config)
                .toPromise();
        } catch (err) {
            if (err.response) {
                const status = err.response.status || HttpStatus.BAD_REQUEST;
                const errResponse = {
                    error: err.response.data && err.response.data.error,
                    message: err.response.data && err.response.data.message,
                    code: err.response.data && err.response.data.code,
                    statusCode: status,
                };
                if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
                    PinoLoggerService.error(
                        `[ExternalBaggingService] Response Error: ${errResponse.message}`,
                    );
                }
                throw new HttpException(errResponse, status);
            }
            PinoLoggerService.error(
                `[ExternalBaggingService] Request Error: ${err.message}`,
            );
            throw err;
        }
    }

    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-source': 'TMS',
            'x-channel-id': 'MiddleMile',
        };
    }
}
