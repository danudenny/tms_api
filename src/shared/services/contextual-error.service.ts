import { HttpException } from '@nestjs/common';

import { ContextualError, ContextualErrorItem } from '../models/contextual-error';
import { RequestContextMetadataService } from './request-context-metadata.service';

export class ContextualErrorService {
  public static get contextualErrorInstance(): ContextualError {
    let targetContext = RequestContextMetadataService.getMetadata(
      'CONTEXTUAL_ERROR',
    );
    if (!targetContext) {
      targetContext = new ContextualError();
      RequestContextMetadataService.setMetadata(
        'CONTEXTUAL_ERROR',
        targetContext,
      );
    }

    return targetContext;
  }

  public static addContextualError(contextualError: Partial<ContextualErrorItem>) {
    const contextualErrorInstance = ContextualErrorService.convertPartialContextualErrorItemToInstance(
      contextualError,
    );
    ContextualErrorService.contextualErrorInstance.addError(contextualErrorInstance);
  }

  public static throwContextualError(httpCode: number = 500) {
    if (this.contextualErrorInstance && this.contextualErrorInstance.errors && this.contextualErrorInstance.errors.length) {
      throw new HttpException(ContextualErrorService.contextualErrorInstance, httpCode);
    }
  }

  public static throw(contextualError: Partial<ContextualErrorItem>, httpCode: number = 500) {
    const targetContextualError = new ContextualError();
    const contextualErrorInstance = ContextualErrorService.convertPartialContextualErrorItemToInstance(
      contextualError,
    );
    targetContextualError.addError(contextualErrorInstance);
    throw new HttpException(targetContextualError, httpCode);
  }

  public static convertPartialContextualErrorItemToInstance(
    contextualError: Partial<ContextualErrorItem>,
  ) {
    const contextualErrorTarget = new ContextualErrorItem();
    contextualErrorTarget.message = contextualError.message;
    contextualErrorTarget.code = contextualError.code;
    contextualErrorTarget.data = contextualError.data;

    return contextualErrorTarget;
  }
}
