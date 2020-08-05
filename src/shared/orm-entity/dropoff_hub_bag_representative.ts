import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { TmsBaseEntity } from './tms-base';
import { Branch } from './branch';
import { DropoffHubDetailBagRepresentative } from './dropoff_hub_detail_bag_representative';

@Entity('dropoff_hub_bag_representative', { schema: 'public' })
export class DropoffHubBagRepresentative extends TmsBaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'dropoff_hub_bag_representative_id',
  })
  dropoffHubBagRepresentativeId: string;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
  })
  branchId: number | null;

  @Column('bigint', {
    nullable: false,
    name: 'bag_representative_id',
  })
  bagRepresentativeId: number;

  // new field
  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'bag_representative_code',
  })
  bagRepresentativeCode: string;

  @OneToMany(() => DropoffHubDetailBagRepresentative, e => e.dropoffHubBagRepresentative, { cascade: ['insert'] })
  dropoffHubBagRepresentativeDetails: DropoffHubDetailBagRepresentative[];

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id', referencedColumnName: 'branchId' })
  branch: Branch;
}
