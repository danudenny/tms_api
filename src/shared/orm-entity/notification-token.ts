import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("notification_token",{schema:"public" } )
export class NotificationToken {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"notification_token_id"
        })
    notificationTokenId:string;
        

    @Column("bigint",{ 
        nullable:true,
        name:"user_id"
        })
    userId:string | null;
        

    @Column("character varying",{ 
        nullable:false,
        length:600,
        name:"token"
        })
    token:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"imei"
        })
    imei:string | null;
        

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
        name:"branch_id"
        })
    branchId:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"ip_address_v4"
        })
    ipAddressV4:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"ip_address_v6"
        })
    ipAddressV6:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"device_version"
        })
    deviceVersion:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"device_name"
        })
    deviceName:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"device_os"
        })
    deviceOs:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"mac_address_eth0"
        })
    macAddressEth0:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"mac_address_wlan0"
        })
    macAddressWlan0:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"apps_version"
        })
    appsVersion:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"apps_version_release"
        })
    appsVersionRelease:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"connectivity_status"
        })
    connectivityStatus:string | null;
        
}
