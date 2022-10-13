import {
  DeleteAwbsRequest,
  DeleteBaggingRequest,
  DeleteBagRepresentativeRequest,
  DeleteBagsRequest,
  DeleteDoSmdRequest,
} from '../models/sanity/sanity.request';
import {
  DeleteAwbsResponse,
  DeleteBaggingResponse,
  DeleteBagRepresentativeResponse,
  DeleteBagsResponse,
  DeleteDoSmdResponse,
} from '../models/sanity/sanity.response';

export const SANITY_SERVICE = 'SANITY_SERVICE';

export interface SanityService {
  deleteBags: (payload: DeleteBagsRequest) => Promise<DeleteBagsResponse>;
  deleteAwbs: (payload: DeleteAwbsRequest) => Promise<DeleteAwbsResponse>;
  deleteDoSmd: (payload: DeleteDoSmdRequest) => Promise<DeleteDoSmdResponse>;
  deleteBagging: (
    payload: DeleteBaggingRequest,
  ) => Promise<DeleteBaggingResponse>;
  deleteBagRepresentative: (
    payload: DeleteBagRepresentativeRequest,
  ) => Promise<DeleteBagRepresentativeResponse>;
}
