import {
  CheckAwbRequest,
  CheckAwbResponse,
} from '../models/sortation-machine/sortation-machine.payload';

export const SORTATION_MACHINE_SERVICE = 'SORTATION_MACHINE_SERVICE';

export interface SortationMachineService {
  checkAwb(payload: CheckAwbRequest): Promise<CheckAwbResponse>;
}
