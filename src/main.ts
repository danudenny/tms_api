import { boot } from './main-setup';
import { SentryService } from './shared/services/sentry.service';

SentryService.setup();

boot().then();
