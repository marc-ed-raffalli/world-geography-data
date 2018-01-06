const debug = require('debug')('wgd-core'),
  Promise = require('bluebird'),
  SourceManager = require('./sources/SourceManager'),
  ProcessorManager = require('./processors/ProcessorManager');

module.exports = function (options) {
  debug('Process started with:', options);

  const transformedOptions = require('./api/transform-args')(options),
    sourceManager = SourceManager.getInstance(transformedOptions),
    processorManager = ProcessorManager.getInstance(transformedOptions);

  return sourceManager.load()
    .then(() => sourceManager.extract())
    .tap(console.log('extraction complete'))

    .then(data => processorManager.process({sources: data}))
    .tap(console.log('process complete'))

    .then(() => debug('Processed successfully'))
    .catch(err => debug('Error:', err))
    ;
};
