import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('zone', { schema: 'public' })
export class Zone extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'zone_id',
  })
  zoneId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'zone_code',
  })
  zoneCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'zone_name',
  })
  zoneName: string;

  @Column('text', {
    nullable: true,
    name: 'description',
  })
  description: string | null;

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
