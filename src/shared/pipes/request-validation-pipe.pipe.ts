import { ArgumentMetadata, BadRequestException, Injectable, Optional, PipeTransform } from '@nestjs/common';
import { classToPlain, ClassTransformOptions, plainToClass } from 'class-transformer';
import { validate, ValidationError, ValidatorOptions } from 'class-validator';
import { isNil, isObject, isPlainObject } from 'lodash';

import { ObjectService } from '../services/object.service';

export interface RequestValidationPipeOptions extends ValidatorOptions {
  transform?: boolean;
  disableErrorMessages?: boolean;
  transformOptions?: ClassTransformOptions & {
    tranformObjectKeysCase?: 'snake_case' | 'camelCase';
  };
  exceptionFactory?: (errors: ValidationError[]) => any;
}

@Injectable()
export class RequestValidationPipe implements PipeTransform<any> {
  protected isTransformEnabled: boolean;
  protected isDetailedOutputDisabled?: boolean;
  protected validatorOptions: ValidatorOptions;
  protected transformOptions: ClassTransformOptions & {
    tranformObjectKeysCase?: 'snake_case' | 'camelCase';
  };
  protected exceptionFactory: (errors: ValidationError[]) => any;

  constructor(@Optional() options?: RequestValidationPipeOptions) {
    options = options || {};
    const {
      transform,
      disableErrorMessages,
      transformOptions,
      ...validatorOptions
    } = options;
    this.isTransformEnabled = !!transform;
    this.validatorOptions = validatorOptions;
    this.transformOptions = transformOptions;
    this.isDetailedOutputDisabled = disableErrorMessages;
    this.exceptionFactory =
      options.exceptionFactory ||
      (errors =>
        new BadRequestException(
          this.isDetailedOutputDisabled ? undefined : errors,
        ));
  }

  public async transform(value, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metadata)) {
      return value;
    }

    value = this.transformObjectKeysCase(value);

    const entity = plainToClass(
      metatype,
      this.toEmptyIfNil(value),
      this.transformOptions,
    );

    const errors = await validate(entity, this.validatorOptions);
    if (errors.length > 0) {
      throw this.exceptionFactory(errors);
    }

    return this.isTransformEnabled
      ? entity
      : Object.keys(this.validatorOptions).length > 0
      ? classToPlain(entity, this.transformOptions)
      : value;
  }

  private transformObjectKeysCase(value) {
    if (
      isPlainObject(value) &&
      this.transformOptions &&
      this.transformOptions.tranformObjectKeysCase
    ) {
      if (
        this.transformOptions.tranformObjectKeysCase === 'camelCase' &&
        isObject(value)
      ) {
        value = ObjectService.transformToCamelCaseKeys(value);
      }

      if (
        this.transformOptions.tranformObjectKeysCase === 'snake_case' &&
        isObject(value)
      ) {
        value = ObjectService.transformToSnakeCaseKeys(value);
      }
    }

    return value;
  }

  private toValidate(metadata: ArgumentMetadata): boolean {
    const { metatype, type } = metadata;
    if (type === 'custom') {
      return false;
    }
    const types = [String, Boolean, Number, Array, Object];
    return !types.some(t => metatype === t) && !isNil(metatype);
  }

  toEmptyIfNil<T = any, R = any>(value: T): R | {} {
    return isNil(value) ? {} : value;
  }
}
