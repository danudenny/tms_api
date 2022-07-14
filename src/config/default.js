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
    cloudResiUrl : 'https://sicepatresi.s3.amazonaws.com',
    cloudBucket: 'sicepatmasterdata',
    cloudRegion: 'ap-southeast-1',
    cloudAccessKeyId: 'AKIA2ZCLVOSJTBNWP73E',
    cloudSecretAccessKey: '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',
  },
  printerHelper: {
    url: 'http://jsreport.sicepat.com/wcpp',
    urlApiJsReport: 'http://jsreport.sicepat.com/api/report',
    username: 'admin',
    password: '@S1cepat!',
  },
  imgProxyHelper: {
    proxyUrl: 'https://imgproxy.sicepat.com',
    key: 'WbEZyJ8WsD',
    salt: 'GV5ueRu21Z',
    algo: 'SHA-256',
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
    exportHandoverSigesitMeta: {
      repeat: '0 10 * * *',
      emailTo: 'yonna@e.sicepat.com',
      emailCC: ['ajengaulia937@gmail.com', 'yudha.perwira@sicepat.com', 'Rudian.Syahreza@e.sicepat.com', 'Ali.Shodikin@e.sicepat.com', 'Ahmad.Fikri@e.sicepat.com', 'Jualian_Sa@sicepat.com', 'beben@sicepat.com', 'barizana.arifin@sicepat.com', 'noviaratu@e.sicepat.com', 'tedysicepat@gmail.com', 'ido.tony@sicepat.com', 'galih.nugraha@sicepat.com', 'elva.deliyanin@sicepat.com', 'meisa.ewita@sicepat.com', 'Rajiebadilfi@sicepat.com', 'taufik.prihatin@sicepat.com'],
    },
  },
  clearCacheTMS: {
    urlTMSMobile: 'http://tmsapi.sicepat.com/api/reset_otp/reset_otp_cache',
    urlTMSWeb: 'https://tms.sicepat.com/numberCache/set_phone',
    auth: 'SeWdjOtj21iVsbXv9Wfrpwi8Fgg4QmgFbJmrvXOS',
  },
  logger: {
    level: 'error', // trace / debug / info / warn / error / silent
  },
  queryService :{
    baseUrl : 'http://api-internal.sicepat.io/core/query-service/api/v1/',
    schema: 'pod',
  },
  priorityService :{
    baseUrl : 'http://api-internal.sicepat.io/operation/tms-awb/api/lastmile/',
    retryCount : 2,
    delayTime : 2000,
    slackChannel : '#last-mile-alert',
    xApiKey : 'a99bca19-afa9-4b78-8ce8-2cb366664dc3',
    packageType : ['BEST']
  },
  exportService: {
    baseUrl : 'http://api-internal.sicepat.io/operation/reporting-service/v1',
  },
  loggly: {
    token: '7688b46a-9f23-45d4-851a-cce4d07a0596',
    subdomain: 'sicepat',
    tags: ['API-POD'],
  },
  activityLog: {
    baseUrl: 'http://api-internal.sicepat.io/core/logger',
  },
  flag: {
    disableLoginV1: false,
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
  odoo: {
    baseUrl: 'http://52.77.199.252:5168/',
    authKey: '5a71a345b4eaa9d23b4d4c745e7785e9',
  },
  slackchannel:{
    tmsError: {
      icon : ':sicepat-icon:',
      channel : '#prod-alert-tms',
      username : 'SicepatAlertTMS',
    }
  },
  slack :{
    baseUrl : 'https://hooks.slack.com/services/',
    // tokenSlack : 'TEL84PB2L/B03BJECQLSY/2De9VYLyD1WLHBIfRofYgGWx',
    tokenSlack : 'TEL84PB2L/B02NFKJ7S4A/Xrscr7amizYvioxcpPVZueGa',
    userSlack : 'Incoming Webhook',
    excludePath : ['bull']
  },
  divaPayment: {
    sicepatKlikUrl: 'http://sicepatklik.com/apps/pubext/web/index.php?r=cod',
    apiKey: '91e3a6d02ac4f6054479c9ee03854a22',
    urlQR: 'https://apiv2.mdd.co.id:51347',
    codToken: 'f66046c79e4047c299fbf8abdf6cb3b2',
    codMid: '5b4e9699dd603e1aa6687f1d2fe4db95',
    codTid: 'sicepat-001',
    urlEReceipt: 'http://erg.elebox.id/ereceipt/create',
    waContact: '6281319200030',
  },
  sunfish: {
    postDlvUrl:
      'https://sfapisicepat.dataon.com/sfapiv2/index.cfm?endpoint=/sicepat_FULL_postDelivPaket',
    headerAccount: 'sicepat',
    headerAppname: 'sfapi',
    headerKey:
      'MIICzzCCAbcCAQAwgYkxCzAJBgNVBAYTAklEMRQwEgYDVQQIDAtES0kgSmFrYXJ0YTEUMBIGA1UEBwwLREtJIEpha2FydGExEDAOBgNVBAoMB1NJQ0VQQVQxDjAMBgNVBAsMBXNmYXBpMQswCQYDVQQDDAI1OTEfMB0GCSqGSIb3DQEJARYQemFra3lAZGF0YW9uLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKXK1m11VDgs7wfm7NJEYysOy6FrS0zetNSf8hos2DEi2IZvxTW1gc32g4XZaqaZWFpBlAd2UNO35hRiojiVIUl9zAdJWFikC/PIx4r51htJqayPv74TsWyY+W294tGghaM9ZCpvj+NnFepuVfocq1vKnLH/GAa2O+A4X4nt2bYUxICn1Ml2FemIlSVJi0HcIN5bRc8Cgy1m2vw0GtzLSn4t828xlze3HZgvWo7JLUzht0RDsufpZ9Fc6K6j2JwJVDCgm+JmY6yqpi2c5iICKTUJ+mG9xbA+Vjks4A0+xkJRcfultYKrLWarhOUUd6mHwDIcsENzrHYwRWe01deitu0CAwEAAaAAMA0GCSqGSIb3DQEBCwUAA4IBAQBLRnQOBakC84WgBgi530WCSu/o3knGypisjM9DVTpSRgRXER2QcP+CtHqRZ1BXDR9mes2uldB7XvSbtUGB9IJV6dKiBl51pOPhSR6rRgZhSSfry5Ykulr1iix+2lfwAO5/nDBxzy7bltwitCO28zu2ZfOF3MV3ke/kPWs2NnN3iHMAH6jfIF/zj0xR/klOIKufiLSjVoANLvp8MfFs4yVuHBLy0odGCXKgsCNHWwlYclJkNRbCss+LzdBu4/6r1csgCJ6vZXlDGxzMO3P3B+ryfpJmsacCDCL2esyKJlxYj6tHdjcgmy3VsV6sy4pzx/I8Mo3LrSWH8RRBYb7spZAr',
  },
  proxy: {
    apiInternalBaseUrl: 'http://api-internal.sicepat.io',
    apiTimeoutMs: 15000,
    allowedService: {
      "pod-notification": {
        destination: "/operation/pod-notification"
      },
      "pod-punishment": {
        destination: "/operation/pod-punishment"
      },
      "filesvc": {
        destination: "/core/filesvc"
      },
    }
  },
  reportingService: {
    baseUrl : 'http://api-internal.sicepat.io/operation/reporting-service', //https://swagger.sicepat.tech/operation/reporting-service
    path: {
      report: '/v1/reporting/report',
    }
  },
  codReportType: {
    supplierInvoiceAwb: 'cod-supplier-invoice-awb',
    awbCodSummary: 'awb-cod-summary',
    codNonFee: 'cod-non-fee',
    supplierInvoiceFee: 'cod-supplier-invoice-fee',
  },
  codReportConfig: {
    regexExpToReplace : '[\\n\\r\\;\\t\\|\\"\\\']+',
    roundedDecimal : 0,
  },
  codRoleId:{
    codMerge: [117, 82], //Admin COD - Merger, Ops - Last Mile Koordinator Sigesit (COD)
    codAdmin: [103, 147], //Ops - Admin COD, Ops - Admin Operational ( COD )
    codManual: [212], //Admin FORCE MAJEURE
  },
  korwil: {
    korwilRoleId: [38, 155],
    smdRoleId: 104,
    palkurRoleId: [40, 41],
    korwilHrdRoleId: 154,
  },
  retur: {
    returnRoleId: [15],
  },
  hubSortation:{
    sortationDriverRoleId: [1240],
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
      'mongodb+srv://sicepatmongo:5icepaTmong0888@sicepat-tracking-cluster-nrgvr.mongodb.net/test?retryWrites=true&w=majority&readPreference=secondaryPreferred',
  },
  sendgrid: {
    apiKeyId: '03GtPFfkRzS6y47gfg23sQ',
    apiKey:
      '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',
  },
  svcOtp: {
    baseUrl: 'http://api-internal.sicepat.io/core/authsvc',
    otpRequiredUrl: 'https://sms-otp.s3.ap-southeast-1.amazonaws.com/otp_config_prod.json',
    sortChannel: 'sms,wa,email', //no space
    isBypass: false,
    bypassCode: "815413",
    checkingConfig: true,
    disableChannel: "wa"
  },
};
