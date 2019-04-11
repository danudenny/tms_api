import { DECORATORS } from '../constants';

export const exploreApiOperationMetadata = (_instance, _prototype, method) => {
  return Reflect.getMetadata(DECORATORS.API_OPERATION, method);
};
