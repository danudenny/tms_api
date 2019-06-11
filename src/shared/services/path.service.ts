import * as fs from 'fs';
import * as path from 'path';

import { ConfigService } from './config.service';

export class PathService {
  public static getRootPath() {
    return PathService.validatePath(ConfigService.get('paths.root'));
  }

  public static getAssetsPath() {
    return PathService.validatePath(ConfigService.get('paths.assets'));
  }

  private static validatePath(targetPath: string) {
    if (!fs.existsSync(targetPath)) {
      throw new Error(`Requested path: ${targetPath} is not found`);
    }
    return path.resolve(targetPath);
  }
}
