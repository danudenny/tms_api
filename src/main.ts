import { boot } from './main-setup';
import { SentryService } from './shared/services/sentry.service';
import { WinstonLogglyService } from './shared/services/winston-loggly.service';

// init setup service
SentryService.setup();
WinstonLogglyService.setup();

boot().then();
