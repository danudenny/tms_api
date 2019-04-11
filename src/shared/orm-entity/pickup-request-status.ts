import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("pickup_request_status",{schema:"public" } )
export class PickupRequestStatus {

    @Column("bigint",{ 
        nullable:false,
        primary:true,
        name:"pickup_request_status_id"
        })
    pickupRequestStatusId:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:100,
        name:"status_code"
        })
    statusCode:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:100,
        name:"status_title"
        })
    statusTitle:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:100,
        name:"status_name"
        })
    statusName:string | null;
        

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
