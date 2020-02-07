import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Branch } from './branch';
import { User } from './user';
import { AttachmentTms } from './attachment-tms';

@Entity('korwil_transaction_detail_photo', { schema: 'public' })
export class KorwilTransactionDetailPhoto extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'korwil_transaction_detail_photo_id',
  })
  korwilTransactionDetailPhotoId: string;

  @Column('uuid', {
    nullable: true,
    name: 'korwil_transaction_detail_id',
  })
  korwilTransactionDetailId: string | null;

  @Column('integer', {
    nullable: true,
    default: () => '0',
    name: 'photo_id',
  })
  photoId: number | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;
}
