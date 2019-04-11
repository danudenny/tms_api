import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("do_smu_history",{schema:"public" } )
export class DoSmuHistory {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"do_smu_history_id"
        })
    doSmuHistoryId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"do_smu_id"
        })
    doSmuId:string;
        

    @Column("bigint",{ 
        nullable:true,
        name:"do_smu_detail_id"
        })
    doSmuDetailId:string | null;
        

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
        nullable:true,
        name:"employee_id_driver"
        })
    employeeIdDriver:string | null;
        

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
        

    @Column("integer",{ 
        nullable:false,
        default: () => "1000",
        name:"do_smu_status_id"
        })
    doSmuStatusId:number;
        

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
