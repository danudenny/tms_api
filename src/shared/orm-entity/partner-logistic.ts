import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('partner_logistic', { schema: 'public' })
export class PartnerLogistic extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'partner_logistic_id',
  })
  partnerLogisticId: number;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'partner_logistic_name',
  })
  partnerLogisticName: string;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'partner_logistic_email',
  })
  partnerLogisticEmail: string;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'partner_logistic_notelp',
  })
  partnerLogisticNoTelp: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;
}
