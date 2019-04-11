import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Items} from "./items";


@Entity("todos",{schema:"public" } )
export class Todos {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"id"
        })
    id:string;
        

    @Column("character varying",{ 
        nullable:true,
        name:"title"
        })
    title:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        name:"created_by"
        })
    createdBy:string | null;
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        name:"created_at"
        })
    createdAt:Date;
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        name:"updated_at"
        })
    updatedAt:Date;
        

   
    @OneToMany(type=>Items, items=>items.todo)
    itemss:Items[];
    
}