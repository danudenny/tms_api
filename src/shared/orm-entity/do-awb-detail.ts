import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('do_awb_detail', { schema: 'public' })
// NOTED: Belom ada di DB tabelnya
export class DoAwbDetail extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'do_awb_detail_id',
  })
  doAwbDetailId: number;

  @Column('bigint', {
    nullable: false,
    name: 'do_awb_id',
  })
  doAwbId: number;

  @Column('bigint', {
    nullable: false,
    name: 'awb_item_id',
  })
  awbItemId: number;
}
