import moment = require('moment');
import { SysCounter } from '../orm-entity/sys-counter';

export class CustomCounterCode {

  public static async pickupRequestPartner(dateTime: string, digit: number = 5) {
    const prefix = `SPKA/${moment(dateTime).format('YYMM')}/`;
    const last_number = await this.getLastNumber(prefix);
    return prefix + last_number.toString().padStart(digit, '0');
  }

  public static async doPod(dateTime: string, digit: number = 5) {
    const prefix = `DOP/${moment(dateTime).format('YYMM')}/`;
    const last_number = await this.getLastNumber(prefix);
    return prefix + last_number.toString().padStart(digit, '0');
  }

  // TODO: validasi code
  public static async doPodDeliver(dateTime: string, digit: number = 5) {
    const prefix = `DOPD/${moment(dateTime).format('YYMM')}/`;
    const last_number = await this.getLastNumber(prefix);
    return prefix + last_number.toString().padStart(digit, '0');
  }

  private static async getLastNumber(prefix: string) {
    const timeNow = moment().toDate();
    let nextCounter = 1;

    let customCounter = await SysCounter.findOne({
      where: {
        key: prefix,
        isDeleted: false,
      },
    });

    if (customCounter) {
      // Update Data
      nextCounter = Number(customCounter.counter) + 1;
      customCounter.counter = nextCounter;
      customCounter.updatedTime = timeNow;
      SysCounter.save(customCounter);
    } else {
      // # Insert Data
      customCounter = SysCounter.create();
      customCounter.key = prefix;
      customCounter.counter = nextCounter;
      customCounter.createdTime = timeNow;
      customCounter.updatedTime = timeNow;
      SysCounter.save(customCounter);
    }

    return nextCounter;
  }
}
