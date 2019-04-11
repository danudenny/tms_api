import { DECORATORS } from '../constants';

export const exploreGlobalApiUseTagsMetadata = metatype => {
  const tags = Reflect.getMetadata(DECORATORS.API_USE_TAGS, metatype);
  return tags ? { tags } : undefined;
};

export const exploreApiUseTagsMetadata = (_instance, _prototype, method) => {
  return Reflect.getMetadata(DECORATORS.API_USE_TAGS, method);
};
