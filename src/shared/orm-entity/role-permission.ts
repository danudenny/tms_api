import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("role_permission",{schema:"public" } )
export class RolePermission {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"role_permission_id"
        })
    rolePermissionId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"role_id"
        })
    roleId:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"nav"
        })
    nav:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"name"
        })
    name:string | null;
        

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
