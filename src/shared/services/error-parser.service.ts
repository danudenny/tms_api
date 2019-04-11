import { forEach } from 'lodash';
import { isArray } from 'util';

import { ContextualError, ContextualErrorItem } from '../models/contextual-error';

export class ErrorParserService {
  public static parseToContextualError(error: any) {
    const contextualError = new ContextualError();

    if (isArray(error)) {
      forEach(error, errorItem => {
        const contextualErrorItem = ErrorParserService.convertErrorToContextualErrorItem(
          errorItem,
        );
        contextualError.addError(...contextualErrorItem);
      });
    } else {
      const contextualErrorItem = ErrorParserService.convertErrorToContextualErrorItem(
        error,
      );
      contextualError.addError(...contextualErrorItem);
    }

    return contextualError;
  }

  public static convertErrorToContextualErrorItem(error: any): ContextualErrorItem[] {
    if (error instanceof ContextualError) {
      return (error as ContextualError).errors;
    } else {
      const contextualErrorItem = new ContextualErrorItem();
      return [contextualErrorItem];
    }
  }
}
