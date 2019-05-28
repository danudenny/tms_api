import { Injectable } from '@nestjs/common';
import { EntityRepository, Repository, DeepPartial } from 'typeorm';
import { AwbTrouble } from '../orm-entity/awb-trouble';

@Injectable()
@EntityRepository(AwbTrouble)
export class AwbTroubleRepository extends Repository<AwbTrouble> {

  async createTrouble(awbTrouble: DeepPartial<AwbTrouble>) {
    const data = this.create(awbTrouble);

    await this.save(data);
    return await this.save(data); // this.findByIds(data.awbTroubleId);
  }
}
