import { EntityRepository, Repository } from 'typeorm';

import { EmployeeJourney } from '../orm-entity/employee-journey';

@EntityRepository(EmployeeJourney)
export class EmployeeJourneyRepository extends Repository<EmployeeJourney> {}
