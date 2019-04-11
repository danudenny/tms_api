import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {PackagePrice} from "./package-price";
import {PackagePriceSpecial} from "./package-price-special";


@Entity("country",{schema:"public" } )
export class Country {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"country_id"
        })
    countryId:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"country_code"
        })
    countryCode:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"country_name"
        })
    countryName:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"user_id_created"
        })
    userIdCreated:string;
        

    @Column("character varying",{ 
        nullable:false,
        name:"created_time"
        })
    createdTime:string;
        

    @Column("bigint",{ 
        nullable:false,
        name:"user_id_updated"
        })
    userIdUpdated:string;
        

    @Column("character varying",{ 
        nullable:false,
        name:"updated_time"
        })
    updatedTime:string;
        

    @Column("boolean",{ 
        nullable:false,
        default: () => "false",
        name:"is_deleted"
        })
    isDeleted:boolean;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"country_phone_code"
        })
    countryPhoneCode:string | null;
        

   
    @OneToMany(type=>PackagePrice, package_price=>package_price.countryIdFrom)
    packagePrices:PackagePrice[];
    

   
    @OneToMany(type=>PackagePrice, package_price=>package_price.countryIdTo)
    packagePrices2:PackagePrice[];
    

   
    @OneToMany(type=>PackagePriceSpecial, package_price_special=>package_price_special.countryIdFrom)
    packagePriceSpecials:PackagePriceSpecial[];
    

   
    @OneToMany(type=>PackagePriceSpecial, package_price_special=>package_price_special.countryIdTo)
    packagePriceSpecials2:PackagePriceSpecial[];
    
}
