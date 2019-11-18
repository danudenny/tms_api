import { forEach, merge, size } from 'lodash';
import { FindConditions } from 'typeorm';

export class QueryConditionsHelper<TEntity = any> {
  currentAndConditions: Array<FindConditions<TEntity>> = [];
  currentOrConditions: Array<FindConditions<TEntity>> = [];

  addAndCondition(option: any) {
    this.currentAndConditions.push(option);
  }

  addOrCondition(option: any) {
    const arrayOfEachOptionItem = Object.entries(option).map(([k, v]) => ({ [k]: v }));
    this.currentOrConditions.push(...arrayOfEachOptionItem as any);
  }

  buildConditions() {
    const targetConditions: Array<FindConditions<TEntity>> = [];

    const targetAndConditions: FindConditions<TEntity> = {};
    this.currentAndConditions.forEach(currentAndCondition => {
      merge(targetAndConditions, currentAndCondition);
    });

    if (size(this.currentOrConditions)) {
      forEach(this.currentOrConditions, currentOrCondition => {
        targetConditions.push(
          Object.assign({}, currentOrCondition, targetAndConditions),
        );
      });
    } else if (size(targetAndConditions)) {
      targetConditions[0] = targetAndConditions;
    }

    return targetConditions;
  }
}
