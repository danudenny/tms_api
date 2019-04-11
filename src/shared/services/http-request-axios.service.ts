import Axios, { AxiosInstance, AxiosPromise, AxiosRequestConfig, CancelTokenStatic } from 'axios';
import { Observable } from 'rxjs';

export class HttpRequestAxiosService {
  private cancelToken: CancelTokenStatic = Axios.CancelToken;

  constructor(public axios: AxiosInstance) {}

  public post<T>(
    url: string = '',
    data?: any,
    config: AxiosRequestConfig = {},
  ): Observable<T> {
    return Observable.create((observer) => {
      const axiosCancel = this.cancelToken.source();
      config.cancelToken = axiosCancel.token;

      (this.axios.post(url, data, config) as AxiosPromise)
        .catch((error) => observer.error(error))
        .then((response) => {
          observer.next(response && response.data);
          observer.complete();
        });

      return () => {
        axiosCancel.cancel();
      };
    });
  }

  public put<T>(
    url: string = '',
    data?: any,
    config: AxiosRequestConfig = {},
  ): Observable<T> {
    return Observable.create((observer) => {
      const axiosCancel = this.cancelToken.source();
      config.cancelToken = axiosCancel.token;

      (this.axios.put(url, data, config) as AxiosPromise)
        .catch((error) => observer.error(error))
        .then((response) => {
          observer.next(response && response.data);
          observer.complete();
        });

      return () => {
        axiosCancel.cancel();
      };
    });
  }

  public get<T>(
    url: string = '',
    config: AxiosRequestConfig = {},
  ): Observable<T> {
    return Observable.create((observer) => {
      const axiosCancel = this.cancelToken.source();
      config.cancelToken = axiosCancel.token;

      (this.axios.get(url, config) as AxiosPromise)
        .catch((error) => observer.error(error))
        .then((response) => {
          observer.next(response && response.data);
          observer.complete();
        });

      return () => {
        axiosCancel.cancel();
      };
    });
  }

  public delete<T>(
    url: string = '',
    config: AxiosRequestConfig = {},
  ): Observable<T> {
    return Observable.create((observer) => {
      const axiosCancel = this.cancelToken.source();
      config.cancelToken = axiosCancel.token;

      (this.axios.delete(url, config) as AxiosPromise)
        .catch((error) => observer.error(error))
        .then((response) => {
          observer.next(response && response.data);
          observer.complete();
        });

      return () => {
        axiosCancel.cancel();
      };
    });
  }
}
