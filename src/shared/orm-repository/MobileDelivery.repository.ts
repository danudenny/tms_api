import { EntityRepository, Repository } from 'typeorm';

import { AwbHistory } from '../orm-entity/awb-history';

@EntityRepository(AwbHistory)
export class awbRepository extends Repository<AwbHistory> {}
