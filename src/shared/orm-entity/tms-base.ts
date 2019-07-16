import { BaseEntity, BeforeInsert, BeforeUpdate, Column } from 'typeorm';

export class TmsBaseEntity extends BaseEntity {
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
    this.createdTime = new Date();
    this.updatedTime = new Date();

    const { AuthService } = require('../services/auth.service');
    const authMeta = AuthService.getAuthMetadata();
    if (authMeta && authMeta.userId) {
      this.userIdCreated = authMeta.userId;
      this.userIdUpdated = authMeta.userId;
    }
  }

  @BeforeUpdate()
  assignUpdatedTimeAndUserIdUpdated() {
    this.updatedTime = new Date();

    const { AuthService } = require('../services/auth.service');
    const authMeta = AuthService.getAuthMetadata();
    if (authMeta && authMeta.userId) {
      this.userIdUpdated = authMeta.userId;
    }
  }
}
