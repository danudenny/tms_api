import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('district_reference', { schema: 'public' })
export class DistrictReference extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  district_reference_id: string;

  @Column('bigint', {
    nullable: false,

  })
  district_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  ref_owner: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  ref_code: string;

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
