import { EntityRepository, Repository } from 'typeorm';

import { Reason } from '../orm-entity/reason';

@EntityRepository(Reason)
export class ReasonRepository extends Repository<Reason> {}
