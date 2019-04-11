import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("do_smu",{schema:"public" } )
export class DoSmu {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"do_smu_id"
        })
    doSmuId:string;
        

    @Column("bigint",{ 
        nullable:true,
        name:"do_smu_id_parent"
        })
    doSmuIdParent:string | null;
        

    @Column("integer",{ 
        nullable:false,
        default: () => "10",
        name:"do_smu_type"
        })
    doSmuType:number;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"do_smu_code"
        })
    doSmuCode:string | null;
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        name:"do_smu_time"
        })
    doSmuTime:Date;
        

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
        nullable:false,
        name:"employee_id_driver"
        })
    employeeIdDriver:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"vehicle_number"
        })
    vehicleNumber:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"vehicle_city_label"
        })
    vehicleCityLabel:string | null;
        

    @Column("character varying",{ 
        nullable:false,
        length:500,
        name:"scan_vehicle"
        })
    scanVehicle:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:500,
        name:"scan_driver"
        })
    scanDriver:string;
        

    @Column("bigint",{ 
        nullable:true,
        name:"attachment_tms_id_airport_receipt"
        })
    attachmentTmsIdAirportReceipt:string | null;
        

    @Column("numeric",{ 
        nullable:false,
        default: () => "0",
        precision:10,
        scale:5,
        name:"airport_receipt_amount"
        })
    airportReceiptAmount:string;
        

    @Column("bigint",{ 
        nullable:true,
        name:"do_smu_history_id"
        })
    doSmuHistoryId:string | null;
        

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
        

    @Column("character varying",{ 
        nullable:false,
        length:500,
        name:"vehicle_branch_scan"
        })
    vehicleBranchScan:string;
        
}
