import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("attachment_tms",{schema:"public" } )
export class AttachmentTms {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"attachment_tms_id"
        })
    attachmentTmsId:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"url"
        })
    url:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"attachment_path"
        })
    attachmentPath:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"attachment_name"
        })
    attachmentName:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"filename"
        })
    filename:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"description"
        })
    description:string | null;
        

    @Column("boolean",{ 
        nullable:false,
        default: () => "false",
        name:"is_used"
        })
    isUsed:boolean;
        

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
