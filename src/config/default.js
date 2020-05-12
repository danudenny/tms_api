const { getAllServerConfigurations } = require('./util');
const path = require('path');

module.exports = {
  redis: {
    host: '18.141.116.177',
    port: '6379',
    password: 'r3di5S1c3pat116688_',
    db: process.env.NODE_ENV === 'test' ? 1 : 0,
  },
  jwt: {
    secretKey: '0ace7f5d7b18d2cc2ab0532b04085acc',
    accessTokenExpiration: '24h',
    refreshTokenExpiration: '30d',
  },
  paths: {
    root: path.resolve(__dirname, '..'),
    assets: path.resolve(__dirname, '..', 'assets'),
  },
  cloudStorage: {
    cloudUrl: 'https://sicepatmasterdata.s3-ap-southeast-1.amazonaws.com',
    cloudBucket: 'sicepatmasterdata',
    cloudRegion: 'ap-southeast-1',
    cloudAccessKeyId: 'AKIA2ZCLVOSJTBNWP73E',
    cloudSecretAccessKey: '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',
  },
  printerHelper: {
    url: 'http://jsreport.sicepat.com/wcpp',
  },
  queue: {
    doPodDetailPostMeta: {
      retryDelayMs: 2 * 60 * 1000, // 2 minutes
      keepRetryInHours: 24, // keep retrying in 1 day
    },
    masterDataMappingRole: {
      retryDelayMs: 2 * 60 * 1000, // 2 minutes
      keepRetryInHours: 24, // keep retrying in 1 day
    },
  },
  logger: {
    level: 'debug', // trace / debug / info / warn / error / silent
  },
  sentry: {
    dsn: 'http://8d763ea5cbaf4321ad5d58778e08d589@sentry.sicepat.com/2',
  },
  loggly: {
    token: '7688b46a-9f23-45d4-851a-cce4d07a0596',
    subdomain: 'sicepat',
    tags: ['API-POD'],
  },
  servers: getAllServerConfigurations('default.js'),
  posIndonesia: {
    ttlToken: 1000,
    username: 'rHzS2Pf0djuTlBffxvIOtXWqSL0a',
    password: 'bqYVa8cAZDA0FjYfVpMIrGJMYFga',
    baseUrl: 'https://api.posindonesia.co.id:8245/',
    tokenEndpoint: 'token',
    postAwbEndpoint: 'webhook/1.0/AddPostingDoc',
  },
  gojek: {
    baseUrl: 'https://integration-kilat-api.gojekapi.com/gokilat/v10/',
    clientId: 'si-cepat-engine',
    passKey: '2e8a7f4d5ef4b746a503ef270ce2a98e562bc77e2dd6c19bf10e3d95e3390393',
    shipmentMethod: 'Instant',
  },
  korwil: {
    korwilRoleId: 38,
    palkurRoleId: 40,
  },
  masterData: {
    apiKey:
      'af8cf9bafac713ae8c6d5119346d783239e07552281e93c01785b1ed9611cec373cd7cbe24236c711512bf366e36b164ed27c874e85dfa7d97f4358df122b213',
  },
  cps: {
    apiKey: '371b74e652119491854b78ce6f6bf03b',
  },
};
