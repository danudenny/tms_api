import { EntityRepository, Repository } from 'typeorm';

import { BagItem } from '../orm-entity/bag-item';

@EntityRepository(BagItem)
export class BagItemRepository extends Repository<BagItem> {}
