import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsAwbNumber(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsAwbNumber',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          let check = 0;
          for (const awbNumber of value) {
            if (awbNumber.length !== 12) {
              check = 1;
              break;
            }
          }

          if (check === 1) {
            return false;
          }

          return true;
        },
      },
    });
  };
}

export function IsBagNumber(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsBagNumber',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          let check = 0;
          for (const awbNumber of value) {
            if (awbNumber.length !== 10) {
              check = 1;
              break;
            }
          }

          if (check === 1) {
            return false;
          }

          return true;
        },
      },
    });
  };
}
