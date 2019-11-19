import { camelCase, forEach, isArray, isNumber, isObject, isPlainObject, set, snakeCase } from 'lodash';

export class ObjectService {
  static flatten<T, V = T[keyof T]>(
    obj: T,
    options: {
      removeArrayIndexes?: boolean;
      childFilter?: (cfVal: V, cfKey: string, treeKey: string) => boolean;
    } = {},
    parentPath: string = '',
    result: { [key: string]: V } = {},
  ) {
    const paramObjIsArray = isArray(obj);

    for (const objKey in obj) {
      if (!obj.hasOwnProperty(objKey)) {
        continue;
      }

      const objVal = obj[objKey];

      let treeObjKey = parentPath ? `${parentPath}.${objKey}` : objKey;

      const isObjectType = isPlainObject(objVal);
      const isArrayType = isArray(objVal);

      if (
        options &&
        options.removeArrayIndexes &&
        paramObjIsArray &&
        (isObjectType || isArrayType)
      ) {
        treeObjKey = parentPath ? parentPath : '';
      }

      let processCurrentObj = true;
      if (options && options.childFilter) {
        processCurrentObj = options.childFilter(
          objVal as any,
          objKey,
          treeObjKey,
        );
      }

      if (processCurrentObj) {
        // tslint:disable-next-line: triple-equals
        if (isObjectType || isArrayType) {
          this.flatten(objVal, options, treeObjKey, result);
        } else {
          result[treeObjKey] = objVal as any;
        }
      }
    }

    return result;
  }

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
          ObjectService.transformToSnakeCaseKeys(
            value,
            currentKey,
            objectResult,
          );
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
          ObjectService.transformToCamelCaseKeys(
            value,
            currentKey,
            objectResult,
          );
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
