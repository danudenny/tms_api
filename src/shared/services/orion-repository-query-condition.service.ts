import { castArray } from 'lodash';
import { SelectQueryBuilder } from 'typeorm';

import { ORION_REPOSITORY } from '../constants/orion-repository.constant';
import {
  OrionRepositorQueryConditionOptionsInternal,
  OrionRepositoryQueryBuilderPart,
  OrionRepositoryQueryComparableProp,
} from '../models/orion-repository.model';

export class OrionRepositoryQueryConditionService<T> {
  get or() {
    this.whereQueryBuilderFn = this.queryBuilder.orWhere;

    return this;
  }

  get and() {
    this.whereQueryBuilderFn = this.queryBuilder.andWhere;

    return this;
  }

  constructor(
    public prop: OrionRepositoryQueryComparableProp,
    public queryBuilder: SelectQueryBuilder<T>,
    public queryBuilderParts: Array<OrionRepositoryQueryBuilderPart<T>>,
    private whereQueryBuilderFn?: (...params: any[]) => SelectQueryBuilder<T>,
  ) {
    if (!whereQueryBuilderFn) {
      this.whereQueryBuilderFn = this.queryBuilder.where;
    }
  }

  public beginsWith(value: string, insensitive: boolean = false) {
    return this.completeWhere(ORION_REPOSITORY.SQL.OPERATOR_LIKE, value, {
      beginsWith: true,
    });
  }

  public contains(value: string, insensitive: boolean = false) {
    return this.completeWhere(ORION_REPOSITORY.SQL.OPERATOR_LIKE, value, {
      beginsWith: true,
      endsWith: true,
      insensitive,
    });
  }

  public endsWith(value: string, insensitive: boolean = false) {
    return this.completeWhere(ORION_REPOSITORY.SQL.OPERATOR_LIKE, value, {
      endsWith: true,
      insensitive,
    });
  }

  public equals(value: string | number | boolean | Date) {
    return this.completeWhere(ORION_REPOSITORY.SQL.OPERATOR_EQUAL, value, null);
  }

  public greaterThan(value: number | Date) {
    return this.completeWhere(ORION_REPOSITORY.SQL.OPERATOR_GREATER, value);
  }

  public greaterThanOrEqual(value: number | Date) {
    return this.completeWhere(
      ORION_REPOSITORY.SQL.OPERATOR_GREATER_EQUAL,
      value,
    );
  }

  public in(include: string[] | number[]) {
    // If comparing strings, must escape them as strings in the query.
    this.escapeStringArray(castArray(include as string[]));

    return this.completeWhere(
      ORION_REPOSITORY.SQL.OPERATOR_IN,
      `(${include.join(', ')})`,
      { quoteString: false },
    );
  }

  public isFalse() {
    this.equals(false);

    return this;
  }

  public isNotNull() {
    return this.completeWhere(
      ORION_REPOSITORY.SQL.OPERATOR_IS,
      ORION_REPOSITORY.SQL.OPERATOR_NOT_NULL,
      { quoteString: false },
    );
  }

  public isNull() {
    return this.completeWhere(
      ORION_REPOSITORY.SQL.OPERATOR_IS,
      ORION_REPOSITORY.SQL.OPERATOR_NULL,
      { quoteString: false },
    );
  }

  public isTrue() {
    this.equals(true);

    return this;
  }

  public lessThan(value: number | Date) {
    return this.completeWhere(ORION_REPOSITORY.SQL.OPERATOR_LESS, value);
  }

  public lessThanOrEqual(value: number | Date) {
    return this.completeWhere(ORION_REPOSITORY.SQL.OPERATOR_LESS_EQUAL, value);
  }

  public notEquals(value: string | number | boolean | Date) {
    return this.completeWhere(
      ORION_REPOSITORY.SQL.OPERATOR_NOT_EQUAL,
      value,
      null,
    );
  }

  public notIn(exclude: string[] | number[]) {
    // If comparing strings, must escape them as strings in the query.
    this.escapeStringArray(castArray(exclude as string[]));

    return this.completeWhere(
      ORION_REPOSITORY.SQL.OPERATOR_NOT_IN,
      `(${exclude.join(', ')})`,
      { quoteString: false },
    );
  }

  private completeWhere(
    operator: string,
    value: string | number | boolean | Date,
    optionsInternal?: OrionRepositorQueryConditionOptionsInternal,
  ) {
    let beginsWith: boolean = false;
    let endsWith: boolean = false;
    let quoteString: boolean = true;
    let insensitive: boolean = false;

    if (optionsInternal) {
      if (typeof optionsInternal.beginsWith === 'boolean') {
        beginsWith = optionsInternal.beginsWith;
      }

      if (typeof optionsInternal.endsWith === 'boolean') {
        endsWith = optionsInternal.endsWith;
      }

      if (typeof optionsInternal.quoteString === 'boolean') {
        quoteString = optionsInternal.quoteString;
      }

      if (typeof optionsInternal.insensitive === 'boolean') {
        insensitive = optionsInternal.insensitive;
      }
    }

    let parsedValue = value;

    if (typeof value === 'string' && quoteString) {
      parsedValue = `${value.replace(/'/g, "''")}`;
    } else if (value instanceof Date) {
      parsedValue = `${value.toISOString()}`;
    }

    if (endsWith) {
      parsedValue = `%${parsedValue}`;
    }

    if (beginsWith) {
      parsedValue = `${parsedValue}%`;
    }

    if (quoteString) {
      parsedValue = `'${parsedValue}'`;
    }

    let prop = this.prop;
    if (insensitive) {
      prop = `LOWER(${this.prop})`;
      parsedValue = `${parsedValue}`.toLowerCase();
    }

    const whereExpression = `${prop} ${operator} ${parsedValue}`;

    this.queryBuilderParts.push(
      new OrionRepositoryQueryBuilderPart(this.whereQueryBuilderFn, [
        whereExpression,
      ]),
    );

    return this;
  }

  private escapeStringArray(array: string[]): void {
    array.forEach((value, i) => {
      if (typeof value === 'string') {
        array[i] = `'${value}'`;
      }
    });
  }
}
