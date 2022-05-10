export enum HUB_REPORT {
  HUB_MESIN = 1,
  LEBIH_SORTIR = 2,
}
export class EnumHubReport {
  static getKeyByValue(value: number) {
    const indexOfS = Object.values(HUB_REPORT).indexOf(value as unknown as HUB_REPORT);
    const key = Object.keys(HUB_REPORT)[indexOfS];
    return key;
  }

}
