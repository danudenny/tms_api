import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("awb_track",{schema:"public" } )
export class AwbTrack {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"awb_track_id"
        })
    awbTrackId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"awb_id"
        })
    awbId:string;
        

    @Column("json",{ 
        nullable:false,
        name:"track_json"
        })
    trackJson:Object;
        

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
