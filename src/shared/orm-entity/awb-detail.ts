import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("awb_detail",{schema:"public" } )
export class AwbDetail {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"awb_detail_id"
        })
    awbDetailId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"awb_id"
        })
    awbId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"attachment_id"
        })
    attachmentId:string;
        

    @Column("numeric",{ 
        nullable:true,
        precision:10,
        scale:5,
        name:"width"
        })
    width:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        precision:10,
        scale:5,
        name:"length"
        })
    length:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        precision:10,
        scale:5,
        name:"height"
        })
    height:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        precision:10,
        scale:5,
        name:"volume"
        })
    volume:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        precision:10,
        scale:5,
        name:"divider_volume"
        })
    dividerVolume:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        precision:20,
        scale:5,
        name:"weight_volume"
        })
    weightVolume:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        precision:20,
        scale:5,
        name:"weight_volume_rounded"
        })
    weightVolumeRounded:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        precision:20,
        scale:5,
        name:"weight"
        })
    weight:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        precision:20,
        scale:5,
        name:"weight_rounded"
        })
    weightRounded:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        precision:20,
        scale:5,
        name:"weight_final"
        })
    weightFinal:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        precision:10,
        scale:5,
        name:"item_price"
        })
    itemPrice:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        precision:10,
        scale:5,
        name:"insurance"
        })
    insurance:string | null;
        

    @Column("bigint",{ 
        nullable:false,
        name:"users_id_created"
        })
    usersIdCreated:string;
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        name:"created_time"
        })
    createdTime:Date;
        

    @Column("bigint",{ 
        nullable:false,
        name:"users_id_updated"
        })
    usersIdUpdated:string;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"updated_time"
        })
    updatedTime:Date | null;
        

    @Column("boolean",{ 
        nullable:false,
        default: () => "false",
        name:"is_deleted"
        })
    isDeleted:boolean;
        

    @Column("bigint",{ 
        nullable:true,
        name:"bag_item_id_latest"
        })
    bagItemIdLatest:string | null;
        
}
