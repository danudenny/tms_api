import moment = require('moment');
import { SysCounter } from '../orm-entity/sys-counter';
import { sampleSize } from 'lodash';

export class CustomCounterCode {

  static randomCode(digit: number = 8) {
    const size = Math.round(digit / 2);
    const randAlfa = sampleSize('ABCDEFGHIJKLMNOPQRSTUVWXYZ', size).join('');
    const randNumber = sampleSize('1234567890', size).join('');
    return randAlfa + randNumber;
  }

  public static async pickupRequestPartner(dateTime: string, digit: number = 5) {
    const prefix = `SPKA/${moment(dateTime).format('YYMM')}/`;
    const last_number = await this.getLastNumber(prefix);
    return prefix + last_number.toString().padStart(digit, '0');
  }

  public static async workOrderCodeRandom(dateTime: Date, digit: number = 8) {
    const prefix = `SPKAR/${moment(dateTime).format('YYMM')}/`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode;
  }

  // counter code awb number for return
  public static async awbReturn() {
    const prefix = `R`;
    const last_number = await this.getLastNumber(prefix);
    return prefix + last_number.toString().padStart(11, '0');
  }

  public static async doPod(dateTime: Date, digit: number = 8) {
    const prefix = `DOP/${moment(dateTime).format('YYMM/DD/')}`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode;
  }

  public static async doPodDeliver(dateTime: Date, digit: number = 8) {
    const prefix = `DOPD/${moment(dateTime).format('YYMM/DD/')}`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode;
  }

  public static async awbTrouble(dateTime: Date, digit: number = 8) {
    const prefix = `ATR/${moment(dateTime).format('YYMM/DD/')}`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode;
  }

  public static async bagTrouble(dateTime: Date, digit: number = 8) {
    const prefix = `BTR/${moment(dateTime).format('YYMM/DD/')}`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode;
  }

  public static async doReturn(dateTime: Date, digit: number = 8) {
    const prefix = `DOR/${moment(dateTime).format('YYYY/MM/')}`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode;
  }

  public static async doReturnToCust(dateTime: Date, digit: number = 8) {
    const prefix = `SCI/${moment(dateTime).format('YYYY/MM/')}`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode;
  }

  public static async doReturnToCollection(dateTime: Date, digit: number = 8) {
    const prefix = `TDO/${moment(dateTime).format('YYYY/MM/')}`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode;
  }

  public static async podFilter(dateTime: Date, digit: number = 8) {
    // Format Code: FLT/1907/13/XYZA1234
    const prefix = `FLT/${moment(dateTime).format('YYMM/DD')}/`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  // SMD
    public static async receivedBagCodeRandom(dateTime: Date, digit: number = 8) {
    const prefix = `TB/${moment(dateTime).format('YYMM/DD')}/`;
    const randomCode = this.randomCode(digit);
    return prefix + randomCode.toString();
  }

  public static async receivedBagCodeCounter(dateTime: Date, digit: number = 5) {
    const prefix = `TB/${moment(dateTime).format('YYMM')}/`;
    const last_number = await this.getLastNumber(prefix);
    return prefix + last_number.toString().padStart(digit, '0');
  }

  public static async doSmdCodeCounter(dateTime: Date, digit: number = 5) {
    const prefix = `DMD/${moment(dateTime).format('YYMM')}/`;
    const last_number = await this.getLastNumber(prefix);
    return prefix + last_number.toString().padStart(digit, '0');
  }

  public static async bagCityCodeCounter(dateTime: Date, digit: number = 5) {
    const prefix = `GSK/${moment(dateTime).format('YYMM')}/`;
    const last_number = await this.getLastNumber(prefix);
    return prefix + last_number.toString().padStart(digit, '0');
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
