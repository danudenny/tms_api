import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('employee_journey', { schema: 'public' })
export class employeeJourney extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'employee_journey_id',
  })
  employeeJourneyId: string;

  @Column('bigint', {
    nullable: false,
    name: 'employee_id',
  })
  employeeId: number;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'check_in_date',
  })
  checkInDate: Date | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'check_out_date',
  })
  checkOutDate: Date | null;

  @Column('character varying', {
    nullable: false,
    name: 'longitude_check_in',
  })
  longitudeCheckIn: string;

  @Column('character varying', {
    nullable: false,
    name: 'latitude_check_in',
  })
  latitudeCheckIn: string;

  @Column('character varying', {
    nullable: false,
    name: 'longitude_check_out',
  })
  longitudeCheckOut: string | null;

  @Column('character varying', {
    nullable: false,
    name: 'latitude_check_out',
  })
  latitudeCheckOut: string | null;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;
}
