import { EntityRepository, Repository } from 'typeorm';

import { employeeJourney } from '../orm-entity/employee-journey';

@EntityRepository(employeeJourney)
export class EmployeeJourneyRepository extends Repository<employeeJourney> {}
