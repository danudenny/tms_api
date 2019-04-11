import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("cms_option",{schema:"public" } )
export class CmsOption {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"cms_option_id"
        })
    cmsOptionId:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"cms_option_name"
        })
    cmsOptionName:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"cms_option_value"
        })
    cmsOptionValue:string | null;
        

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
