import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("customer_pickup",{schema:"public" } )
export class CustomerPickup {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"customer_pickup_id"
        })
    customerPickupId:string;
        

    @Column("bigint",{ 
        nullable:true,
        name:"customer_id"
        })
    customerId:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"district_id"
        })
    districtId:string | null;
        

    @Column("text",{ 
        nullable:false,
        name:"address"
        })
    address:string;
        

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
