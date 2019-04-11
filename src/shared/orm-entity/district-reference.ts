import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("district_reference",{schema:"public" } )
export class DistrictReference {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"district_reference_id"
        })
    districtReferenceId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"district_id"
        })
    districtId:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"ref_owner"
        })
    refOwner:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"ref_code"
        })
    refCode:string;
        

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
