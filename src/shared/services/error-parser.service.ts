import { ArgumentsHost } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { forEach, isArray } from 'lodash';

import { RequestError } from '../models/request-error';

export class ErrorParserService {
  public static parseRequestErrorFromExceptionAndArgumentsHost(
    exception: any,
    host: ArgumentsHost,
  ): RequestError {
    const requestError = new RequestError();
    requestError.detail = exception;
    requestError.messageList = this.populateErrorMessages(exception);
    requestError.buildMessage();

    return requestError;
  }

  private static populateErrorMessages(
    errorContent,
    errorMessages: string[] = [],
  ) {
    if (
      errorContent &&
      (errorContent instanceof Error || errorContent.message) &&
      errorContent.message
    ) {
      this.populateErrorMessages(
        errorContent.message,
        errorMessages,
      );
    }

    if (isArray(errorContent)) {
      for (const errorItem of errorContent) {
        this.populateErrorMessages(errorItem, errorMessages);
      }
    } else {
      switch (true) {
        case typeof errorContent !== 'function' && typeof errorContent !== 'object':
          errorMessages.push(errorContent);
          break;
        case errorContent instanceof ValidationError:
          forEach(errorContent.constraints, errorConstraint => {
            errorMessages.push(errorConstraint);
          });
          break;
      }
    }

    return errorMessages;
  }
}
