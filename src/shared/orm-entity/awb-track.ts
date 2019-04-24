import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('awb_track', { schema: 'public' })
export class AwbTrack extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  awb_track_id: string;

  @Column('bigint', {
    nullable: false,
  })
  awb_id: string;

  @Column('json', {
    nullable: false,
  })
  track_json: Object;

  @Column('bigint', {
    nullable: false,
  })
  user_id_created: string;

  @Column('timestamp without time zone', {
    nullable: false,
  })
  created_time: Date;

  @Column('bigint', {
    nullable: false,
  })
  user_id_updated: string;

  @Column('timestamp without time zone', {
    nullable: false,
  })
  updated_time: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_deleted: boolean;
}
