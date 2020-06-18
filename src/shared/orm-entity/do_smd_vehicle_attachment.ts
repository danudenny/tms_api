import { Column, Entity, Index, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { Representative } from './representative';
import { Branch } from './branch';
import { DoSmdDetail } from './do_smd_detail';
import { DoSmd } from './do_smd';
import { DoSmdHistory } from './do_smd_history';

@Entity('do_smd_vehicle_attachment', { schema: 'public' })
// @Index('bag_bag_date_idx', ['bagDate'])
// @Index('bag_bag_number_idx', ['bagNumber'])
// @Index('bag_branch_id_idx', ['branchId'])
// @Index('bag_created_time_idx', ['createdTime'])
// @Index('bag_is_deleted_idx', ['isDeleted'])
export class DoSmdVehicleAttachment extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_smd_vehicle_attachment_id',
  })
  doSmdVehicleAttachmentId: number;

  @Column('bigint', {
    nullable: false,
    name: 'do_smd_vehicle_id',
  })
  doSmdVehicleId: number;

  @Column('bigint', {
    nullable: false,
    name: 'do_smd_id',
  })
  doSmdId: number;

  // @Column('bigint', {
  //   nullable: false,
  //   name: 'attachment_tms_id',
  // })
  // attachmentTmsId: number;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'photo_url',
  })
  photoUrl: string | null;

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

}
