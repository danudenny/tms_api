import fs = require('fs');
import path = require('path');
import { getManager } from 'typeorm';

export class TestSeed {
  public static async seed() {
    await this.seedBranch();
    await this.seedRole();
    await this.seedUser();
    await this.seedPartnerLogistic();
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
}
