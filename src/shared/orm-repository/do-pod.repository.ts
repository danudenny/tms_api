import { EntityRepository, Repository } from 'typeorm';

import { DoPod } from '../orm-entity/do-pod';

@EntityRepository(DoPod)
export class DoPodRepository extends Repository<DoPod> {}
