import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('airline', { schema: 'public' })
export class Airline extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'airline_id',
  })
  airlineId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'airline_code',
  })
  airlineCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'airline_name',
  })
  airlineName: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'attachment_id',
  })
  attachmentId: string | null;

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
