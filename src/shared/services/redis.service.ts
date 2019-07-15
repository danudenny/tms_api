import { createClient } from 'redis';
import { ConfigService } from './config.service';
import { sleep } from 'sleep-ts';

export class RedisService {

  // init connect to redis
  public static client = createClient(ConfigService.get('redis'));

  public static set(key: string, value: any, serialize: boolean = false) {
    return new Promise((resolve, reject) => {
      let targetValue = value;

      if (serialize) {
        try {
          targetValue = JSON.stringify(value, null, 2);
        } catch (err) {
          reject(err);
        }
      }

      this.client.set(key, targetValue, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  public static get<T = any>(key: string, deserialize: boolean = false): Promise<T> {
    return new Promise((resolve, reject) => {
      return this.client.get(key, (err, value) => {
        if (err) {
          reject(err);
        } else {
          let targetValue = value;
          if (deserialize) {
            targetValue = JSON.parse(targetValue);
          }

          resolve(targetValue as any as T);
        }
      });
    });
  }

  public static expire(key: string, seconds: number) {
    return new Promise((resolve, reject) => {
      this.client.expire(key, seconds, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  public static expireat(key: string, unixTime: number) {
    return new Promise((resolve, reject) => {
      this.client.expireat(key, unixTime, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  public static setex(key: string, value: string, seconds: number = 10) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, seconds, value, (err, val) => {
        if (err) {
          reject(err);
        } else {
          resolve(val);
        }
      });
    });
  }

  public static setnx(key: string, value: string) {
    return new Promise((resolve, reject) => {
      this.client.setnx(key, value, (err, val) => {
        if (err) {
          reject(err);
        } else {
          resolve(val);
        }
      });
    });
  }

  public static del(key: string) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, val) => {
        if (err) {
          reject(err);
        } else {
          resolve(val);
        }
      });
    });
  }

  public static ttl(key: string) {

    return new Promise((resolve, reject) => {
      this.client.ttl(key, (err, val) => {
        if (err) {
          reject(err);
        } else {
          resolve(val);
        }
      });
    });
  }

  public static async locking(key: string, value: string) {
    let countRetry = 1;
    let locking = {};
    do {
      locking = await this.setnx(key, value);
      if (!!locking || countRetry === 3) {
        // set default expire key on redis
        await this.expire(key, 5);
        break;
      }
      await sleep(500); // delay 0.5 seconds
      countRetry += 1;
    } while (countRetry < 4);

    return !!locking;
  }
}
