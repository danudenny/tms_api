import { EntityRepository, Repository } from 'typeorm';

import { Complaint } from '../orm-entity/complaint';

@EntityRepository(Complaint)
export class ComplaintRepository extends Repository<Complaint> {}
