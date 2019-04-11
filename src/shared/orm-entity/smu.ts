import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("smu",{schema:"public" } )
export class Smu {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"smu_id"
        })
    smuId:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"smu_code"
        })
    smuCode:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"smu_airline_number"
        })
    smuAirlineNumber:string | null;
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        name:"smu_date_time"
        })
    smuDateTime:Date;
        

    @Column("bigint",{ 
        nullable:true,
        name:"airline_id"
        })
    airlineId:string | null;
        

    @Column("bigint",{ 
        nullable:false,
        name:"representative_id"
        })
    representativeId:string;
        

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
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"flight_number"
        })
    flightNumber:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"note"
        })
    note:string | null;
        

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
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        default: () => "'2018-09-18 11:01:58'",
        name:"departure_time"
        })
    departureTime:Date;
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        default: () => "'2018-09-18 11:01:58'",
        name:"arrival_time"
        })
    arrivalTime:Date;
        

    @Column("integer",{ 
        nullable:false,
        default: () => "0",
        name:"total_item"
        })
    totalItem:number;
        

    @Column("numeric",{ 
        nullable:true,
        precision:10,
        scale:5,
        name:"total_weight"
        })
    totalWeight:string | null;
        

    @Column("date",{ 
        nullable:true,
        name:"smu_date"
        })
    smuDate:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"do_smu_id_delivery"
        })
    doSmuIdDelivery:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"do_smu_id_pickup"
        })
    doSmuIdPickup:string | null;
        
}
