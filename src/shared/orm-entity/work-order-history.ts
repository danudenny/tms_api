import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("work_order_history",{schema:"public" } )
export class WorkOrderHistory {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"work_order_history_id"
        })
    workOrderHistoryId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"work_order_id"
        })
    workOrderId:string;
        

    @Column("integer",{ 
        nullable:true,
        name:"work_order_seq"
        })
    workOrderSeq:number | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"work_order_date"
        })
    workOrderDate:Date | null;
        

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
        name:"customer_account_id_child"
        })
    customerAccountIdChild:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"guest_name"
        })
    guestName:string | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"pickup_schedule_date_time"
        })
    pickupScheduleDateTime:Date | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"pickup_phone"
        })
    pickupPhone:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"pickup_email"
        })
    pickupEmail:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"pickup_address"
        })
    pickupAddress:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"pickup_notes"
        })
    pickupNotes:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"branch_id_assigned"
        })
    branchIdAssigned:string | null;
        

    @Column("integer",{ 
        nullable:true,
        name:"total_assigned"
        })
    totalAssigned:number | null;
        

    @Column("boolean",{ 
        nullable:true,
        name:"is_assigned"
        })
    isAssigned:boolean | null;
        

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
        

    @Column("integer",{ 
        nullable:false,
        default: () => "0",
        name:"total_item"
        })
    totalItem:number;
        

    @Column("integer",{ 
        nullable:false,
        default: () => "0",
        name:"total_pickup_item"
        })
    totalPickupItem:number;
        

    @Column("numeric",{ 
        nullable:false,
        default: () => "0",
        precision:20,
        scale:5,
        name:"total_weight"
        })
    totalWeight:string;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"history_date_time_last"
        })
    historyDateTimeLast:Date | null;
        

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
        name:"work_order_status_id"
        })
    workOrderStatusId:string;
        

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
        name:"do_pickup_id_last"
        })
    doPickupIdLast:string | null;
        

    @Column("boolean",{ 
        nullable:true,
        default: () => "false",
        name:"is_posted"
        })
    isPosted:boolean | null;
        

    @Column("integer",{ 
        nullable:true,
        name:"send_tracking_note"
        })
    sendTrackingNote:number | null;
        
}
