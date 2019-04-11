import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("pickup_request",{schema:"public" } )
@Index("pickup_request_last_request_idx",["encryptAddress255","partnerId","pickupRequestDateTime","pickupRequestName",])
@Index("pickup_request_partner_id",["partnerId",])
@Index("pickup_request_pickup_request_status_id",["pickupRequestStatusId",])
@Index("pickup_request_pickup_schedule_date_time",["pickupScheduleDateTime",])
export class PickupRequest {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"pickup_request_id"
        })
    pickupRequestId:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"pickup_request_code"
        })
    pickupRequestCode:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"pickup_request_name"
        })
    pickupRequestName:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"pickup_request_email"
        })
    pickupRequestEmail:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:100,
        name:"pickup_request_contact_no"
        })
    pickupRequestContactNo:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"pickup_request_address"
        })
    pickupRequestAddress:string | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"pickup_request_date_time"
        })
    pickupRequestDateTime:Date | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"pickup_schedule_date_time"
        })
    pickupScheduleDateTime:Date | null;
        

    @Column("text",{ 
        nullable:true,
        name:"pickup_request_notes"
        })
    pickupRequestNotes:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"pickup_request_status_id"
        })
    pickupRequestStatusId:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"pickup_request_status_id_last"
        })
    pickupRequestStatusIdLast:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:50,
        name:"pickup_request_type"
        })
    pickupRequestType:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:200,
        name:"reference_no"
        })
    referenceNo:string | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"order_date_time"
        })
    orderDateTime:Date | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"expired_date_time"
        })
    expiredDateTime:Date | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:100,
        name:"encrypt_address100"
        })
    encryptAddress100:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"encrypt_address255"
        })
    encryptAddress255:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"merchant_code"
        })
    merchantCode:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:200,
        name:"reference_number"
        })
    referenceNumber:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"partner_id"
        })
    partnerId:string | null;
        

    @Column("integer",{ 
        nullable:true,
        name:"total_awb"
        })
    totalAwb:number | null;
        

    @Column("bigint",{ 
        nullable:false,
        name:"user_id_created"
        })
    userIdCreated:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"user_created"
        })
    userCreated:string | null;
        

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
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"user_updated"
        })
    userUpdated:string | null;
        

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
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"encrypt_merchant_name"
        })
    encryptMerchantName:string | null;
        
}
