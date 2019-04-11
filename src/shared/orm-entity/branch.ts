import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("branch",{schema:"public" } )
export class Branch {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"branch_id"
        })
    branchId:string;
        

    @Column("bigint",{ 
        nullable:true,
        name:"branch_id_parent"
        })
    branchIdParent:string | null;
        

    @Column("integer",{ 
        nullable:false,
        default: () => "0",
        name:"lft"
        })
    lft:number;
        

    @Column("integer",{ 
        nullable:false,
        default: () => "0",
        name:"rgt"
        })
    rgt:number;
        

    @Column("integer",{ 
        nullable:false,
        default: () => "1",
        name:"depth"
        })
    depth:number;
        

    @Column("integer",{ 
        nullable:false,
        default: () => "1",
        name:"priority"
        })
    priority:number;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"branch_code"
        })
    branchCode:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"branch_name"
        })
    branchName:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"address"
        })
    address:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"phone1"
        })
    phone1:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"phone2"
        })
    phone2:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"mobile1"
        })
    mobile1:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"mobile2"
        })
    mobile2:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"district_id"
        })
    districtId:string | null;
        

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
        

    @Column("boolean",{ 
        nullable:true,
        default: () => "false",
        name:"is_head_office"
        })
    isHeadOffice:boolean | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"representative_id"
        })
    representativeId:string | null;
        

    @Column("boolean",{ 
        nullable:true,
        default: () => "false",
        name:"is_delivery"
        })
    isDelivery:boolean | null;
        

    @Column("boolean",{ 
        nullable:true,
        default: () => "false",
        name:"is_pickup"
        })
    isPickup:boolean | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"latitude"
        })
    latitude:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"longitude"
        })
    longitude:string | null;
        

    @Column("jsonb",{ 
        nullable:true,
        name:"code_rds"
        })
    codeRds:Object | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"branch_type_id"
        })
    branchTypeId:string | null;
        
}
