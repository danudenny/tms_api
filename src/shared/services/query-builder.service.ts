import { SelectQueryBuilder } from 'typeorm';

import { RawQueryService } from './raw-query.service';

export class QueryBuilderService {
  /**
   * This method is for handling the lack of TypeORM getCount on query builder
   * If you found error something like Cannot get entity metadata for the given alias "abc" while calling on getCount on query builder,
   * maybe you should use this function for counting
   */
  public static async count(queryBuilder: SelectQueryBuilder<any>, countField: string = '1', distinct: boolean = false): Promise<number> {
    const hasMetadata = (queryBuilder.expressionMap.mainAlias! as any)
      ._metadata;

    if (hasMetadata) {
      return queryBuilder.getCount();
    } else {
      // this query builder FROM is using subquery, so metadata would'nt be detected
      const [sql, sqlParamters] = queryBuilder.getQueryAndParameters();
      const sqlModified = `SELECT COUNT(${distinct ? 'DISTINCT ' : ''}${countField}) AS cnt FROM (${sql}) as t`;
      const results = await RawQueryService.query(sqlModified, sqlParamters);
      return results && results.length ? +results[0].cnt : 0;
    }
  }
}
