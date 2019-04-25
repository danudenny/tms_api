import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Role } from './role';

@Entity('role_permission', { schema: 'public' })
export class RolePermission extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  role_permission_id: string;

  @Column('bigint', {
    nullable: false,

  })
  role_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  nav: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  name: string | null;

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

  @ManyToOne(type => Role, role => role.rolePermission, {})
  @JoinColumn({ name: 'role_id' })
  roleId: Role | null;
}
