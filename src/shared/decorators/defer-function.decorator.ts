import { DeferFunctionService } from '../services/defer-function.service';

export const DeferFunction = (fn: () => Function | Function[]) => {
  return DeferFunctionService.add(fn);
};
