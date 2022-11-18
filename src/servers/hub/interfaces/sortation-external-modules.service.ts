import {
    SortationL2ModuleFinishManualPayloadVm,
    SortationL2ModuleSearchPayloadVm,
} from '../models/sortation/web/sortation-l2-module-search.payload.vm';
import {BaseMetaPayloadVm} from '../../../shared/models/base-meta-payload.vm';
export const SORTATION_EXTERNAL_MODULE_SERVICE = 'SORTATION_EXTERNAL_MODULE_SERVICE';

export interface SortationExternalModulesService {
    search: (params: SortationL2ModuleSearchPayloadVm) => Promise<any>;
    finish: (params) => Promise<any>;
    // handover: (params: SortationL2ModuleHandoverPayloadVm) => Promise<any>;
    listFinish: (params: BaseMetaPayloadVm) => Promise<any>;
}
