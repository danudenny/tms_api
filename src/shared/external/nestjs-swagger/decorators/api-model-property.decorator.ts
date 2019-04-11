import { Expose as DTODownExpose, ExposeOptions, Type as DTOUpType } from 'class-transformer';
import { Allow as DtoUpAllow, IsDefined as DtoUpRequiredDecorator, ValidationOptions } from 'class-validator';
import { camelCase, isFunction, snakeCase } from 'lodash';

import { DeferFunctionService } from '../../../services/defer-function.service';
import { DECORATORS } from '../constants';
import { SwaggerEnumType } from '../types/swagger-enum.type';
import { createPropertyDecorator, getTypeIsArrayTuple } from './helpers';

export const ApiModelProperty = (
  metadata: {
    description?: string;
    required?: boolean;
    type?: any;
    isArray?: boolean;
    collectionFormat?: string;
    default?: any;
    enum?: SwaggerEnumType;
    format?: string;
    in?: string;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: number;
    minimum?: number;
    exclusiveMinimum?: number;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    readOnly?: boolean;
    xml?: any;
    example?: any;
    name?: string;
    nameCase?: 'snake_case' | 'camelCase';
  } = {},
  dtoDownOptions?: ExposeOptions,
  dtoUpOptions?: ValidationOptions,
): PropertyDecorator => {
  return DeferFunctionService.add(
    () => (target: object, propertyKey: string) => {
      metadata = metadata || {};
      metadata.name = metadata.name || propertyKey;
      metadata.required =
        metadata.required !== undefined ? metadata.required : true;
      metadata.type = isFunction(metadata.type)
        ? metadata.type()
        : metadata.type;

      if (metadata.nameCase && !metadata.name.startsWith('_')) {
        switch (metadata.nameCase) {
          case 'snake_case':
            metadata.name = snakeCase(metadata.name);
            break;
          case 'camelCase':
            metadata.name = camelCase(metadata.name);
            break;
        }
      }

      dtoDownOptions = dtoDownOptions || {};
      dtoDownOptions.name = metadata.name || propertyKey;

      const dtoDownExposeDecorator = DTODownExpose(dtoDownOptions);
      dtoDownExposeDecorator(target, propertyKey);

      const dtoUpAllowDecorator = DtoUpAllow(dtoUpOptions);
      dtoUpAllowDecorator(target, propertyKey);

      if (metadata.required) {
        const dtoUpRequiredDecorator = DtoUpRequiredDecorator(dtoUpOptions);
        dtoUpRequiredDecorator(target, propertyKey);
      }

      const [type, isArray] = getTypeIsArrayTuple(
        metadata.type,
        metadata.isArray,
      );
      const propertyDecorator = createPropertyDecorator(
        DECORATORS.API_MODEL_PROPERTIES,
        {
          ...metadata,
          type,
          isArray,
        },
      );
      propertyDecorator(target, propertyKey);

      if (type && isFunction(type)) {
        const dtoUpTypeDecorator = DTOUpType(() => type);
        dtoUpTypeDecorator(target, propertyKey);
      }
    },
  );
};

export const ApiModelPropertyOptional = (
  metadata: {
    description?: string;
    type?: any;
    isArray?: boolean;
    collectionFormat?: string;
    default?: any;
    enum?: SwaggerEnumType;
    format?: string;
    in?: string;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: number;
    minimum?: number;
    exclusiveMinimum?: number;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    readOnly?: boolean;
    xml?: any;
    example?: any;
  } = {},
  exposeOptions?: ExposeOptions,
): PropertyDecorator =>
  ApiModelProperty(
    {
      ...metadata,
      required: false,
    },
    exposeOptions,
  );

export const ApiResponseModelProperty = (
  metadata: {
    type?: any;
    example?: any;
  } = {},
): PropertyDecorator =>
  ApiModelProperty({
    ...metadata,
  });
