import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("do_pod_history",{schema:"public" } )
export class DoPodHistory {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"do_pod_history_id"
        })
    doPodHistoryId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"do_pod_id"
        })
    doPodId:string;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"do_pod_date_time"
        })
    doPodDateTime:Date | null;
        

    @Column("bigint",{ 
        nullable:false,
        name:"user_id"
        })
    userId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"branch_id"
        })
    branchId:string;
        

    @Column("boolean",{ 
        nullable:true,
        name:"is_member"
        })
    isMember:boolean | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"customer_account_id"
        })
    customerAccountId:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"customer_account_merchant_id"
        })
    customerAccountMerchantId:string | null;
        

    @Column("integer",{ 
        nullable:true,
        name:"total_assigned"
        })
    totalAssigned:number | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"employee_id_driver"
        })
    employeeIdDriver:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"user_id_driver"
        })
    userIdDriver:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:100,
        name:"latitude"
        })
    latitude:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:100,
        name:"longitude"
        })
    longitude:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"consignee_name"
        })
    consigneeName:string | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"received_date_time"
        })
    receivedDateTime:Date | null;
        

    @Column("numeric",{ 
        nullable:false,
        default: () => "0",
        precision:20,
        scale:5,
        name:"total_weight"
        })
    totalWeight:string;
        

    @Column("text",{ 
        nullable:true,
        name:"history_notes"
        })
    historyNotes:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"reason_id"
        })
    reasonId:string | null;
        

    @Column("bigint",{ 
        nullable:false,
        name:"do_pod_status_id"
        })
    doPodStatusId:string;
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        name:"history_date_time"
        })
    historyDateTime:Date;
        

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
        

    @Column("bigint",{ 
        nullable:true,
        name:"do_pod_detail_id"
        })
    doPodDetailId:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"branch_id_to"
        })
    branchIdTo:string | null;
        

    @Column("integer",{ 
        nullable:true,
        name:"third_party_id"
        })
    thirdPartyId:number | null;
        
}
