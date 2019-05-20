import { SetMetadata } from '@nestjs/common';

import { DECORATOR } from '../constants/decorator.constant';

export interface IResponseSerializerOptions {
  type?: any;
  convertObjectKeysCase?: 'snake_case' | 'camelCase';
}

export const ResponseSerializerOptions = (options: IResponseSerializerOptions) =>
  SetMetadata(DECORATOR.RESPONSE_SERIALIZER_OPTIONS, options);
