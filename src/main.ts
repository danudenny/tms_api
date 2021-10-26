import { boot } from './main-setup';
import { WinstonLogglyService } from './shared/services/winston-loggly.service';
// tslint:disable-next-line: no-var-requires
require('newrelic');

// init setup service
WinstonLogglyService.setup();

boot().then();
