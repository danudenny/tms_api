import { I18nService } from './i18n.service';

export class BootService {
  public static async boot() {
    I18nService.boot();
  }
}
