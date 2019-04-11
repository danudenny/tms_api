import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("invoice",{schema:"public" } )
export class Invoice {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"invoice_id"
        })
    invoiceId:string;
        

    @Column("bigint",{ 
        nullable:true,
        name:"invoice_id_parent"
        })
    invoiceIdParent:string | null;
        

    @Column("integer",{ 
        nullable:true,
        name:"invoice_code"
        })
    invoiceCode:number | null;
        

    @Column("integer",{ 
        nullable:true,
        name:"invoice_seq"
        })
    invoiceSeq:number | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"invoice_date"
        })
    invoiceDate:Date | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"awb_start_date"
        })
    awbStartDate:Date | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"awb_end_date"
        })
    awbEndDate:Date | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"reminder_date"
        })
    reminderDate:Date | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"customer_account_id"
        })
    customerAccountId:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:100,
        name:"email"
        })
    email:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        default: () => "0",
        precision:20,
        scale:5,
        name:"amount"
        })
    amount:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        default: () => "0",
        precision:20,
        scale:5,
        name:"weight"
        })
    weight:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        default: () => "0",
        precision:20,
        scale:5,
        name:"total_awb"
        })
    totalAwb:string | null;
        

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
