import { DeleteBagsRequest } from '../models/sanity/sanity.request';
import { DeleteBagsResponse } from '../models/sanity/sanity.response';

export const SANITY_SERVICE = 'SANITY_SERVICE';

export interface SanityService {
  deleteBags: (payload: DeleteBagsRequest) => Promise<DeleteBagsResponse>;
}
