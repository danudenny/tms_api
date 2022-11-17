import { CheckAwbPayload } from '../models/check-awb/check-awb.payload';
import {
  CheckAwbResponse,
  StartCheckAwbResponse,
} from '../models/check-awb/check-awb.response';

export const CHECK_AWB_SERVICE = 'CHECK_AWB_SERVICE';

export interface CheckAwbService {
  startSession: () => Promise<StartCheckAwbResponse>;
  getAwb: (payload: CheckAwbPayload) => Promise<CheckAwbResponse>;
}
