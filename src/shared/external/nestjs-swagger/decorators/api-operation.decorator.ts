import { isNil, isUndefined, negate, pickBy } from 'lodash';
import { DECORATORS } from '../constants';
import { createMethodDecorator } from './helpers';

const initialMetadata = {
  summary: '',
};

export const ApiOperation = (metadata: {
  title: string;
  description?: string;
  operationId?: string;
  deprecated?: boolean;
}): MethodDecorator => {
  return createMethodDecorator(
    DECORATORS.API_OPERATION,
    pickBy(
      {
        ...initialMetadata,
        summary: isNil(metadata.title)
          ? initialMetadata.summary
          : metadata.title,
        description: metadata.description,
        operationId: metadata.operationId,
        deprecated: metadata.deprecated,
      },
      negate(isUndefined),
    ),
  );
};
