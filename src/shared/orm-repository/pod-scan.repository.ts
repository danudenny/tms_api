import { EntityRepository, Repository } from 'typeorm';

import { PodScan } from '../orm-entity/pod-scan';

@EntityRepository(PodScan)
export class PodScanRepository extends Repository<PodScan> {}
