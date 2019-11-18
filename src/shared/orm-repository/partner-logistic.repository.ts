import { EntityRepository, Repository } from 'typeorm';

import { PartnerLogistic } from '../orm-entity/partner-logistic';

@EntityRepository(PartnerLogistic)
export class PartnerLogisticRepository extends Repository<PartnerLogistic> {}
