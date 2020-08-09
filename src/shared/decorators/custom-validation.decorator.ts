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

export function IsBagNumberSingle(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsBagNumber',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          let check = 0;
          const bagNumber = value;
          if (bagNumber.length !== 10) {
            check = 1;
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

export function IsBranchCode(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsBranchCode',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          let check = 0;
          const representativeCode = value;
          if (representativeCode.length !== 3) {
            check = 1;
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
