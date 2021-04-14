import {
  Column,
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('diva_data', { schema: 'public' })
export class DivaData extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
  })
  id: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'mid',
  })
  mid: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'tid',
  })
  tid: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'remark',
  })
  remark: string;
}
