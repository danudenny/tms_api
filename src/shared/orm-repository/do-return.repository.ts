import { EntityRepository, Repository } from 'typeorm';
import { DoReturnAwb } from '../orm-entity/do_return_awb';

@EntityRepository(DoReturnAwb)
export class DoReturnAwbRepository extends Repository<DoReturnAwb> {}
