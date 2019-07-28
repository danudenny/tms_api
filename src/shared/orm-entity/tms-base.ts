import { BeforeInsert, BeforeUpdate, Column } from 'typeorm';

import { BaseActionEntity } from './base-action';

export class TmsBaseEntity extends BaseActionEntity {
  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @BeforeInsert()
  assignCreatedTimeAndUserIdCreated() {
    if (!this.createdTime) {
      this.createdTime = new Date();
    }

    if (!this.updatedTime) {
      this.updatedTime = new Date();
    }

    if (!this.userIdCreated || !this.userIdUpdated) {
      const { AuthService } = require('../services/auth.service');
      const authMeta = AuthService.getAuthMetadata();
      if (authMeta && authMeta.userId) {
        if (!this.userIdCreated) {
          this.userIdCreated = authMeta.userId;
        }

        if (!this.userIdUpdated) {
          this.userIdUpdated = authMeta.userId;
        }
      }
    }
  }

  @BeforeUpdate()
  assignUpdatedTimeAndUserIdUpdated() {
    if (!this.updatedTime) {
      this.updatedTime = new Date();
    }

    if (!this.userIdUpdated) {
      const { AuthService } = require('../services/auth.service');
      const authMeta = AuthService.getAuthMetadata();
      if (authMeta && authMeta.userId) {
        this.userIdUpdated = authMeta.userId;
      }
    }
  }
}
