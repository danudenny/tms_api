import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("customer_meta",{schema:"public" } )
@Index("index_meta_key",["metaKey",])
export class CustomerMeta {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"customer_meta_id"
        })
    customerMetaId:string;
        

    @Column("bigint",{ 
        nullable:true,
        name:"customer_account_id"
        })
    customerAccountId:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"meta_key"
        })
    metaKey:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"meta_value"
        })
    metaValue:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"meta_type"
        })
    metaType:string | null;
        

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
