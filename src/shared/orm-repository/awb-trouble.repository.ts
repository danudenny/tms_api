import { EntityRepository, Repository } from 'typeorm';

import { AwbTrouble } from '../orm-entity/awb-trouble';

@EntityRepository(AwbTrouble)
export class AwbTroubleRepository extends Repository<AwbTrouble> {}
