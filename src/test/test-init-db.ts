import fs = require('fs');
import path = require('path');
import { createConnection } from 'typeorm';

import { TestSeed } from './test-seed';

export const testInitDb = async () => {
  const ormConfig = require('../../ormconfig.test');
  const connection = await createConnection({
    ...ormConfig,
    logging: !process.env.RESET_DB,
  });

  // drop database tables
  await connection.dropDatabase();

  // reinitialize database structures
  const sql = fs.readFileSync(
    path.resolve(__dirname, '../../sql/init.sql'),
    'utf8',
  );
  await connection.query(sql);

  await TestSeed.seed();
};
