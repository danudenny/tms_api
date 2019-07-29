import { EntityRepository, Repository } from 'typeorm';

import { PodFilterDetail } from '../orm-entity/pod-filter-detail';

@EntityRepository(PodFilterDetail)
export class PodFilterDetailRepository extends Repository<PodFilterDetail> {}
