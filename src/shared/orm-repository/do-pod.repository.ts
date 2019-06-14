import { EntityRepository, Repository } from 'typeorm';

import { DoPod } from '../orm-entity/do-pod';

@EntityRepository(DoPod)
export class DoPodRepository extends Repository<DoPod> {
  // Tipe Surat Jalan Criss Cross
  createTypeCrissCross(payload: any) {
    return null;
  }
  // Tipe Surat Jalan Transit Internal
  createTypeTransitInternal(payload: any) {
    return null;
  }

  // Tipe Surat Jalan Transit 3PL (partner logistic)
  createTypeTransit3PL(payload: any) {
    return null;
  }

  // Tipe Surat Jalan Retur
  createTypeRetur(payload: any) {
    return null;
  }

  // Tipe Surat Jalan Antar
  createTypeDelivery(payload: any) {
    return null;
  }
}
