import { BaseEntity, Column, Entity } from 'typeorm';

@Entity('ar_internal_metadata', { schema: 'public' })
export class ArInternalMetadata extends BaseEntity {
  @Column('character varying', {
    nullable: false,
    primary: true,
    name: 'key',
  })
  key: string;

  @Column('character varying', {
    nullable: true,
    name: 'value',
  })
  value: string | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_at',
  })
  createdAt: Date;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_at',
  })
  updatedAt: Date;
}
