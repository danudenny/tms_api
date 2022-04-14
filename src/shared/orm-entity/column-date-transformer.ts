import { ValueTransformer } from 'typeorm';
import moment = require('moment');

export class ColumnDateTransformer implements ValueTransformer {
  //to: code to DB
  to(data?: Date | null): string | null {
    return `${moment(data).format('YYYY-MM-DD HH:mm:ss')}.${this.timestampNano()}`;
  }

  //from: DB to code
  from(data?: string | null): Date | null {
    return moment(data).toDate();
  }

  timestampNano() {
    const hrTime = process.hrtime();
    const mili = hrTime[0] * 1000 + hrTime[1] / 1000000;
    const nano = mili.toString().split('.')[1];
    return nano;
  };
}
