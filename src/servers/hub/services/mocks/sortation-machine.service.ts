import { SortationMachineService } from '../../interfaces/sortation-machine-service.interface';
import {
  CheckAwbRequest,
  CheckAwbResponse,
  GetAwbResponse,
} from '../../models/sortation-machine/sortation-machine.payload';

export class MockSortationMachineService implements SortationMachineService {
  checkAwb(payload: CheckAwbRequest): Promise<CheckAwbResponse> {
    return Promise.resolve({
      destination: 'Tangerang Kadu Agung',
      transport_type: 'SMU',
    });
  }

  getAwb(payload: CheckAwbRequest): Promise<GetAwbResponse> {
    return Promise.resolve({
      awb_item_id: 46958266,
      weight: 2.1,
      transport_type: 'SMU',
      district_code: 'DCODE',
      branch_id_lastmile: 1,
      representative_id: 1,
      representative: 'SUB',
      consignee_name: 'Dory',
      consignee_address: 'P. Sherman 42, Wallaby Way',
    });
  }
}
