import { DECORATORS } from '../constants';

export const exploreApiExcludeEndpointMetadata = (
  _instance,
  _prototype,
  method,
) => {
  return Reflect.getMetadata(DECORATORS.API_EXCLUDE_ENDPOINT, method);
};
