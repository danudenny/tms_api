import { EntityRepository, Repository } from 'typeorm';

import { PodFilter } from '../orm-entity/pod-filter';

@EntityRepository(PodFilter)
export class PodFilterRepository extends Repository<PodFilter> {}
