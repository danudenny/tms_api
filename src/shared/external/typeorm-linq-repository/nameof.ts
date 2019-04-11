export function nameof<T extends Object>(
  nameFunction: (obj: T) => any | { new (...params: any[]): T },
): string {
  try {
    const nameFunctionResult = nameFunction({} as any);
    if (typeof nameFunctionResult === 'string') {
      return nameFunctionResult;
    }
  } catch(e) {
    // skip
  }
  let fnStr: string = nameFunction.toString();

  // Property accessor function.
  let dotIndex: number = fnStr.indexOf('.');
  if (dotIndex > -1) {
    // ES5
    // "function(x) { return x.prop; }"
    // or
    // "function(x) { return x.prop }"
    // or
    // "function(x) {return x.prop}"
    if (fnStr.indexOf('{') > -1) {
      let endsWithSemicolon: number = fnStr.lastIndexOf(';');
      if (endsWithSemicolon > -1) {
        return fnStr.substring(dotIndex + 1, endsWithSemicolon);
      }

      let endsWithSpace: number = fnStr.lastIndexOf(' }');
      if (endsWithSpace > -1) {
        return fnStr.substring(dotIndex + 1, endsWithSpace);
      }

      let endsWithBrace: number = fnStr.lastIndexOf('}');
      if (endsWithBrace > -1) {
        return fnStr.substring(dotIndex + 1, endsWithBrace);
      }
    }
    // ES6
    // "(x) => x.prop"
    else {
      return fnStr.substr(dotIndex + 1);
    }
  }

  // Class name (es5).
  // function MyClass(...) { ... }
  let functionString: string = 'function ';
  let functionIndex: number = fnStr.indexOf(functionString);
  if (functionIndex === 0) {
    let parenIndex: number = fnStr.indexOf('(');
    if (parenIndex > -1) {
      return fnStr.substring(functionString.length, parenIndex);
    }
  }

  // Class name (es6).
  // class MyClass { ... }
  let classString: string = 'class ';
  let classIndex: number = fnStr.indexOf(classString);
  if (classIndex === 0) {
    let notMinified: number = fnStr.indexOf(' {');
    if (notMinified > -1) {
      return fnStr.substring(classString.length, notMinified);
    }

    let minified: number = fnStr.indexOf('{');
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
  } catch(e) {
    // skip
  }

  const fnStr = fn.toString();
  return new RegExp(/(=>|return)\s*(.*)/)
    .exec(fnStr)[2]
    .replace(/\[|]|\;|\s*/gm, '')
    .split(',')
    .map(r => r.substring(r.indexOf('.') + 1));
}
