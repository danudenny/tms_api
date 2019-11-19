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

@Entity('sync_awb', { schema: 'public' })
export class SyncAwb extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  sync_awb_id: string;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  sync_code: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  request_date: Date;

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  total_data: number;

  @Column('text', {
    nullable: true,

  })
  request: string | null;

  @Column('text', {
    nullable: true,

  })
  response: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_success: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_dead: boolean;
}
