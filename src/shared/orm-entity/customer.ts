import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("customer",{schema:"public" } )
export class Customer {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"customer_id"
        })
    customerId:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"customer_code"
        })
    customerCode:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"customer_name"
        })
    customerName:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:200,
        name:"email1"
        })
    email1:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:200,
        name:"email2"
        })
    email2:string | null;
        

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
