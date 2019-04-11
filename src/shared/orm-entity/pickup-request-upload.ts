import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("pickup_request_upload",{schema:"public" } )
export class PickupRequestUpload {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"pickup_request_upload_id"
        })
    pickupRequestUploadId:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"pickup_request_upload_code"
        })
    pickupRequestUploadCode:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"pickup_request_upload_name"
        })
    pickupRequestUploadName:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"pickup_request_upload_email"
        })
    pickupRequestUploadEmail:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:100,
        name:"pickup_request_upload_contact_no"
        })
    pickupRequestUploadContactNo:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"pickup_request_upload_address"
        })
    pickupRequestUploadAddress:string | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"pickup_request_upload_date_time"
        })
    pickupRequestUploadDateTime:Date | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"pickup_schedule_date_time"
        })
    pickupScheduleDateTime:Date | null;
        

    @Column("text",{ 
        nullable:true,
        name:"pickup_request_upload_notes"
        })
    pickupRequestUploadNotes:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"pickup_request_upload_status_id"
        })
    pickupRequestUploadStatusId:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"pickup_request_upload_status_id_last"
        })
    pickupRequestUploadStatusIdLast:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:50,
        name:"pickup_request_upload_type"
        })
    pickupRequestUploadType:string | null;
        

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
