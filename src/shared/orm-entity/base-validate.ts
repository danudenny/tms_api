import { validate } from 'class-validator';
import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class BaseValidateEntity {
  runEntityValidationBeforeSave: boolean = true;

  async runEntityValidation() {
    const result = await validate(this);
    if (result && result.length) {
      throw new HttpException(result, HttpStatus.BAD_REQUEST);
    }

    return true;
  }
}
