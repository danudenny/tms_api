import { EntityRepository, Repository } from 'typeorm';

import { PodFilterDetailItem } from '../orm-entity/pod-filter-detail-item';

@EntityRepository(PodFilterDetailItem)
export class PodFilterDetailItemRepository extends Repository<PodFilterDetailItem> {}
