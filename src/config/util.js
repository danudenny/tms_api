const fs = require('fs');
const path = require('path');

const util = {
  scanAvailableServers() {
    return fs.readdirSync(path.resolve(path.join(__dirname, '..', 'servers')));
  },
  getAllServerConfigurations(configFileName) {
    const availableServers = util.scanAvailableServers();
    return availableServers.reduce((obj, serverCode) => {
      obj[serverCode] = require(path.resolve(path.join(__dirname, '..', 'servers', serverCode, 'config', configFileName)));
      return obj;
    }, {});
  }
};

module.exports = util;