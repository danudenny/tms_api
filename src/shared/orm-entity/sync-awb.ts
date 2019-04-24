import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sync_awb', { schema: 'public' })
export class SyncAwb extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'sync_awb_id',
  })
  syncAwbId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'sync_code',
  })
  syncCode: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'request_date',
  })
  requestDate: Date;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'total_data',
  })
  totalData: number;

  @Column('text', {
    nullable: true,
    name: 'request',
  })
  request: string | null;

  @Column('text', {
    nullable: true,
    name: 'response',
  })
  response: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_success',
  })
  isSuccess: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_dead',
  })
  isDead: boolean;
}
