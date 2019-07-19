const { getAllServerConfigurations } = require("./util");
const path = require("path");

module.exports = {
  redis: {
    host: "localhost",
    port: "6379",
    password: "",
    db: process.env.NODE_ENV === "test" ? 1 : 0,
  },
  jwt: {
    secretKey: "pleasedefineyoursecretkeyhere",
    accessTokenExpiration: "24h",
    refreshTokenExpiration: "30d",
  },
  paths: {
    root: path.resolve(__dirname, ".."),
    assets: path.resolve(__dirname, "..", "assets"),
  },
  cloudStorage: {
    cloudUrl: 'https://sicepattesting.s3-ap-southeast-1.amazonaws.com',
    cloudBucket: 'sicepattesting',
    cloudRegion: 'ap-southeast-1',
    cloudAccessKeyId: 'AKIAJHHTEMTLK42N7TQA',
    cloudSecretAccessKey: '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',
  },
  sentry: { dsn: 'http://69d535e3c29a42de850aafd6e04b6e44@sicepat-sentry.eastus.cloudapp.azure.com:9000/3' },
  servers: getAllServerConfigurations("default.js"),
  printerHelper: {
    url: 'http://localhost/tms-printer.php',
  },
};
