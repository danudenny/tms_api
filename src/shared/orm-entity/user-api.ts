import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("user_api",{schema:"public" } )
export class UserApi {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"id"
        })
    id:string;
        

    @Column("character varying",{ 
        nullable:true,
        name:"name"
        })
    name:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        name:"email"
        })
    email:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        name:"password_digest"
        })
    passwordDigest:string | null;
        

    @Column("boolean",{ 
        nullable:true,
        default: () => "false",
        name:"is_deleted"
        })
    isDeleted:boolean | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"created_time"
        })
    createdTime:Date | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"updated_time"
        })
    updatedTime:Date | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"client_id"
        })
    clientId:string | null;
        
}
