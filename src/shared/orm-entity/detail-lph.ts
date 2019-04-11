import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("detail_lph",{schema:"public" } )
@Index("detail_lph_customer_account_id_idx",["customerAccountId",])
@Index("detail_lph_lph_id_idx",["lphId",])
@Index("detail_lph_status_email_idx",["statusEmail",])
export class DetailLph {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"detail_lph_id"
        })
    detailLphId:string;
        

    @Column("bigint",{ 
        nullable:true,
        name:"lph_id"
        })
    lphId:string | null;
        

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
