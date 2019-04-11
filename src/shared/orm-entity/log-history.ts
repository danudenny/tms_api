import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("log_history",{schema:"public" } )
export class LogHistory {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"log_history_id"
        })
    logHistoryId:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"table_name"
        })
    tableName:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"reference_id"
        })
    referenceId:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"field_name"
        })
    fieldName:string;
        

    @Column("text",{ 
        nullable:true,
        name:"value_before"
        })
    valueBefore:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"value_after"
        })
    valueAfter:string | null;
        

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
