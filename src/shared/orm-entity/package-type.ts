import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {PackagePrice} from "./package-price";
import {PackagePriceSpecial} from "./package-price-special";


@Entity("package_type",{schema:"public" } )
export class PackageType {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"package_type_id"
        })
    packageTypeId:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"package_type_code"
        })
    packageTypeCode:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"package_type_name"
        })
    packageTypeName:string;
        

    @Column("numeric",{ 
        nullable:false,
        precision:10,
        scale:5,
        name:"min_weight"
        })
    minWeight:string;
        

    @Column("numeric",{ 
        nullable:false,
        precision:10,
        scale:5,
        name:"weight_rounding_const"
        })
    weightRoundingConst:string;
        

    @Column("numeric",{ 
        nullable:false,
        precision:10,
        scale:5,
        name:"weight_rounding_up_global"
        })
    weightRoundingUpGlobal:string;
        

    @Column("numeric",{ 
        nullable:false,
        precision:10,
        scale:5,
        name:"weight_rounding_up_detail"
        })
    weightRoundingUpDetail:string;
        

    @Column("numeric",{ 
        nullable:false,
        precision:10,
        scale:5,
        name:"divider_volume"
        })
    dividerVolume:string;
        

    @Column("numeric",{ 
        nullable:false,
        precision:10,
        scale:5,
        name:"lead_time_min_days"
        })
    leadTimeMinDays:string;
        

    @Column("numeric",{ 
        nullable:false,
        precision:10,
        scale:5,
        name:"lead_time_max_days"
        })
    leadTimeMaxDays:string;
        

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
        nullable:true,
        default: () => "false",
        name:"weight_rounding_up_global_bool"
        })
    weightRoundingUpGlobalBool:boolean | null;
        

    @Column("boolean",{ 
        nullable:true,
        default: () => "false",
        name:"weight_rounding_up_detail_bool"
        })
    weightRoundingUpDetailBool:boolean | null;
        

   
    @OneToMany(type=>PackagePrice, package_price=>package_price.packageType)
    packagePrices:PackagePrice[];
    

   
    @OneToMany(type=>PackagePriceSpecial, package_price_special=>package_price_special.packageType)
    packagePriceSpecials:PackagePriceSpecial[];
    
}
