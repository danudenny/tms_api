import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { AwbItem } from './awb-item';
import { AwbItemAttr } from './awb-item-attr';
import { PickupRequestDetail } from './pickup-request-detail';

@Entity('awb_high_value_upload', { schema: 'public' })
export class AwbHighValueUpload extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'awb_high_value_upload_id',
  })
  awbHighValueUploadId: string;

  @Column('bigint', {
    nullable: false,
    name: 'awb_item_id',
  })
  awbItemId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'display_name',
  })
  displayName: string;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_uploaded',
  })
  userIdUploaded: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'uploaded_time',
  })
  uploadedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @OneToOne(() => PickupRequestDetail)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  pickupRequestDetail: PickupRequestDetail;

  @OneToOne(() => AwbItemAttr)
  @JoinColumn({ name: 'awb_item_id', referencedColumnName: 'awbItemId' })
  awbItemAttr: AwbItemAttr;
}
