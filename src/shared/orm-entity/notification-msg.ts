import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("notification_msg",{schema:"public" } )
export class NotificationMsg {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"notification_msg_id"
        })
    notificationMsgId:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"title"
        })
    title:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"message"
        })
    message:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"attachment_id"
        })
    attachmentId:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"module"
        })
    module:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"ref_table"
        })
    refTable:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"ref_id"
        })
    refId:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"response_message"
        })
    responseMessage:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"multicast_id"
        })
    multicastId:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"success"
        })
    success:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"failure"
        })
    failure:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"canonical_ids"
        })
    canonicalIds:string | null;
        

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
        

    @Column("json",{ 
        nullable:true,
        name:"options"
        })
    options:Object | null;
        
}
