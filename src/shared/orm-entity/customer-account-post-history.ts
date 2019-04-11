import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("customer_account_post_history",{schema:"public" } )
export class CustomerAccountPostHistory {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"customer_account_post_history_id"
        })
    customerAccountPostHistoryId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"awb_history_id"
        })
    awbHistoryId:string;
        

    @Column("bigint",{ 
        nullable:true,
        name:"awb_id"
        })
    awbId:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"awb_detail_id"
        })
    awbDetailId:string | null;
        

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
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        name:"history_date"
        })
    historyDate:Date;
        

    @Column("bigint",{ 
        nullable:true,
        name:"awb_status_id"
        })
    awbStatusId:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"awb_note"
        })
    awbNote:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"customer_account_id"
        })
    customerAccountId:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"ref_id_tracking_note"
        })
    refIdTrackingNote:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"ref_id_tracking_site"
        })
    refIdTrackingSite:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"ref_id_cust_package"
        })
    refIdCustPackage:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:50,
        name:"ref_awb_number"
        })
    refAwbNumber:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"ref_tracking_site_code"
        })
    refTrackingSiteCode:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"ref_tracking_site_name"
        })
    refTrackingSiteName:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"ref_partner_name"
        })
    refPartnerName:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"ref_recipient_name"
        })
    refRecipientName:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"ref_id_courier"
        })
    refIdCourier:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"ref_courier_name"
        })
    refCourierName:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"ref_tracking_type"
        })
    refTrackingType:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"ref_user_created"
        })
    refUserCreated:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"ref_user_updated"
        })
    refUserUpdated:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"request_body"
        })
    requestBody:string | null;
        

    @Column("integer",{ 
        nullable:true,
        default: () => "0",
        name:"status_post"
        })
    statusPost:number | null;
        

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
        

    @Column("text",{ 
        nullable:true,
        name:"response_body"
        })
    responseBody:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        default: () => "NULL::character varying",
        name:"post_history_code"
        })
    postHistoryCode:string | null;
        
}
