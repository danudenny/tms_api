import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("email_log",{schema:"public" } )
export class EmailLog {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"email_log_id"
        })
    emailLogId:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"email_type"
        })
    emailType:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"ref_id"
        })
    refId:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"options"
        })
    options:string | null;
        

    @Column("bigint",{ 
        nullable:false,
        name:"user_id_created"
        })
    userIdCreated:string;
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        name:"created_time"
        })
    createdTime:Date;
        

    @Column("bigint",{ 
        nullable:false,
        name:"user_id_updated"
        })
    userIdUpdated:string;
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        name:"updated_time"
        })
    updatedTime:Date;
        

    @Column("boolean",{ 
        nullable:false,
        default: () => "false",
        name:"is_deleted"
        })
    isDeleted:boolean;
        
}
