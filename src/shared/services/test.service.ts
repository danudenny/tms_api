export class TestService {
  public static async wrapAsyncHandle(executionId: string, method: Function, runMethodLogic: boolean = true) {
    return async (...methodArgs) => {
      return this.interceptAsyncMethod(executionId, method, methodArgs, runMethodLogic);
    };
  }

  private static async interceptAsyncMethod(
    executionId: string,
    method: Function,
    methodArgs: any[],
    runMethodLogic: boolean = true,
  ) {
    if (process.env.NODE_ENV === 'test') {
      const envName = `TEST_FN_RESULT_${executionId}`;
      const mockResult = process.env[envName];
      if (mockResult) {
        if (runMethodLogic) {
          return method(...methodArgs).then(() => mockResult);
        } else {
          return mockResult;
        }
      } else {
        console.warn(`Expecting env ${envName} for fn test ${executionId}`);
      }
    }
    return method(...methodArgs);
  }
}
