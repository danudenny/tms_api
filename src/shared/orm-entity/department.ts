import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("department",{schema:"public" } )
export class Department {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"department_id"
        })
    departmentId:string;
        

    @Column("bigint",{ 
        nullable:true,
        name:"department_id_parent"
        })
    departmentIdParent:string | null;
        

    @Column("integer",{ 
        nullable:false,
        name:"lft"
        })
    lft:number;
        

    @Column("integer",{ 
        nullable:false,
        name:"rgt"
        })
    rgt:number;
        

    @Column("integer",{ 
        nullable:false,
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
        name:"department_code"
        })
    departmentCode:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"department_name"
        })
    departmentName:string;
        

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
