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
    doSmdDetailPostMeta: {
      retryDelayMs: 2 * 60 * 1000, // 2 minutes
      keepRetryInHours: 24, // keep retrying in 1 day
    },
  },
  logger: {
    level: 'debug', // trace / debug / info / warn / error / silent
  },
  sentry: {
    dsn:
      'https://cd146c2621d24fc5b937d3ec598328da@o392502.ingest.sentry.io/5245618',
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
  odoo: {
    baseUrl: 'http://52.77.199.252:5168/',
    authKey: '5a71a345b4eaa9d23b4d4c745e7785e9',
  },
  divaPayment: {
    sicepatKlikUrl: 'http://sicepatklik.com/apps/pubext/web/index.php?r=cod',
    apiKey: '91e3a6d02ac4f6054479c9ee03854a22',
    urlQR: 'https://apiv2.mdd.co.id:51347',
    codToken: 'f66046c79e4047c299fbf8abdf6cb3b2',
    codMid: '5b4e9699dd603e1aa6687f1d2fe4db95',
    codTid: 'Mobile-POD',
  },
  korwil: {
    korwilRoleId: 38,
    smdRoleId: 117,
    palkurRoleId: [40, 41],
  },
  masterData: {
    apiKey:
      'af8cf9bafac713ae8c6d5119346d783239e07552281e93c01785b1ed9611cec373cd7cbe24236c711512bf366e36b164ed27c874e85dfa7d97f4358df122b213',
  },
  cps: {
    apiKey: '371b74e652119491854b78ce6f6bf03b',
  },
  mongodb: {
    sicepat:
      'mongodb+srv://sicepatmongo:5icepaTmong0888@sicepat-staging-cluster.nrgvr.mongodb.net/test?retryWrites=true&w=majority&readPreference=secondaryPreferred',
  },
};
