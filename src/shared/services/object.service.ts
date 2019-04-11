import { camelCase, forEach, isNumber, isObject, set, snakeCase } from 'lodash';

export class ObjectService {
  static transformToSnakeCaseKeys(
    targetObject: any,
    parentKey?: string,
    objectResult: any = {},
  ) {
    if (isObject(targetObject)) {
      forEach(targetObject, (value, key) => {
        if (`${key}`.startsWith('_')) {
          return;
        }

        const snakeCaseKey = !isNumber(key) ? snakeCase(key) : key;
        const currentKey = parentKey
          ? `${parentKey}.${snakeCaseKey}`
          : snakeCaseKey;
        if (isObject(value)) {
          ObjectService.transformToSnakeCaseKeys(value, currentKey, objectResult);
        } else {
          set(objectResult, currentKey, value);
        }
      });

      return objectResult;
    } else {
      return targetObject;
    }
  }

  static transformToCamelCaseKeys(
    targetObject: any,
    parentKey?: string,
    objectResult: any = {},
  ) {
    if (isObject(targetObject)) {
      forEach(targetObject, (value, key) => {
        if (`${key}`.startsWith('_')) {
          return;
        }

        const camelCaseKey = !isNumber(key) ? camelCase(key) : key;
        const currentKey = parentKey
          ? `${parentKey}.${camelCaseKey}`
          : camelCaseKey;
        if (isObject(value)) {
          ObjectService.transformToCamelCaseKeys(value, currentKey, objectResult);
        } else {
          set(objectResult, currentKey, value);
        }
      });

      return objectResult;
    } else {
      return targetObject;
    }
  }
}
