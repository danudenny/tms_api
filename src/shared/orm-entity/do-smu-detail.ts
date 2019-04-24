import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('do_smu_detail', { schema: 'public' })
export class DoSmuDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_smu_detail_id',
  })
  doSmuDetailId: string;

  @Column('bigint', {
    nullable: false,
    name: 'do_smu_id',
  })
  doSmuId: string;

  @Column('bigint', {
    nullable: false,
    name: 'smu_id',
  })
  smuId: string;

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

  @Column('text', {
    nullable: true,
    name: 'note',
  })
  note: string | null;

  @Column('jsonb', {
    nullable: true,
    name: 'attachment_tms_id_smu_pic',
  })
  attachmentTmsIdSmuPic: Object | null;

  @Column('bigint', {
    nullable: false,
    default: () => '0',
    name: 'smu_item_id',
  })
  smuItemId: string;
}
