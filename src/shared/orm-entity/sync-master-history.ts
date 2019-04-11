import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("sync_master_history",{schema:"public" } )
export class SyncMasterHistory {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"sync_master_history_id"
        })
    syncMasterHistoryId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"sync_master_id"
        })
    syncMasterId:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"module"
        })
    module:string;
        

    @Column("integer",{ 
        nullable:false,
        name:"page"
        })
    page:number;
        

    @Column("integer",{ 
        nullable:false,
        name:"try_seq"
        })
    trySeq:number;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"sync_url"
        })
    syncUrl:string;
        

    @Column("integer",{ 
        nullable:false,
        name:"sync_status"
        })
    syncStatus:number;
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        name:"request_datetime"
        })
    requestDatetime:Date;
        

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
