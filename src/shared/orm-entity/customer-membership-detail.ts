import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_membership_detail', { schema: 'public' })
export class CustomerMembershipDetail extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'customer_membership_detail_id',
  })
  customerMembershipDetailId: string;

  @Column('character varying', {
    nullable: false,
    length: 50, 
    name: 'one_id',
  })
  oneId: string;

  @Column('bigint', {
    nullable: false,
    name: 'partner_id',
  })
  partnerId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'email',
  })
  email: string;

  @Column('character varying', {
    nullable: false,
    length: 50, 
    name: 'status',
  })
  status: string;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;
}
