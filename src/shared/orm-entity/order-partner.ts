import { Column, Entity, PrimaryGeneratedColumn, OneToMany, JoinColumn, OneToOne, ManyToOne } from 'typeorm';

import { TmsBaseEntity } from './tms-base';

@Entity('order_partner', { schema: 'public' })
export class OrderPartner extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'order_partner_id',
  })
  orderPartnerId: string;

  @Column('bigint', {
    nullable: false,
    name: 'partner_id',
  })
  partnerId: number;

  @Column('character varying', {
    nullable: true,
    name: 'order_no',
  })
  orderNo: string | null;

  @Column('boolean', {
    nullable: false,
    name: 'is_pickup',
  })
  isPickup: boolean;

  @Column('boolean', {
    nullable: false,
    name: 'is_delivery',
  })
  isDelivery: boolean;
}
