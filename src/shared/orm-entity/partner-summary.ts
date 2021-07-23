import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TmsBaseEntity } from './tms-base';

@Entity('partner_summary', { schema: 'public' })
export class PartnerSummary extends TmsBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'uuid',
    name: 'partner_summary_id',
  })
  partnerSumaryId: number;

  @Column('bigint', {
    nullable: false,
    name: 'partner_id',
  })
  partnerId: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'start_date',
  })
  startDate: Date | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'end_date',
  })
  endDate: Date | null;

  @Column('bigint', {
    nullable: true,
    default: () => '0',
    name: 'total_order',
  })
  totalOrder: number;
}
