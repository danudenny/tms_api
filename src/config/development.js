const { getAllServerConfigurations } = require("./util");
const path = require("path");

module.exports = {
  redis: {
    host: 'localhost',
    port: '6379',
    password: '',
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
    cloudUrl: 'https://sicepattesting.s3-ap-southeast-1.amazonaws.com',
    cloudBucket: 'sicepattesting',
    cloudRegion: 'ap-southeast-1',
    cloudAccessKeyId: 'AKIAJHHTEMTLK42N7TQA',
    cloudSecretAccessKey: '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',
  },
  printerHelper: {
    url: 'http://sicepat-tms-printer.azurewebsites.net',
  },
  queue: {
    doPodDetailPostMeta: {
      retryDelayMs: 2 * 60 * 1000, // 2 minutes
      keepRetryInHours: 24, // keep retrying in 1 day
    },
  },
  logger: {
    level: 'debug', // trace / debug / info / warn / error / silent
  },
  sentry: {
    dsn:
      'http://ab6f52ba994f42dc9d15d23464dfbcee@sicepat-sentry.eastus.cloudapp.azure.com:9000/2',
  },
  loggly: {
    token: '7688b46a-9f23-45d4-851a-cce4d07a0596',
    subdomain: 'sicepat',
    tags: ['API-POD-DEV'],
  },
  servers: getAllServerConfigurations('default.js'),
};
