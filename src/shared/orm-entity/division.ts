import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('division', { schema: 'public' })
export class Division extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'division_id',
  })
  divisionId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'division_code',
  })
  divisionCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'division_name',
  })
  divisionName: string;

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
    name: 'branch_id',
  })
  branchId: string | null;
}
