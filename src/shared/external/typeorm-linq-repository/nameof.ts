export function nameof<T extends Object>(
  nameFunction: (obj: T) => any | (new (...params: any[]) => T),
): string {
  try {
    const nameFunctionResult = nameFunction({} as any);
    if (typeof nameFunctionResult === 'string') {
      return nameFunctionResult;
    }
  } catch (e) {
    // skip
  }
  const fnStr: string = nameFunction.toString();

  // Property accessor function.
  const dotIndex: number = fnStr.indexOf('.');
  if (dotIndex > -1) {
    // ES5
    // "function(x) { return x.prop; }"
    // or
    // "function(x) { return x.prop }"
    // or
    // "function(x) {return x.prop}"
    if (fnStr.indexOf('{') > -1) {
      const endsWithSemicolon: number = fnStr.lastIndexOf(';');
      if (endsWithSemicolon > -1) {
        return fnStr.substring(dotIndex + 1, endsWithSemicolon);
      }

      const endsWithSpace: number = fnStr.lastIndexOf(' }');
      if (endsWithSpace > -1) {
        return fnStr.substring(dotIndex + 1, endsWithSpace);
      }

      const endsWithBrace: number = fnStr.lastIndexOf('}');
      if (endsWithBrace > -1) {
        return fnStr.substring(dotIndex + 1, endsWithBrace);
      }
    } else {
      return fnStr.substr(dotIndex + 1);
    }
  }

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

  // Invalid function.
  throw new Error('ts-simple-nameof: Invalid function syntax.');
}

export function nameofFn(fn: Function): string[] {
  try {
    const nameFunctionResult = fn({} as any);
    if (typeof nameFunctionResult === 'string') {
      return [nameFunctionResult];
    }
  } catch (e) {
    // skip
  }

  const fnStr = fn.toString();
  return new RegExp(/(=>|return)\s*(.*)/)
    .exec(fnStr)[2]
    .replace(/\[|]|\;|\s*/gm, '')
    .split(',')
    .map(r => r.substring(r.indexOf('.') + 1));
}
