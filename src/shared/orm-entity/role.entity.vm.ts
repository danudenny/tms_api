import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { AccessPermission } from './access-permision-entity.vm';
import { BaseTimestampEntity } from './base-timestamp';

@Entity()
export class Role extends BaseTimestampEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToMany(
    () => AccessPermission,
    accessPermission => accessPermission.roles,
    {
      eager: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinTable()
  accesses: AccessPermission[];
}
