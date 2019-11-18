import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Optional, PlainLiteralObject } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { isObject, isPlainObject, merge } from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DECORATOR } from '../constants/decorator.constant';
import { IResponseSerializerOptions } from '../decorators/response-serializer-options.decorator';
import { ObjectService } from '../services/object.service';

export class ResponseSerializerInterceptorConstructorOptions {
  public transformObjectKeysCase?: 'snake_case' | 'camelCase';
}

@Injectable()
export class ResponseSerializerInterceptor implements NestInterceptor {
  constructor(
    @Optional() public options?: ResponseSerializerInterceptorConstructorOptions,
  ) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next.handle().pipe(
      map((res: PlainLiteralObject | PlainLiteralObject[]) =>
        this.serialize(res, context),
      ),
    );
  }

  public serialize(
    response: PlainLiteralObject | PlainLiteralObject[],
    context: ExecutionContext,
  ): PlainLiteralObject | PlainLiteralObject[] {
    const serializeOptions = this.getSerializeHandlerOptions(
      context.getClass(),
      context.getHandler(),
    );

    if (serializeOptions && serializeOptions.disable) {
      return response;
    }

    const isArray = Array.isArray(response);
    if (!isObject(response) && !isArray) {
      return response;
    }
    return isArray
      ? (response as PlainLiteralObject[]).map(item =>
          this.transformToPlain(item, serializeOptions),
        )
      : this.transformToPlain(response, serializeOptions);
  }

  public transformToPlain(
    plainOrClass,
    serializeOptions: IResponseSerializerOptions,
  ): PlainLiteralObject {
    if (plainOrClass && plainOrClass.toJSON) {
      plainOrClass = plainOrClass.toJSON();
    }

    let targetObject = plainOrClass;

    if (serializeOptions && serializeOptions.type) {
      targetObject = new serializeOptions.type();
      Object.assign(targetObject, plainOrClass);
    }

    let objectResult: any = {};
    if (!isPlainObject(targetObject)) {
      objectResult = classToPlain(targetObject, {
        strategy: 'excludeAll',
      });
    } else {
      objectResult = targetObject;
    }

    const convertObjectKeysCase = serializeOptions.convertObjectKeysCase || this.options && this.options.transformObjectKeysCase;
    if (convertObjectKeysCase) {
      switch (convertObjectKeysCase) {
        case 'snake_case':
          objectResult = ObjectService.transformToSnakeCaseKeys(objectResult);
          break;
        case 'camelCase':
          objectResult = ObjectService.transformToCamelCaseKeys(objectResult);
          break;
      }
    }

    return objectResult;
  }

  public getSerializeHandlerOptions(targetClass, targetHandler): IResponseSerializerOptions {
    return merge(
      {},
      Reflect.getMetadata(
        DECORATOR.RESPONSE_SERIALIZER_OPTIONS,
        targetClass,
      ) || {},
      Reflect.getMetadata(
        DECORATOR.RESPONSE_SERIALIZER_OPTIONS,
        targetHandler,
      ) || {},
    );
  }
}
