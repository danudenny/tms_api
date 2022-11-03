import {
  CreateBagPayload,
  CreateBagResponse,
  GetBagPayload,
  GetBagResponse,
  InsertAWBPayload,
  InsertAWBResponse,
} from '../models/bag-service.payload';

export interface BagService {
  create: (payload: CreateBagPayload) => Promise<CreateBagResponse>;
  insertAWB: (payload: InsertAWBPayload) => Promise<InsertAWBResponse>;
  getBag: (payload: GetBagPayload) => Promise<GetBagResponse>;
}
