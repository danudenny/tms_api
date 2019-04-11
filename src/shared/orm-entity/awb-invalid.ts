import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("awb_invalid",{schema:"public" } )
export class AwbInvalid {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"awb_invalid_id"
        })
    awbInvalidId:string;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"awb_date_time"
        })
    awbDateTime:Date | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:100,
        name:"ref_awb_number"
        })
    refAwbNumber:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"message_error"
        })
    messageError:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"booking_customer_account_id"
        })
    bookingCustomerAccountId:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"current_customer_account_id"
        })
    currentCustomerAccountId:string | null;
        

    @Column("json",{ 
        nullable:true,
        name:"request"
        })
    request:Object | null;
        

    @Column("boolean",{ 
        nullable:false,
        default: () => "false",
        name:"is_deleted"
        })
    isDeleted:boolean;
        
}
