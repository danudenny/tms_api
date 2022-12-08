import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';

export const HUB_BAG_LIST_SERVICE = 'HUB_BAG_LIST_SERVICE';

export interface HubBagListService {
  listBag: (payload: BaseMetaPayloadVm) => Promise<any>;
  detailBag: (payload: BaseMetaPayloadVm) => Promise<any>;
}
