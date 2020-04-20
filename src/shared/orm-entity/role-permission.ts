import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Role } from './role';
import { TmsBaseEntity } from './tms-base';

@Entity('role_permission', { schema: 'public' })
export class RolePermission extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  role_permission_id: string;

  @Column('bigint', {
    nullable: false,
  })
  role_id: number;

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

  @Column('character varying', {
    nullable: true,
    length: 100,
  })
  app_name: string | null;

  @ManyToOne(() => Role, e => e.rolePermissions)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
