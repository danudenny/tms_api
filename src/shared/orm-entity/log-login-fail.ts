import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("log_login_fail",{schema:"public" } )
export class LogLoginFail {

    @PrimaryGeneratedColumn({
        type:"bigint", 
        name:"log_login_fail_id"
        })
    logLoginFailId:string;
        

    @Column("character varying",{ 
        nullable:false,
        length:255,
        name:"username"
        })
    username:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"password"
        })
    password:string | null;
        

    @Column("character varying",{ 
        nullable:false,
        length:500,
        name:"session_id"
        })
    sessionId:string;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"error_message"
        })
    errorMessage:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"remote_addr"
        })
    remoteAddr:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:500,
        name:"user_agent"
        })
    userAgent:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"platform_version"
        })
    platformVersion:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"platform"
        })
    platform:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"browser_version"
        })
    browserVersion:string | null;
        

    @Column("character varying",{ 
        nullable:true,
        length:255,
        name:"browser"
        })
    browser:string | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"login_date"
        })
    loginDate:Date | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"login_fail_date"
        })
    loginFailDate:Date | null;
        

    @Column("boolean",{ 
        nullable:false,
        default: () => "false",
        name:"is_deleted"
        })
    isDeleted:boolean;
        
}
