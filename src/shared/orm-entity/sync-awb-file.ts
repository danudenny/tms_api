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

@Entity('sync_awb_file', { schema: 'public' })
export class SyncAwbFile extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  sync_awb_file_id: string;

  @Column('bigint', {
    nullable: false,

  })
  sync_id: string;

  @Column('timestamp without time zone', {
    nullable: true,

  })
  download_date: Date | null;

  @Column('character varying', {
    nullable: false,
    length: 255,

  })
  filename: string;

  @Column('text', {
    nullable: true,

  })
  url: string | null;

  @Column('text', {
    nullable: true,

  })
  error_message: string | null;

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  total_update: number;

  @Column('integer', {
    nullable: false,
    default: () => '0',

  })
  total_insert: number;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_done: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_dead: boolean;
}
