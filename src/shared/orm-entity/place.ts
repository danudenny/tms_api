import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {PlaceType} from "./place-type";
import {District} from "./district";


@Entity("place",{schema:"public" } )
export class Place {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"place_id"
        })
    placeId:string;
        

   
    @ManyToOne(type=>PlaceType, place_type=>place_type.places,{  })
    @JoinColumn({ name:'place_type_id'})
    placeType:PlaceType | null;


   
    @ManyToOne(type=>District, district=>district.places,{  nullable:false, })
    @JoinColumn({ name:'district_id'})
    district:District | null;


    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"place_code"
        })
    placeCode:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"place_name"
        })
    placeName:string;
        

    @Column("text",{ 
        nullable:true,
        name:"address"
        })
    address:string | null;
        

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
