import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';

@Entity('payment_method', { schema: 'public' })
export class PaymentMethod extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',

  })
  payment_method_id: string;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  payment_method_code: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,

  })
  payment_method_name: string | null;

  @Column('bigint', {
    nullable: false,

  })
  user_id_created: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  created_time: Date;

  @Column('bigint', {
    nullable: false,

  })
  user_id_updated: string;

  @Column('timestamp without time zone', {
    nullable: false,

  })
  updated_time: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',

  })
  is_deleted: boolean;
}
