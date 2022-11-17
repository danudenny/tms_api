import {
  DeleteAwbsRequest,
  DeleteBaggingRequest,
  DeleteBagRepresentativeRequest,
  DeleteBagsRequest,
  DeleteDoSmdRequest,
  DeleteDoSortationsRequest,
} from '../models/sanity/sanity.request';
import {
  DeleteAwbsResponse,
  DeleteBaggingResponse,
  DeleteBagRepresentativeResponse,
  DeleteBagsResponse,
  DeleteDoSmdResponse,
  DeleteDoSortationsResponse,
} from '../models/sanity/sanity.response';

export const SANITY_SERVICE = 'SANITY_SERVICE';

export interface SanityService {
  deleteBags: (payload: DeleteBagsRequest) => Promise<DeleteBagsResponse>;
  deleteAwbs: (payload: DeleteAwbsRequest) => Promise<DeleteAwbsResponse>;
  deleteDoSortations: (
    payload: DeleteDoSortationsRequest,
  ) => Promise<DeleteDoSortationsResponse>;
  deleteDoSmd: (payload: DeleteDoSmdRequest) => Promise<DeleteDoSmdResponse>;
  deleteBagging: (
    payload: DeleteBaggingRequest,
  ) => Promise<DeleteBaggingResponse>;
  deleteBagRepresentative: (
    payload: DeleteBagRepresentativeRequest,
  ) => Promise<DeleteBagRepresentativeResponse>;
}
