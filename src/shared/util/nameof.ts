import { head } from 'lodash';

export function nameOfClass(fn: Constructor<any>) {
  const fnStr = fn.toString();

  // Class name (es5).
  // function MyClass(...) { ... }
  const functionString: string = 'function ';
  const functionIndex: number = fnStr.indexOf(functionString);
  if (functionIndex === 0) {
    const parenIndex: number = fnStr.indexOf('(');
    if (parenIndex > -1) {
      return fnStr.substring(functionString.length, parenIndex);
    }
  }

  // Class name (es6).
  // class MyClass { ... }
  const classString: string = 'class ';
  const classIndex: number = fnStr.indexOf(classString);
  if (classIndex === 0) {
    const notMinified: number = fnStr.indexOf(' {');
    if (notMinified > -1) {
      return fnStr.substring(classString.length, notMinified);
    }

    const minified: number = fnStr.indexOf('{');
    if (minified > -1) {
      return fnStr.substring(classString.length, minified);
    }
  }
}

export function nameOfProps<T extends Object>(fn: ((obj: T) => any) | string) {
  if (typeof fn === 'string') {
    return [fn];
  }

  const fnStr = fn.toString().replace(/\s|\n/gm, '');
  return new RegExp(/(=>|return)\s*(.*)/)
    .exec(fnStr)[2]
    .replace(/\[|]|\;|\s*/gm, '')
    .split(',')
    .map(str => str.replace('.0.', '.').replace('[0]', ''))
    .map(str => str.substring(str.indexOf('.') + 1))
    .filter(str => !!str);
}

export function nameOfProp<T extends Object>(fn: ((obj: T) => any) | string) {
  const result = nameOfProps(fn as any);

  return head(result);
}
