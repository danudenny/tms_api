import { castArray } from 'lodash';

export class DeferFunctionService {
  public static queue: Array<[() => Function | Function[], any]> = [];

  public static add(fn: () => Function | Function[]) {
    return function(_a, _b) {
      DeferFunctionService.queue.push([fn, arguments]);
    };
  }

  public static apply(reset: boolean = true) {
    DeferFunctionService.queue.forEach(([fn, fnArguments]) => {
      const functionCollection = fn();
      castArray(functionCollection).forEach(functionItem => {
        functionItem.apply(null, fnArguments);
      });
    });

    if (reset) {
      DeferFunctionService.reset();
    }
  }

  public static reset() {
    DeferFunctionService.queue = [];
  }
}
