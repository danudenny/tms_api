import { EntityRepository, Repository } from 'typeorm';

import { Bag } from '../orm-entity/bag';

@EntityRepository(Bag)
export class BagRepository extends Repository<Bag> {}
