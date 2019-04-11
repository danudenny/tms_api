const { getAllServerConfigurations } = require('./util');
const path = require('path');

module.exports = {
  redis: {
    host: 'localhost',
    port: '6379',
    password: '',
    db: process.env.NODE_ENV === 'test' ? 1 : 0,
  },
  jwt: {
    secretKey: 'pleasedefineyoursecretkeyhere',
    accessTokenExpiration: '24h',
    refreshTokenExpiration: '30d',
  },
  paths: {
    root: path.resolve(__dirname, '..'),
    assets: path.resolve(__dirname, '..', 'assets')
  },
  servers: getAllServerConfigurations('default.js'),
};
