switch (process.env.NODE_ENV) {
  case undefined:
    module.exports = require('./ormconfig.local');
    break;
  case 'test':
    module.exports = require('./ormconfig.test');
    break;
  case 'development':
    module.exports = require('./ormconfig.development');
    break;
  case 'production':
    module.exports = require('./ormconfig.production');
    break;
}
