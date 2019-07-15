import {BaseEntity, Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, RelationId} from 'typeorm';

@Entity('ar_internal_metadata', {schema: 'public' } )
export class ArInternalMetadata {

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
