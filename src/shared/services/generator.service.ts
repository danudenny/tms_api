import { Chance } from 'chance';

export class GeneratorService {
  public static chance = new Chance();

  public static integer(min: number = 1, max: number = 99999) {
    return this.chance.integer({ min, max });
  }

  public static number(length: number = 10) {
    return this.chance.string({ length, pool: '1234567890' });
  }

  public static character(length: number = 10) {
    return this.chance.string({
      length,
      pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    });
  }

  public static alphanumeric(length: number = 10) {
    return this.chance.string({
      length,
      pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    });
  }
}
