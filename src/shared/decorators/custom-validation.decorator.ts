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
          let flag = 0;
          for (const awbNumber of value) {
            if (awbNumber.length !== 12) {
              flag = 1;
            }
          }

          if (flag === 1) {
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
          let flag = 0;
          for (const awbNumber of value) {
            if (awbNumber.length !== 10) {
              flag = 1;
            }
          }

          if (flag === 1) {
            return false;
          }

          return true;
        },
      },
    });
  };
}
