import { BaseEntity, Column, Entity } from 'typeorm';

@Entity('schema_migrations', { schema: 'public' })
export class SchemaMigrations extends BaseEntity {
  @Column('character varying', {
    nullable: false,
    primary: true,

  })
  version: string;
}
