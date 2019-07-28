import fs = require('fs');
import path = require('path');
import { getManager } from 'typeorm';

export class TestSeed {

  /**
   * Initial Seed Data
   * @static
   * @memberof TestSeed
   */
  public static async seed() {
    await this.seedAwbStatus();
    await this.seedBranch();
    await this.seedRole();
    await this.seedUser();
    await this.seedPartnerLogistic();
    await this.seedReason();
  }

  public static async seedAwbStatus() {
    const sql1 = fs.readFileSync(
      path.resolve(__dirname, '../../sql/seed-awb-status.sql'),
      'utf8',
    );
    await getManager().connection.query(sql1);

    const sql2 = fs.readFileSync(
      path.resolve(__dirname, '../../sql/seed-awb-status-group.sql'),
      'utf8',
    );
    await getManager().connection.query(sql2);

    const sql3 = fs.readFileSync(
      path.resolve(__dirname, '../../sql/seed-awb-status-group-item.sql'),
      'utf8',
    );
    await getManager().connection.query(sql3);
  }

  public static async seedBranch() {
    const sql = fs.readFileSync(
      path.resolve(__dirname, '../../sql/seed-branch.sql'),
      'utf8',
    );
    await getManager().connection.query(sql);
  }

  public static async seedRole() {
    const sql = fs.readFileSync(
      path.resolve(__dirname, '../../sql/seed-role.sql'),
      'utf8',
    );
    await getManager().connection.query(sql);

    const sql2 = fs.readFileSync(
      path.resolve(__dirname, '../../sql/seed-role-permission.sql'),
      'utf8',
    );
    await getManager().connection.query(sql2);
  }

  public static async seedUser() {
    const sql = fs.readFileSync(
      path.resolve(__dirname, '../../sql/seed-user.sql'),
      'utf8',
    );
    await getManager().connection.query(sql);

    const sql2 = fs.readFileSync(
      path.resolve(__dirname, '../../sql/seed-user-role.sql'),
      'utf8',
    );
    await getManager().connection.query(sql2);

    const sql3 = fs.readFileSync(
      path.resolve(__dirname, '../../sql/seed-employee.sql'),
      'utf8',
    );
    await getManager().connection.query(sql3);
  }

  public static async seedPartnerLogistic() {
    const sql = fs.readFileSync(
      path.resolve(__dirname, '../../sql/seed-partner-logistic.sql'),
      'utf8',
    );
    await getManager().connection.query(sql);
  }

  public static async seedReason() {
    const sql = fs.readFileSync(
      path.resolve(__dirname, '../../sql/seed-reason.sql'),
      'utf8',
    );
    await getManager().connection.query(sql);
  }
}
