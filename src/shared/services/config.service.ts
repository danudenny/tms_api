import { get, has, set } from 'lodash';
import * as path from 'path';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.join(__dirname, '..', '..', 'config'),
);

export class ConfigService {
  public static config = require('config');
  public static overridenConfigs = {};

  public static get(key: string) {
    return (
      get(ConfigService.overridenConfigs, key) || ConfigService.config.get(key)
    );
  }

  public static has(key: string) {
    return (
      has(ConfigService.overridenConfigs, key) || ConfigService.config.has(key)
    );
  }

  public static set(key: string, value: any) {
    return set(ConfigService.overridenConfigs, key, value);
  }
}
