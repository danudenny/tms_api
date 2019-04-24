import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_setting_detail', { schema: 'public' })
export class CustomerSettingDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  customer_setting_detail_id: string;

  @Column('bigint', {
    nullable: false,

  })
  customer_setting_id: string;

  @Column('integer', {
    nullable: true,

  })
  day_number: number | null;

  @Column('integer', {
    nullable: true,

  })
  date_number: number | null;

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
