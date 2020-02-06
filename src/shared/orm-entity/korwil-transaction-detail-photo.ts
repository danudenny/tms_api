import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Branch } from './branch';
import { User } from './user';

@Entity('korwil_transaction_detail_photo', { schema: 'public' })
export class KorwilTransactionDetailPhoto extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'korwil_transaction_detail_photo_id',
  })
  korwilTransactionDetailPhotoId: number;

  @Column('bigint', {
    nullable: true,
    name: 'korwil_transaction_id',
  })
  korwilTransactionId: number | null;

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
