import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("bag_item",{schema:"public" } )
@Index("bag_item_bag_id_idx",["bagId",])
@Index("bag_item_bag_seq_idx",["bagSeq",])
@Index("bag_item_is_deleted_idx",["isDeleted",])
export class BagItem {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"bag_item_id"
        })
    bagItemId:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"bag_id"
        })
    bagId:string;
        

    @Column("numeric",{ 
        nullable:true,
        precision:10,
        scale:5,
        name:"weight"
        })
    weight:string | null;
        

    @Column("integer",{ 
        nullable:false,
        name:"bag_seq"
        })
    bagSeq:number;
        

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
        

    @Column("bigint",{ 
        nullable:true,
        name:"bag_item_history_id"
        })
    bagItemHistoryId:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"bagging_id_last"
        })
    baggingIdLast:string | null;
        
}
