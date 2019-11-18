import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseValidateEntity } from './base-validate';

export abstract class BaseTimestampEntity extends BaseValidateEntity {
  @CreateDateColumn({ type: 'timestamp with time zone'})
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone'})
  public updatedAt: Date;
}
