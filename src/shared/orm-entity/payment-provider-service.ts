import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { DoPodDeliverDetail } from './do-pod-deliver-detail';
import { TmsBaseEntity } from './tms-base';

@Entity('payment_provider_service', { schema: 'public' })
export class PaymentProviderService extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'payment_provider_service_id',
  })
  paymentProviderServiceId: string;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'payment_provider_service_name',
  })
  paymentProviderServiceName: string;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'payment_provider_service_link',
  })
  paymentProviderServiceLink: string;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'payment_provider_service_logo',
  })
  paymentProviderServiceLogo: string;
}
