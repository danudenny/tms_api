import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { DoAwbDetail } from './do-awb-detail';

@Entity('do_awb', { schema: 'public' })
// NOTED: Belom ada di DB tabelnya
export class DoAwb extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_awb_id',
  })
  doAwbId: number;

  @Column('bigint', {
    nullable: false,
    name: 'do_awb_id_parent',
  })
  doAwbIdParent: number;

  @Column('bigint', {
    nullable: false,
    name: 'do_awb_type',
  })
  awbAwbId: number | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'do_awb_code',
  })
  doAwbCode: string | null;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'do_awb_time',
  })
  doAwbTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id',
  })
  userId: number;

  @Column('bigint', {
    nullable: false,
    name: 'branch_id',
  })
  branchId: number;

  @Column('bigint', {
    nullable: true,
    name: 'employee_id_driver',
  })
  employeeIdDriver: number | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'vehicle_number',
  })
  vehicleNumber: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'vehicle_branch_scan',
  })
  vehicleBranchScan: string | null;

  @Column('character varying', {
    nullable: true,
    length: 100,
    name: 'vehicle_city_label',
  })
  vehicleCityLabel: string | null;

  @Column('character varying', {
    nullable: false,
    length: 500,
    name: 'scan_vehicle',
  })
  scanVehicle: string;

  @Column('character varying', {
    nullable: false,
    length: 500,
    name: 'scan_driver',
  })
  scanDriver: string;

  @Column('integer', {
    nullable: false,
    default: () => '0',
    name: 'total_item',
  })
  totalItem: number;

  @Column('numeric', {
    nullable: false,
    default: () => '0',
    precision: 20,
    scale: 5,
    name: 'total_weight',
  })
  totalWeight: number;

  @Column('bigint', {
    nullable: true,
    name: 'do_bag_history_id',
  })
  doBagHistoryId: number | null;

  @OneToOne(() => DoAwbDetail)
  @JoinColumn({ name: 'do_awb_id' })
  doAwbDetail: DoAwbDetail;
}
