import express = require('express');

import { BagItem } from '../../../shared/orm-entity/bag-item';
import {
  HubBagInsertAwbPayload,
  HubBagInsertAwbResponse,
  HubBagSummary,
} from '../models/bag/hub-bag.payload';

export const HUB_BAG_SERVICE = 'HUB_BAG_SERVICE';

export interface HubBagService {
  insertAWB: (
    payload: HubBagInsertAwbPayload,
  ) => Promise<HubBagInsertAwbResponse>;
  get: (bagItemId: string) => Promise<Partial<BagItem>>;
  getSummary: (bagItemId: string) => Promise<HubBagSummary>;
  printSticker: (
    bagSummary: HubBagSummary,
    userId: number,
    branchId: number,
    res: express.Response,
  ) => Promise<any>;
}
