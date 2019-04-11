import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("calculation_discount",{schema:"public" } )
export class CalculationDiscount {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"calculation_discount_id"
        })
    calculationDiscountId:string;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"awb_date"
        })
    awbDate:Date | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"awb_price_id"
        })
    awbPriceId:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"awb_number"
        })
    awbNumber:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"customer_account_id"
        })
    customerAccountId:string | null;
        

    @Column("integer",{ 
        nullable:true,
        name:"status_calculation"
        })
    statusCalculation:number | null;
        

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
