import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';
import { User } from './user';

@Entity('korwil_item', { schema: 'public' })
export class KorwilItem extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'korwil_item_id',
  })
  korwilItemId: number;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'korwil_item_code',
  })
  korwilItemCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'korwil_item_name',
  })
  korwilItemName: string | null;;

  @Column('integer', {
    nullable: true,
    default: () => '0',
    name: 'sort_order',
  })
  sortOrder: number | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @OneToMany(() => Branch, e => e.branchId)
  branches: Branch[];

  @OneToMany(() => User, e => e.userId)
  users: User[];
}
