import { Column, Entity,  PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { DoPod } from './do-pod';
import { BagItem } from './bag-item';

@Entity('do_pod_detail_bag', { schema: 'public' })
export class DoPodDetailBag extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'do_pod_detail_bag_id',
  })
  doPodDetailBagId: string;

  @Column('character varying', {
    nullable: false,
    name: 'do_pod_id',
  })
  doPodId: string;

  @Column('bigint', {
    nullable: true,
    name: 'bag_id',
  })
  bagId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'bag_item_id',
  })
  bagItemId: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'transaction_status_id_last',
  })
  transactionStatusIdLast: number;

  @ManyToOne(() => DoPod)
  @JoinColumn({ name: 'do_pod_id' })
  doPod: DoPod;

  @OneToOne(() => BagItem)
  @JoinColumn({ name: 'bag_item_id' })
  bagItem: BagItem;
}
