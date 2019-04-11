import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("payment_method",{schema:"public" } )
export class PaymentMethod {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"payment_method_id"
        })
    paymentMethodId:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"payment_method_code"
        })
    paymentMethodCode:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"payment_method_name"
        })
    paymentMethodName:string | null;
        

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
