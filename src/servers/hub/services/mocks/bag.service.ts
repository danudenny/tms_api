import { BagService } from '../../../../shared/interfaces/bag.service.interface';
import {
  CreateBagPayload,
  CreateBagResponse,
  InsertAWBPayload,
  InsertAWBResponse,
  GetBagPayload,
  GetBagResponse,
  GetBagSummaryResponse,
} from '../../../../shared/models/bag-service.payload';

export class MockBagService implements BagService {
  public async create(payload: CreateBagPayload): Promise<CreateBagResponse> {
    return {
      bag_number: 'SPBE09P001',
      bag_id: '61c1494786158d5dabdef1df',
      bag_item_id: '61c1494786158d5dabdef1e0',
      bag_status_id: 3000,
    };
  }

  public async insertAWB(
    payload: InsertAWBPayload,
  ): Promise<InsertAWBResponse> {
    return {
      bag_id: '61c1494786158d5dabdef1df',
      total_awb_weight: 20,
      total_awb: 5,
    };
  }

  public async getBag(payload: GetBagPayload): Promise<GetBagResponse> {
    return {
      bag_item_id: '628b27237be08440a68664e4',
      bag_item_id_old: '1528621295179153408',
      weight: 44.8,
      bag_number: 'ZBPJ0YU03Z',
      representative_id: 87,
      representative_code: 'TES',
      transportation_mode: 'SMD',
      awbs: ['601000000101'],
    };
  }

  public async getBagSummary(
    payload: GetBagPayload,
  ): Promise<GetBagSummaryResponse> {
    return {
      weight: 44.8,
      bag_number: 'ZBPJ0YU03Z',
      representative_id: 87,
      representative_code: 'TES',
      transportation_mode: 'SMD',
      awbs: 1,
    };
  }
}
