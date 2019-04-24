import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('representative', { schema: 'public' })
export class Representative extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'representative_id',
  })
  representativeId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'representative_code',
  })
  representativeCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'representative_name',
  })
  representativeName: string;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'email',
  })
  email: string | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: string | null;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 10,
    scale: 5,
    name: 'min_weight',
  })
  minWeight: string;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 10,
    scale: 5,
    name: 'price_per_kg',
  })
  pricePerKg: string;

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

  @Column('bigint', {
    nullable: true,
    name: 'representative_id_parent',
  })
  representativeIdParent: string | null;
}
