import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('division_department', { schema: 'public' })
export class DivisionDepartment extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'division_department_id',
  })
  divisionDepartmentId: string;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: string;

  @Column('bigint', {
    nullable: false,
    name: 'division_id',
  })
  divisionId: string;

  @Column('bigint', {
    nullable: false,
    name: 'department_id',
  })
  departmentId: string;

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
