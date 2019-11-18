import { EntityRepository, Repository } from 'typeorm';

import { Representative } from '../orm-entity/representative';

@EntityRepository(Representative)
export class RepresentativeRepository extends Repository<Representative> {}
