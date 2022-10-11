import { GetAwbResponse } from '../models/check-awb/check-awb.response';

export const SORTATION_SERVICE = 'SORTATION_SERVICE';

export interface SortationService {
  getAwb(awbNumber: string): Promise<GetAwbResponse>;
}
