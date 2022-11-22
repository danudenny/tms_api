import { SortationMachineService } from '../../interfaces/sortation-machine-service.interface';
import {
  CheckAwbRequest,
  CheckAwbResponse,
} from '../../models/sortation-machine/sortation-machine.payload';

export class MockSortationMachineService implements SortationMachineService {
  checkAwb(payload: CheckAwbRequest): Promise<CheckAwbResponse> {
    return Promise.resolve({
      destination: 'Tangerang Kadu Agung',
      transport_type: 'SMU',
    });
  }
}
