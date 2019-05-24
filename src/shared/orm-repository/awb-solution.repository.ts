import { EntityRepository, Repository } from 'typeorm';

import {AwbSolution } from '../orm-entity/awb-solution';

@EntityRepository(AwbSolution)
export class AwbSolutionRepository extends Repository<AwbSolution> {}
