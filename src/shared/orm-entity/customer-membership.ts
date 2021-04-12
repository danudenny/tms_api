import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_membership', { schema: 'public' })
export class CustomerMembership extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'customer_membership_id',
  })
  customerMembershipId: string;

  @Column('character varying', {
    nullable: false,
    length: 50, 
    name: 'one_id',
  })
  oneId: string;

  @Column('character varying', {
    nullable: true,
    length: 50, 
    name: 'status_membership',
  })
  statusMembership: string | null;

  @Column('character varying', {
    nullable: false,
    name: 'data',
  })
  data: string | null;
  
  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'email',
  })
  email: string;

  @Column('character varying', {
    nullable: true,
    name: 'reject_notes',
  })
  rejectNotes: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

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
