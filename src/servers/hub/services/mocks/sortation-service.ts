import { SortationService } from '../../interfaces/sortation-service.interface';
import { GetAwbResponse } from '../../models/check-awb/check-awb.response';

export class MockSortationService implements SortationService {
  getAwb(awbNumber: string): Promise<GetAwbResponse> {
    return Promise.resolve({
      destination: 'Tangerang Kudu Agung',
      transport_type: 'SMU',
    });
  }
}
