import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("lph",{schema:"public" } )
@Index("lph_awb_date_idx",["awbDate",])
export class Lph {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"lph_id"
        })
    lphId:string;
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        name:"awb_date"
        })
    awbDate:Date;
        

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
        

    @Column("boolean",{ 
        nullable:false,
        default: () => "false",
        name:"is_jne"
        })
    isJne:boolean;
        
}
