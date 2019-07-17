import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_setting_detail', { schema: 'public' })
export class CustomerSettingDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'customer_setting_detail_id',
  })
  customerSettingDetailId: string;

  @Column('bigint', {
    nullable: false,
    name: 'customer_setting_id',
  })
  customerSettingId: string;

  @Column('integer', {
    nullable: true,
    name: 'day_number',
  })
  dayNumber: number | null;

  @Column('integer', {
    nullable: true,
    name: 'date_number',
  })
  dateNumber: number | null;

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
