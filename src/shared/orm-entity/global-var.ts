import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('global_var', { schema: 'public' })
export class GlobalVar extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'global_var_id',
  })
  globalVarId: number;

  @Column('text', {
    nullable: true,
    name: 'key',
  })
  key: string | null;

  @Column('text', {
    nullable: true,
    name: 'value',
  })
  value: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_formula',
  })
  isFormula: boolean;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'code',
  })
  code: string | null;
}
