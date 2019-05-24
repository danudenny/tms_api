import { EntityRepository, Repository } from 'typeorm';

import { podScan } from '../orm-entity/pod-scan';

@EntityRepository(podScan)
export class PodScanRepository extends Repository<podScan> {}
