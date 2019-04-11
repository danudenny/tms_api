export class ContextualError {
  errors: ContextualErrorItem[] = [];

  addError(...errors: ContextualErrorItem[]) {
    this.errors.push(...errors);
  }
}

export class ContextualErrorItem extends Error {
  message: string | any = null;
  code?: string | number = null;
  data?: any = null;
}
