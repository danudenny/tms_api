import {
    SortationL2ModuleFinishManualPayloadVm, SortationL2ModuleHandoverPayloadVm,
    SortationL2ModuleSearchPayloadVm,
} from '../models/sortation/web/sortation-l2-module-search.payload.vm';
import {BaseMetaPayloadVm} from '../../../shared/models/base-meta-payload.vm';
import {SortationFinishHistoryResponVm} from '../models/sortation/web/sortation-l2-module-list.response.vm';

export interface ExternalModulesService {
    search: (params: SortationL2ModuleSearchPayloadVm) => Promise<any>;
    finish: (params: SortationL2ModuleFinishManualPayloadVm) => Promise<any>;
    handover: (params: SortationL2ModuleHandoverPayloadVm) => Promise<any>;
    listFinish: (params: BaseMetaPayloadVm) => Promise<SortationFinishHistoryResponVm>;
}
