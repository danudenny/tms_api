import { DECORATORS } from '../constants';

export const exploreGlobalApiProducesMetadata = metatype => {
  const produces = Reflect.getMetadata(DECORATORS.API_PRODUCES, metatype);
  return produces ? { produces } : undefined;
};

export const exploreApiProducesMetadata = (_instance, _prototype, method) => {
  return Reflect.getMetadata(DECORATORS.API_PRODUCES, method);
};
