import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("detail_email_at_night",{schema:"public" } )
@Index("dean_customer_account_id_idx",["customerAccountId",])
@Index("dean_email_at_night_id_idx",["emailAtNightId",])
@Index("dean_status_email_idx",["statusEmail",])
export class DetailEmailAtNight {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"detail_email_at_night_id"
        })
    detailEmailAtNightId:string;
        

    @Column("bigint",{ 
        nullable:true,
        name:"email_at_night_id"
        })
    emailAtNightId:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"customer_account_id"
        })
    customerAccountId:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"pdf_url"
        })
    pdfUrl:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:1,
        name:"status_email"
        })
    statusEmail:string | null;
        

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
