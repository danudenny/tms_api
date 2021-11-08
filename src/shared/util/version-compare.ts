export abstract class VersionCompareUtil {
  /* 
    Return 1 if a > b
    Return -1 if a < b
    Return 0 if a == b
  */
  public static versionCompare(a: string, b: string) {
    if (a == b) {
      return 0;
    }

    let arrA = a.split('.');
    let arrB = b.split('.');

    let arrLength = Math.min(arrA.length, arrB.length);
    for (let i = 0; i < arrLength; i++) {
      if (Number(arrA[i]) > Number(arrB[i])) {
        return 1;
      }
      if (Number(arrA[i]) < Number(arrB[i])) {
        return -1;
      }
    }

    if (arrA.length > arrB.length) {
      return 1;
    }

    if (arrA.length < arrB.length) {
      return -1;
    }

    return 0;
  }
}
