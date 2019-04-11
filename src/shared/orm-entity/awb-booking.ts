import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("awb_booking",{schema:"public" } )
@Index("awb_number_idx",["awbNumber",],{unique:true})
@Index("awb_number_uniq",["awbNumber",],{unique:true})
export class AwbBooking {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"awb_booking_id"
        })
    awbBookingId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"customer_account_id"
        })
    customerAccountId:string;
        

    @Column("character varying",{ 
        nullable:false,
        unique: true,
        length:255,
        name:"awb_number"
        })
    awbNumber:string;
        

    @Column("bigint",{ 
        nullable:false,
        default: () => "1",
        name:"awb_booking_status_id"
        })
    awbBookingStatusId:string;
        

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
