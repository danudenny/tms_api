import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('airport', { schema: 'public' })
export class Airport extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  airport_id: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  airport_code: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  airport_name: string | null;

  @Column('bigint', {
    nullable: false,
  })
  city_id: string;

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

  @Column('bigint', {
    nullable: false,
    default: () => '0',
  })
  representative_id: string;
}
