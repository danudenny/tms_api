import { set, size } from 'lodash';
import onChange = require('on-change');
import { AfterUpdate, BaseEntity, getConnection } from 'typeorm';

export class BaseActionEntity extends BaseEntity {
  private changedValues: any = {};

  public prepareUpdate() {
    onChange.unsubscribe(this);
    return onChange(this, this.watchChangeHandler);
  }

  @AfterUpdate()
  private resetChanges() {
    this.changedValues = {};
  }

  private watchChangeHandler = (path: string, value, _previousValue) => {
    set(this.changedValues, path, value);
  }

  async save(upsert?: boolean): Promise<this> {
    if (this.hasId() && !upsert && size(this.changedValues)) {
      const entityMetadata = getConnection().getMetadata(this.constructor);
      return (this.constructor as any).update(entityMetadata.getEntityIdMap(this), this.changedValues);
    }

    return super.save();
  }
}
