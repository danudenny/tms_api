import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AwbStatusGroup } from './awb-status-group';

@Entity('awb_status_group_item', { schema: 'public' })
export class AwbStatusGroupItem extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_status_group_item_id',
  })
  awbStatusGroupItemId: number;

  @Column('bigint', {
    nullable: false,
    name: 'awb_status_group_id',
  })
  awbStatusGroupId: string;

  @Column('bigint', {
    nullable: false,
    name: 'awb_status_id',
  })
  awbStatusId: string;

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
  @ManyToOne(
    () => AwbStatusGroup,
      x => x.awbStatusGroupItems,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'awb_status_group_id',
  })
  awbStatusGroup: AwbStatusGroup;
}
