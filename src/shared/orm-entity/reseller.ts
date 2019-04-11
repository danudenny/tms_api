import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("reseller",{schema:"public" } )
export class Reseller {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"reseller_id"
        })
    resellerId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"branch_id"
        })
    branchId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"district_id"
        })
    districtId:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"reseller_code"
        })
    resellerCode:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"reseller_name"
        })
    resellerName:string;
        

    @Column("text",{ 
        nullable:false,
        name:"address"
        })
    address:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:20,
        name:"phone1"
        })
    phone1:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:20,
        name:"phone2"
        })
    phone2:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:20,
        name:"mobile1"
        })
    mobile1:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:20,
        name:"mobile2"
        })
    mobile2:string | null;
        

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
