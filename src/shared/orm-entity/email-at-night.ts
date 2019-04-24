import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('email_at_night', { schema: 'public' })
@Index('ean_awb_date_idx', ['awbDate'])
@Index('ean_updated_time_idx', ['updatedTime'])
export class EmailAtNight extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'email_at_night_id',
  })
  emailAtNightId: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'awb_date',
  })
  awbDate: Date;

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
}
