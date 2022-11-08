import {
  CreateBagPayload,
  CreateBagResponse,
  GetBagPayload,
  GetBagResponse,
  GetBagSummaryResponse,
  InsertAWBPayload,
  InsertAWBResponse,
} from '../models/bag-service.payload';

export const BAG_SERVICE = 'BAG_SERVICE';

export interface BagService {
  create: (payload: CreateBagPayload) => Promise<CreateBagResponse>;
  insertAWB: (payload: InsertAWBPayload) => Promise<InsertAWBResponse>;
  getBag: (payload: GetBagPayload) => Promise<GetBagResponse>;
  getBagSummary: (payload: GetBagPayload) => Promise<GetBagSummaryResponse>;
}
