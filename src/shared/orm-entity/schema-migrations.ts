import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("schema_migrations",{schema:"public" } )
export class SchemaMigrations {

    @Column("character varying",{ 
        nullable:false,
        primary:true,
        name:"version"
        })
    version:string;
        
}
