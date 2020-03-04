const { getAllServerConfigurations } = require("./util");
const path = require("path");

module.exports = {
  redis: {
    host: '3.1.243.32',
    port: '6379',
    password: '9F864DAF0B09974AA3F0E90646EEFEA3',
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
    masterDataMappingRole: {
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
  posIndonesia: {
    ttlToken: 1000,
    username: 'T1F2V4Xgof0hTvYlS9QYvTpitBka',
    password: 'tGLlYLfqRSiK7IA2mYHeu_EMbbwa',
    baseUrl: 'https://sandbox.posindonesia.co.id:8245/',
    tokenEndpoint: 'token',
    postAwbEndpoint: 'webhookpos/1.0.1/AddPostingDoc',
  },
  gojek: {
    baseUrl: 'https://integration-kilat-api.gojekapi.com/gokilat/v10/',
    clientId: 'si-cepat-engine',
    passKey: '2e8a7f4d5ef4b746a503ef270ce2a98e562bc77e2dd6c19bf10e3d95e3390393',
    shipmentMethod: 'Instant',
  },
  korwil: {
    korwilRoleId: 38,
    palkurRoleId: 40
  },
  masterData: {
    apiKey: 'af8cf9bafac713ae8c6d5119346d783239e07552281e93c01785b1ed9611cec373cd7cbe24236c711512bf366e36b164ed27c874e85dfa7d97f4358df122b213'
  }
};
