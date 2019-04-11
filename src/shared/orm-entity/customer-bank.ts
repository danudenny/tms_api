import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("customer_bank",{schema:"public" } )
export class CustomerBank {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"customer_bank_id"
        })
    customerBankId:string;
        

    @Column("bigint",{ 
        nullable:true,
        name:"customer_account_id"
        })
    customerAccountId:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"bank_branch_id"
        })
    bankBranchId:string | null;
        

    @Column("character varying",{ 
        nullable:false,
        length:200,
        name:"account_number"
        })
    accountNumber:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:200,
        name:"account_name"
        })
    accountName:string;
        

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
