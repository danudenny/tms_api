import { Column, Entity, BaseEntity } from 'typeorm';

@Entity('awb_sunfish_log', { schema: 'public' })
export class AwbSunfishLog extends BaseEntity {
  @Column('uuid', {
    nullable: false,
    primary: true,
    name: 'awb_sunfish_log_id',
  })
  awbSunfishLogId: string;

  @Column('varchar', {
    nullable: false,
    length: 100,
    name: 'awb_number',
  })
  awbNumber: string;

  @Column('text', {
    nullable: false,
    name: 'request_data',
  })
  requestData: string;

  @Column('varchar', {
    nullable: false,
    length: 3,
    name: 'response_code',
  })
  responseCode: string;

  @Column('text', {
    nullable: false,
    name: 'response_data',
  })
  responseData: string;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'date_time',
  })
  dateTime: Date;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean | null;
}
