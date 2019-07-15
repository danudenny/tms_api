import moment = require('moment');
import { SysCounter } from '../orm-entity/sys-counter';
import { sampleSize } from 'lodash';

export class CustomCounterCode {

  static randomCode(digit: number = 8) {
    return sampleSize('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', digit);
  }

  public static async pickupRequestPartner(dateTime: string, digit: number = 5) {
    const prefix = `SPKA/${moment(dateTime).format('YYMM')}/`;
    const last_number = await this.getLastNumber(prefix);
    return prefix + last_number.toString().padStart(digit, '0');
  }

  public static async doPod(dateTime: string, digit: number = 8) {
    const prefix = `DOP/${moment(dateTime).format('YYMMDD')}/`;
    const randomCode = this.randomCode(digit).join('');
    return prefix + randomCode.toString();
  }

  public static async doPodDeliver(dateTime: string, digit: number = 8) {
    const prefix = `DOPD/${moment(dateTime).format('YYMMDD')}/`;
    const randomCode = this.randomCode(digit).join('');
    return prefix + randomCode.toString();
  }

  public static async awbTrouble(dateTime: string, digit: number = 8) {
    // Format Code: ATR/1907/13/XYZA1234
    const prefix = `ATR/${moment(dateTime).format('YYMMDD')}/`;
    const randomCode = this.randomCode(digit).join('');
    return prefix + randomCode.toString();
  }

  // get data on DB
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
