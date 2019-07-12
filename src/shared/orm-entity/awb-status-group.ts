import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { AwbStatusGroupItem } from './awb-status-group-item';

@Entity('awb_status_group', { schema: 'public' })
export class AwbStatusGroup extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_status_group_id',
  })
  awbStatusGroupId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
  })
  name: string;

  @Column('text', {
    nullable: true,
  })
  description: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: string;

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

  // relation model
  @OneToMany(() => AwbStatusGroupItem, x => x.awbStatusGroup)
  awbStatusGroupItems: AwbStatusGroupItem[];
}
