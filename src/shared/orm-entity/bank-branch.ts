import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("bank_branch",{schema:"public" } )
export class BankBranch {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"bank_branch_id"
        })
    bankBranchId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"bank_id"
        })
    bankId:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"bank_branch_name"
        })
    bankBranchName:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"address"
        })
    address:string | null;
        

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
