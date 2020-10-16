import moment = require("moment");

export abstract class DateHelper {
  public static getStartOfMonth(date): Date {
    const startOfMonth = moment(date).startOf('month').toDate();
    return startOfMonth;
  }

  public static getStartOfCurrentMonth(): Date {
    return this.getStartOfMonth(moment());
  }

  public static getEndOfMonth(date): Date {
    const endOfMonth = moment(date).endOf('month').toDate();
    return endOfMonth;
  }

  public static getEndOfCurrentMonth(): Date {
    return this.getEndOfMonth(moment());
  }

  public static formatDateTime(date, format): string {
    if (!date) return null as any;
    const d = moment(date);
    return (d.isValid()) ? moment(date).format(format) : (null as any);
  }

  public static formatDateCommon(date): string {
    return this.formatDateTime(date, 'YYYY-MM-DD');
  }

  public static formatDateTimeCommon(date): string {
    return this.formatDateTime(date, 'YYYY-MM-DD HH:mm:ss');
  }

  public static getCurrentWibMomentTime(): moment.Moment {
    return moment.utc().add(420, 'm');
  }

  public static getMomentDateFromQueryParam(date): moment.Moment {
    return (date instanceof Date) ? moment(date) : moment(date, 'YYYY-MM-DD');
  }

  public static getMomentCutOffStartDate(startDate, cutOffHour: number = 0): moment.Moment {
    const sDate = moment(startDate)
      .set({ hour: cutOffHour, minute: 0, second: 0, millisecond: 0 });

    return sDate;
  }

  public static getFormattedCutOffStartDate(startDate, cutOffHour: number = 0): string {
    const s = this.getMomentCutOffStartDate(startDate, cutOffHour).format('YYYY-MM-DD HH:mm:ss');
    return s;
  }

  public static getMomentCutOffEndDate(endDate, cutOffHour: number = 0): moment.Moment {
    const eDate = moment(endDate)
      .add(1, 'day')
      .set({ hour: cutOffHour, minute: 0, second: 0, millisecond: 0 });

    return eDate;
  }

  public static getFormattedCutOffEndDate(endDate, cutOffHour: number = 0): string {
    const s = this.getMomentCutOffEndDate(endDate, cutOffHour).format('YYYY-MM-DD HH:mm:ss');
    return s;
  }

  public static resetMomentTime(d): moment.Moment {
    return moment(d).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  }

  public static convertToGmt7StringFormat(date) {
    const mDate = (moment.isMoment(date)) ? date : moment(date);
    var part1 = mDate.format("YYYY-MM-DD");
    var part2 = mDate.format("HH:mm:ss");
    return `${part1}T${part2}+07:00`;
  }
}
