import Axios from 'axios';
import { HttpRequestAxiosService } from './http-request-axios.service';

export class HttpRequestService extends HttpRequestAxiosService {
  constructor(baseURL: string) {
    super(Axios.create());
    this.axios.defaults.baseURL = baseURL;
  }
}
