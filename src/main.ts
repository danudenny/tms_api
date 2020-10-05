import { boot } from './main-setup';
import { SentryService } from './shared/services/sentry.service';
import { WinstonLogglyService } from './shared/services/winston-loggly.service';
// tslint:disable-next-line: no-var-requires
require('./newrelic');

// init setup service
SentryService.setup();
WinstonLogglyService.setup();

boot().then();
