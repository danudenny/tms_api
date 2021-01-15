import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  BaseEntity,
  OneToOne,
} from 'typeorm';

@Entity('audit_history', { schema: 'public' })
export class AwbStatusGrp extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_status_grp_id',
  })
  awbStatusGrpId: string;

  @Column('character varying', {
    nullable: false,
    name: 'awb_status_grp_name',
  })
  awbStatusGrpName: string;

  @Column('character varying', {
    nullable: false,
    name: 'app_code',
  })
  appCode: string;

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
