import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('app_notification', { schema: 'public' })
export class AppNotification extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'app_notification_id',
  })
  appNotificationId: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'app_code',
  })
  appCode: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'image_url',
  })
  imageUrl: string | null;

  @Column('text', {
    nullable: true,
    name: 'message',
  })
  message: string | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_active',
  })
  isActive: boolean;
}
