import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
