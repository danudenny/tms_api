import { EntityRepository, Repository } from 'typeorm';

import { District } from '../orm-entity/district';

@EntityRepository(District)
export class DistrictRepository extends Repository<District> {}
