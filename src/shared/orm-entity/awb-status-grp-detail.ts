import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  BaseEntity,
  OneToOne,
} from 'typeorm';
import { AwbStatusGrp } from './awb-status-grp';

@Entity('audit_history', { schema: 'public' })
export class AwbStatusGrpDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'awb_status_grp_detail_id',
  })
  awbStatusGrpDetailId: string;

  @Column('bigint', {
    nullable: false,
    name: 'awb_status_grp_id',
  })
  awbStatusGrpId: number;

  @Column('bigint', {
    nullable: false,
    name: 'awb_status_id',
  })
  awbStatusId: number;

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

  @OneToOne(() => AwbStatusGrp)
  @JoinColumn({ name: 'awb_status_grp_id', referencedColumnName: 'awbStatusGrpId' })
  awbStatusGrp: AwbStatusGrp;
}
