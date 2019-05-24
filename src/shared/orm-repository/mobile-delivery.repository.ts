import { EntityRepository, Repository } from 'typeorm';

import { Awb } from '../orm-entity/awb';

@EntityRepository(Awb)
export class AwbRepository extends Repository<Awb> {}
