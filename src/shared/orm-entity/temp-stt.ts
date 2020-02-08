import { Column, Entity, Index, PrimaryGeneratedColumn, OneToMany, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { TmsBaseEntity } from './tms-base';
import { integer } from 'aws-sdk/clients/cloudfront';

@Entity('temp_stt', { schema: 'public' })
export class TempStt extends TmsBaseEntity {
  @PrimaryColumn('character varying', {
    nullable: false,
    length: 50,
    name: 'nostt',
  })
  nostt: string;

  @Column('integer', {
    nullable: false,
    name: 'gerai',
  })
  gerai: number;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'asal',
  })
  asal: string;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'tujuan',
  })
  tujuan: string;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'codilai',
  })
  codnilai: number;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'codbiaya',
  })
  codbiaya: number;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'packingbiaya',
  })
  packingbiaya: number;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'asuransinilai',
  })
  asuransinilai: number;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'asuransibiaya',
  })
  asuransibiaya: number;

  @Column('integer', {
    nullable: true,
    name: 'koli',
  })
  koli: number;

  @Column('integer', {
    nullable: true,
    name: 'berat',
  })
  berat: number;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'biaya',
  })
  biaya: number;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'totalbiaya',
  })
  totalbiaya: number;

  @Column('timestamp', {
    nullable: true,
    name: 'tglinput',
  })
  tglinput: Date | null;

  @Column('timestamp', {
    nullable: true,
    name: 'tgltransaksi',
  })
  tgltransaksi: Date | null;

  @Column('character varying', {
    nullable: true,
    length: 200,
    name: 'keterangan',
  })
  keterangan: string;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'asuransiadm',
  })
  asuransiadm: number;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'harga',
  })
  harga: number;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'username',
  })
  username: string;

  @Column('integer', {
    nullable: true,
    name: 'hub',
  })
  hub: number;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'nohppenerima',
  })
  nohppenerima: string;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'pengirim',
  })
  pengirim: string;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'penerima',
  })
  penerima: string;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'beratasli',
  })
  beratasli: number;

  @Column('timestamp', {
    nullable: true,
    name: 'tglfoto',
  })
  tglfoto: Date | null;

  @Column('character varying', {
    nullable: true,
    length: 3,
    name: 'perwakilan',
  })
  perwakilan: string;

  @Column('character varying', {
    nullable: true,
    length: 1,
    name: 'zonatujuan',
  })
  zonatujuan: string;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'reseller',
  })
  reseller: string;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'nohpreseller',
  })
  nohpreseller: string;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'resijne',
  })
  resijne: string;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'nokonfirmasi',
  })
  nokonfirmasi: string;

  @Column('integer', {
    nullable: true,
    name: 'hubkirim',
  })
  hubkirim: number;

  @Column('integer', {
    nullable: true,
    name: 'diskon',
  })
  diskon: number;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'layanan',
  })
  layanan: string;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'tglpending',
  })
  tglpending: string;

  @Column('timestamp', {
    nullable: true,
    name: 'tglmanifested',
  })
  tglmanifested: Date | null;

  @Column('numeric', {
    nullable: true,
    precision: 20,
    scale: 5,
    name: 'beratvolume',
  })
  beratvolume: number;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'ketvolume',
  })
  ketvolume: string;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'grouppod',
  })
  grouppod: string;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'groupanalisa',
  })
  groupanalisa: string;

  @Column('character varying', {
    nullable: true,
    length: 50,
    name: 'grouptujuan',
  })
  grouptujuan: string;

  @Column('timestamp', {
    nullable: true,
    name: 'eta1',
  })
  eta1: Date | null;

  @Column('timestamp', {
    nullable: true,
    name: 'eta2',
  })
  eta2: Date | null;

  @Column('timestamp', {
    nullable: true,
    name: 'lastupdatedatetimeutc',
  })
  lastupdatedatetimeutc: Date | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_void: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_sync_tms: boolean;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
  })
  dokembali: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_sync_odoo: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
  })
  is_sync_mysql: boolean;

}
