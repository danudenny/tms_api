import { isNil } from 'lodash';
import { createMultipleParamDecorator, createParamDecorator } from './helpers';

const initialMetadata = {
  name: '',
  required: true,
};

export const ApiImplicitHeader = (metadata: {
  name: string;
  description?: string;
  required?: boolean;
}): any => {
  const param = {
    name: isNil(metadata.name) ? initialMetadata.name : metadata.name,
    in: 'header',
    description: metadata.description,
    required: metadata.required,
    type: String,
  };
  return createParamDecorator(param, initialMetadata);
};

export const ApiImplicitHeaders = (
  headers: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>,
): MethodDecorator => {
  const multiMetadata = headers.map(metadata => ({
    name: isNil(metadata.name) ? initialMetadata.name : metadata.name,
    in: 'header',
    description: metadata.description,
    required: metadata.required,
    type: String,
  }));
  return createMultipleParamDecorator(multiMetadata, initialMetadata);
};
