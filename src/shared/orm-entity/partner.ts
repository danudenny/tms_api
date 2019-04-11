import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("partner",{schema:"public" } )
export class Partner {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"partner_id"
        })
    partnerId:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"partner_name"
        })
    partnerName:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"partner_email"
        })
    partnerEmail:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"api_key"
        })
    apiKey:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"customer_account_id"
        })
    customerAccountId:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"awb_number_start"
        })
    awbNumberStart:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"awb_number_end"
        })
    awbNumberEnd:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"current_awb_number"
        })
    currentAwbNumber:string | null;
        

    @Column("integer",{ 
        nullable:true,
        name:"sla_hour_pickup"
        })
    slaHourPickup:number | null;
        

    @Column("boolean",{ 
        nullable:false,
        default: () => "false",
        name:"is_active"
        })
    isActive:boolean;
        

    @Column("boolean",{ 
        nullable:false,
        default: () => "false",
        name:"is_email_log"
        })
    isEmailLog:boolean;
        

    @Column("boolean",{ 
        nullable:false,
        default: () => "false",
        name:"is_assign_to_branch"
        })
    isAssignToBranch:boolean;
        

    @Column("boolean",{ 
        nullable:false,
        default: () => "false",
        name:"is_assign_to_courier"
        })
    isAssignToCourier:boolean;
        

    @Column("boolean",{ 
        nullable:false,
        default: () => "false",
        name:"is_pick_unpick"
        })
    isPickUnpick:boolean;
        

    @Column("boolean",{ 
        nullable:false,
        default: () => "false",
        name:"is_reschedule"
        })
    isReschedule:boolean;
        

    @Column("character varying",{ 
        nullable:true,
        length:20,
        name:"sm_code"
        })
    smCode:string | null;
        

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
        

    @Column("json",{ 
        nullable:true,
        name:"validation"
        })
    validation:Object | null;
        
}
