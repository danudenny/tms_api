import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('industry_type', { schema: 'public' })
export class IndustryType extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'industry_type_id',
  })
  industryTypeId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'industry_type_code',
  })
  industryTypeCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'industry_type_name',
  })
  industryTypeName: string | null;

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
