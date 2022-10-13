import { DeleteBaggingRequest, DeleteBagRepresentativeRequest, DeleteBagRequest, DeleteDoSmdRequest } from '../models/sanity/sanity.request';
import { DeleteBaggingResponse, DeleteBagRepresentativeResponse, DeleteBagResponse, DeleteDoSmdResponse } from '../models/sanity/sanity.response';

export const SANITY_SERVICE = 'SANITY_SERVICE';

export interface SanityService {
  deleteBag: (payload: DeleteBagRequest) => Promise<DeleteBagResponse>;
  deleteDoSmd: (payload: DeleteDoSmdRequest ) => Promise<DeleteDoSmdResponse>;
  deleteBagging: (payload: DeleteBaggingRequest ) => Promise<DeleteBaggingResponse>;
  deleteBagRepresentative: (payload: DeleteBagRepresentativeRequest ) => Promise<DeleteBagRepresentativeResponse>;
}
