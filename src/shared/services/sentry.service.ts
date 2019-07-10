import { ArgumentsHost, ExecutionContext } from '@nestjs/common';
import Sentry = require('@sentry/node');
import config = require('config');

export class SentryService {
  public static shouldRun: boolean =
    process.env.NODE_ENV === 'production' && config.has('sentry');

  public static setup() {
    if (this.shouldRun) {
      const sentryConfig = config.get('sentry');

      Sentry.init({
        ...sentryConfig,
        integrations: integrations => {
          // integrations will be all default integrations
          return [...integrations];
        },
        onFatalError: () => {},
      });
    }
  }

  public static trackFromExceptionAndNestHostOrContext(
    exception: any,
    context: ArgumentsHost | ExecutionContext,
  ) {
    if (this.shouldRun) {
      const ctx = context.switchToHttp();
      const request = ctx.getRequest();

      const hub = Sentry.getCurrentHub();
      hub.withScope(scope => {
        scope.setExtra('request-path', request.path);
        scope.setExtra('request-method', request.method);
        scope.setExtra('request-headers', request.headers);
        scope.setExtra('request-query', request.query);
        scope.setExtra('request-params', request.params);
        scope.setExtra('request-body', request.body);
        hub.captureException(exception);
      });
    }
  }
}
