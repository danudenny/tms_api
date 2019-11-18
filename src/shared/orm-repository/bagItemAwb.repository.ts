import { EntityRepository, Repository } from 'typeorm';

import { BagItemAwb } from '../orm-entity/bag-item-awb';

@EntityRepository(BagItemAwb)
export class BagItemAwbRepository extends Repository<BagItemAwb> {}
