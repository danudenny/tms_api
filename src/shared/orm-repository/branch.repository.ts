import { EntityRepository, Repository } from 'typeorm';

import { Branch } from '../orm-entity/branch';

@EntityRepository(Branch)
export class BranchRepository extends Repository<Branch> {}
