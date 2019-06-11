import { Injectable } from '@nestjs/common';

import { I18nService } from './i18n.service';

@Injectable()
export class BootService {
  async boot() {
    I18nService.boot();
  }
}
