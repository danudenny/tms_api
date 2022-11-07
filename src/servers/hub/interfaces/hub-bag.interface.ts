import {
  HubBagInsertAwbPayload,
  HubBagInsertAwbResponse,
} from '../models/bag/hub-bag.payload';

export const HUB_BAG_SERVICE = 'HUB_BAG_SERVICE';

export interface HubBagService {
  insertAWB: (
    payload: HubBagInsertAwbPayload,
  ) => Promise<HubBagInsertAwbResponse>;
}
