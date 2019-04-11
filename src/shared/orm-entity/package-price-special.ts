import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {PackageType} from "./package-type";
import {CustomerAccount} from "./customer-account";
import {Country} from "./country";
import {Province} from "./province";
import {City} from "./city";
import {District} from "./district";


@Entity("package_price_special",{schema:"public" } )
@Index("package_price_special_unique_key28",["cityIdFrom","customerAccount","districtIdTo","packageType",],{unique:true})
@Index("package_price_special_unique_key25",["cityIdFrom","countryIdTo","customerAccount","packageType",],{unique:true})
@Index("package_price_special_unique_key12",["cityIdFrom","districtIdTo","packageType",],{unique:true})
@Index("package_price_special_unique_key26",["cityIdFrom","customerAccount","packageType","provinceIdTo",],{unique:true})
@Index("package_price_special_unique_key11",["cityIdFrom","cityIdTo","packageType",],{unique:true})
@Index("package_price_special_unique_key27",["cityIdFrom","cityIdTo","customerAccount","packageType",],{unique:true})
@Index("package_price_special_unique_key9",["cityIdFrom","countryIdTo","packageType",],{unique:true})
@Index("package_price_special_unique_key10",["cityIdFrom","packageType","provinceIdTo",],{unique:true})
@Index("package_price_special_unique_key7",["cityIdTo","packageType","provinceIdFrom",],{unique:true})
@Index("package_price_special_unique_key15",["cityIdTo","districtIdFrom","packageType",],{unique:true})
@Index("package_price_special_unique_key19",["cityIdTo","countryIdFrom","customerAccount","packageType",],{unique:true})
@Index("package_price_special_unique_key23",["cityIdTo","customerAccount","packageType","provinceIdFrom",],{unique:true})
@Index("package_price_special_unique_key3",["cityIdTo","countryIdFrom","packageType",],{unique:true})
@Index("package_price_special_unique_key31",["cityIdTo","customerAccount","districtIdFrom","packageType",],{unique:true})
@Index("package_price_special_unique_key1",["countryIdFrom","countryIdTo","packageType",],{unique:true})
@Index("package_price_special_unique_key17",["countryIdFrom","countryIdTo","customerAccount","packageType",],{unique:true})
@Index("package_price_special_unique_key2",["countryIdFrom","packageType","provinceIdTo",],{unique:true})
@Index("package_price_special_unique_key18",["countryIdFrom","customerAccount","packageType","provinceIdTo",],{unique:true})
@Index("package_price_special_unique_key20",["countryIdFrom","customerAccount","districtIdTo","packageType",],{unique:true})
@Index("package_price_special_unique_key4",["countryIdFrom","districtIdTo","packageType",],{unique:true})
@Index("package_price_special_unique_key21",["countryIdTo","customerAccount","packageType","provinceIdFrom",],{unique:true})
@Index("package_price_special_unique_key13",["countryIdTo","districtIdFrom","packageType",],{unique:true})
@Index("package_price_special_unique_key29",["countryIdTo","customerAccount","districtIdFrom","packageType",],{unique:true})
@Index("package_price_special_unique_key5",["countryIdTo","packageType","provinceIdFrom",],{unique:true})
@Index("package_price_special_unique_key22",["customerAccount","packageType","provinceIdFrom","provinceIdTo",],{unique:true})
@Index("package_price_special_unique_key30",["customerAccount","districtIdFrom","packageType","provinceIdTo",],{unique:true})
@Index("package_price_special_unique_key24",["customerAccount","districtIdTo","packageType","provinceIdFrom",],{unique:true})
@Index("package_price_special_unique_key32",["customerAccount","districtIdFrom","districtIdTo","packageType",],{unique:true})
@Index("package_price_special_unique_key16",["districtIdFrom","districtIdTo","packageType",],{unique:true})
@Index("package_price_special_unique_key14",["districtIdFrom","packageType","provinceIdTo",],{unique:true})
@Index("package_price_special_unique_key8",["districtIdTo","packageType","provinceIdFrom",],{unique:true})
@Index("package_price_special_unique_key6",["packageType","provinceIdFrom","provinceIdTo",],{unique:true})
export class PackagePriceSpecial {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"package_price_special_id"
        })
    packagePriceSpecialId:string;
        

   
    @ManyToOne(type=>PackageType, package_type=>package_type.packagePriceSpecials,{  nullable:false, })
    @JoinColumn({ name:'package_type_id'})
    packageType:PackageType | null;


    @Column("boolean",{ 
        nullable:false,
        default: () => "false",
        name:"no_period"
        })
    noPeriod:boolean;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"start_date"
        })
    startDate:Date | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"end_date"
        })
    endDate:Date | null;
        

   
    @ManyToOne(type=>CustomerAccount, customer_account=>customer_account.packagePriceSpecials,{  })
    @JoinColumn({ name:'customer_account_id'})
    customerAccount:CustomerAccount | null;


    @Column("bigint",{ 
        nullable:true,
        name:"branch_id_from"
        })
    branchIdFrom:string | null;
        

   
    @ManyToOne(type=>Country, country=>country.packagePriceSpecials,{  })
    @JoinColumn({ name:'country_id_from'})
    countryIdFrom:Country | null;


   
    @ManyToOne(type=>Province, province=>province.packagePriceSpecials,{  })
    @JoinColumn({ name:'province_id_from'})
    provinceIdFrom:Province | null;


   
    @ManyToOne(type=>City, city=>city.packagePriceSpecials,{  })
    @JoinColumn({ name:'city_id_from'})
    cityIdFrom:City | null;


   
    @ManyToOne(type=>District, district=>district.packagePriceSpecials,{  })
    @JoinColumn({ name:'district_id_from'})
    districtIdFrom:District | null;


    @Column("bigint",{ 
        nullable:true,
        name:"branch_id_to"
        })
    branchIdTo:string | null;
        

   
    @ManyToOne(type=>Country, country=>country.packagePriceSpecials2,{  })
    @JoinColumn({ name:'country_id_to'})
    countryIdTo:Country | null;


   
    @ManyToOne(type=>Province, province=>province.packagePriceSpecials2,{  })
    @JoinColumn({ name:'province_id_to'})
    provinceIdTo:Province | null;


   
    @ManyToOne(type=>City, city=>city.packagePriceSpecials2,{  })
    @JoinColumn({ name:'city_id_to'})
    cityIdTo:City | null;


   
    @ManyToOne(type=>District, district=>district.packagePriceSpecials2,{  })
    @JoinColumn({ name:'district_id_to'})
    districtIdTo:District | null;


    @Column("integer",{ 
        nullable:false,
        default: () => "1",
        name:"priority"
        })
    priority:number;
        

    @Column("numeric",{ 
        nullable:true,
        precision:10,
        scale:5,
        name:"min_weight"
        })
    minWeight:string | null;
        

    @Column("numeric",{ 
        nullable:false,
        precision:20,
        scale:5,
        name:"basic_fare"
        })
    basicFare:string;
        

    @Column("numeric",{ 
        nullable:false,
        precision:20,
        scale:5,
        name:"next_price"
        })
    nextPrice:string;
        

    @Column("numeric",{ 
        nullable:false,
        precision:10,
        scale:5,
        name:"disc_price_percent"
        })
    discPricePercent:string;
        

    @Column("numeric",{ 
        nullable:false,
        precision:10,
        scale:5,
        name:"disc_price_value"
        })
    discPriceValue:string;
        

    @Column("numeric",{ 
        nullable:true,
        precision:10,
        scale:5,
        name:"divider_volume"
        })
    dividerVolume:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        precision:10,
        scale:5,
        name:"lead_time_min_days"
        })
    leadTimeMinDays:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        precision:10,
        scale:5,
        name:"lead_time_max_days"
        })
    leadTimeMaxDays:string | null;
        

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
        

    @Column("integer",{ 
        nullable:true,
        name:"from_type"
        })
    fromType:number | null;
        

    @Column("integer",{ 
        nullable:true,
        name:"to_type"
        })
    toType:number | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"from_id"
        })
    fromId:string | null;
        

    @Column("bigint",{ 
        nullable:true,
        name:"to_id"
        })
    toId:string | null;
        
}
