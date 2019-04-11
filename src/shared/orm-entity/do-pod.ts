import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("do_pod",{schema:"public" } )
export class DoPod {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"do_pod_id"
        })
    doPodId:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"do_pod_code"
        })
    doPodCode:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"ref_do_pod_code"
        })
    refDoPodCode:string | null;
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        name:"do_pod_date_time"
        })
    doPodDateTime:Date;
        

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
        

    @Column("bigint",{ 
        nullable:true,
        name:"branch_id_to"
        })
    branchIdTo:string | null;
        

    @Column("integer",{ 
        nullable:true,
        name:"total_assigned"
        })
    totalAssigned:number | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"user_id_driver"
        })
    userIdDriver:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"employee_id_driver"
        })
    employeeIdDriver:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:100,
        name:"latitude_last"
        })
    latitudeLast:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:100,
        name:"longitude_last"
        })
    longitudeLast:string | null;
        

    @Column("integer",{ 
        nullable:false,
        default: () => "0",
        name:"total_item"
        })
    totalItem:number;
        

    @Column("integer",{ 
        nullable:false,
        default: () => "0",
        name:"total_pod_item"
        })
    totalPodItem:number;
        

    @Column("numeric",{ 
        nullable:false,
        default: () => "0",
        precision:20,
        scale:5,
        name:"total_weight"
        })
    totalWeight:string;
        

    @Column("bigint",{ 
        nullable:true,
        name:"do_pod_status_id_last"
        })
    doPodStatusIdLast:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"do_pod_history_id_last"
        })
    doPodHistoryIdLast:string | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"history_date_time_last"
        })
    historyDateTimeLast:Date | null;
        

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
        

    @Column("integer",{ 
        nullable:true,
        name:"do_pod_type"
        })
    doPodType:number | null;
        

    @Column("integer",{ 
        nullable:true,
        name:"third_party_id"
        })
    thirdPartyId:number | null;
        
}
