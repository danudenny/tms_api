import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';

@Entity('bag_representative_status', { schema: 'public' })
export class BagRepresentativeStatus extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'bag_representative_status_id',
  })
  bagRepresentativeStatusId: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'status_code',
  })
  statusCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'status_title',
  })
  statusTitle: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'status_name',
  })
  statusName: string;
  
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
