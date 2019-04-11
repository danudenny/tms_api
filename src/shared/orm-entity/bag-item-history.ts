import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("bag_item_history",{schema:"public" } )
export class BagItemHistory {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"bag_item_history_id"
        })
    bagItemHistoryId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"bag_item_id"
        })
    bagItemId:string;
        

    @Column("bigint",{ 
        nullable:true,
        name:"user_id"
        })
    userId:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"branch_id"
        })
    branchId:string | null;
        

    @Column("bigint",{ 
        nullable:false,
        name:"bag_item_status_id"
        })
    bagItemStatusId:string;
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        name:"history_date"
        })
    historyDate:Date;
        

    @Column("text",{ 
        nullable:true,
        name:"note"
        })
    note:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"ref_table"
        })
    refTable:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"ref_id"
        })
    refId:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"ref_module"
        })
    refModule:string | null;
        

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
