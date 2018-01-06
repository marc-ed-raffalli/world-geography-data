const _Processor = require('./_Processor');

class OutputProcessor extends _Processor {

  static get preProcessorDependencies() {
    return [];
  }

  static isRequired(options = {}, name) {
    if (!name) return false;

    return !options.processors ? false : options.processors.indexOf(name) !== -1;
  }

}

module.exports = OutputProcessor;
