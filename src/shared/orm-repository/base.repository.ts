import { has, isArray, isObject } from 'lodash';
import { DeepPartial, FindOneOptions, Repository } from 'typeorm';

export class BaseRepository<T> extends Repository<T> {
  findById(id: string | number, options?: FindOneOptions<T>): Promise<T> {
    return this.findOneOrFail(id, options);
  }

  create(): T;
  create(entityLikeArray: Array<DeepPartial<T>>): T[];
  create(entityLike: DeepPartial<T>): T;
  create(
    plainEntityLikeOrPlainEntityLikes?: DeepPartial<T> | Array<DeepPartial<T>>,
  ): T | T[] {
    const result = super.create(plainEntityLikeOrPlainEntityLikes as any);

    if (isArray(result)) {
      result.forEach(resultItem => {
        if (has(resultItem, 'runEntityValidationBeforeSave')) {
          delete resultItem['runEntityValidationBeforeSave'];
        }
      });
    } else if (isObject(result)) {
      delete result['runEntityValidationBeforeSave'];
    }

    return result;
  }
}
