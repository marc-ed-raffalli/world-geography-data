const debug = require('debug')('wgd-processors'),
  Promise = require('bluebird'),
  OutputProcessor = require('./OutputProcessor');

module.exports = function (data) {
  debug('Started');

  return Promise.all([
    require('./post/GeoGame')(data)
  ]);
};

