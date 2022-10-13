import { DeleteBagRequest } from '../models/sanity/sanity.request';
import { DeleteBagResponse } from '../models/sanity/sanity.response';

export const SANITY_SERVICE = 'SANITY_SERVICE';

export interface SanityService {
  deleteBag: (payload: DeleteBagRequest) => Promise<DeleteBagResponse>;
}
