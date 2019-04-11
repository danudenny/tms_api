import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("employee_source",{schema:"public" } )
export class EmployeeSource {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"employee_source_id"
        })
    employeeSourceId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"employee_id"
        })
    employeeId:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"source"
        })
    source:string;
        

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
