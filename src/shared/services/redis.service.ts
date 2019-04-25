import * as redis from 'redis';
import { ConfigService } from './config.service';

export class RedisService {

  // init connect to redis
  public static client = redis.createClient(ConfigService.get('redis'));

  public static get(key: string) {
    return this.client.get(key);
  }

  public static set(key: string, value: any) {
    return this.client.set(key, value);
  }
}
