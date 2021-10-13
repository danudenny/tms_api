import { createClient } from 'redis';
import { ConfigService } from './config.service';
import { sleep } from 'sleep-ts';
import { RequestErrorService } from './request-error.service';

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

  public static setex(key: string, value: any, seconds: number = 10, serialize: boolean = false) {
    return new Promise((resolve, reject) => {
      let targetValue = value;

      if (serialize) {
        try {
          targetValue = JSON.stringify(value, null, 2);
        } catch (err) {
          reject(err);
        }
      }

      this.client.setex(key, seconds, targetValue, (err, val) => {
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

  // https://redis.io/topics/distlock
  public static async redlock(key: string, ttl: number = 3) {
    try {
      const lock = await this.setnx(key, 'lock');
      // set default expire key on redis
      await this.expire(key, ttl);
      return !!lock;
    } catch (error) {
      console.error(error);
      return false;
    }
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

  public static async lockingWithExpire(key: string, value: string, expire: number = 5) {
    let countRetry = 1;
    let locking = {};
    do {
      locking = await this.setnx(key, value);
      if (!!locking || countRetry === 3) {
        await this.expire(key, expire);
        break;
      }
      await sleep(500); // delay 0.5 seconds
      countRetry += 1;
    } while (countRetry < 4);

    return !!locking;
  }

  /**
   * Store data to redis within a duration time.
   *
   * @static
   * @param {string} key
   * @param {*} data
   * @param {number} [duration=600] in seconds
   * @return {*}  {Promise<unknown>}
   * @memberof RedisService
   */
  public static async storeData(key: string, data: any, duration: number = 600): Promise<unknown> {
    if (!data) {
      RequestErrorService.throwObj({
        message: `Data not valid!`,
      });
    }

    return RedisService.setex(key, data, duration, true);
  }

  /**
   * Retrieve data from redis with a key.
   *
   * @static
   * @param {string} key
   * @return {*}
   * @memberof RedisService
   */
  public static async retrieveData(key: string) {
    return RedisService.get(key, true);
  }

  public static async incrbyfloat(key: string, value: number) {
    return new Promise((resolve, reject) => {
      // https://redis.io/commands/incrbyfloat
      this.client.incrbyfloat(key, value, err => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
}
