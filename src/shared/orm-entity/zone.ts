import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('zone', { schema: 'public' })
export class Zone extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  zone_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  zone_code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  zone_name: string;

  @Column('text', {
    nullable: true,

  })
  description: string | null;

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
