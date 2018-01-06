const debug = require('debug')('wgd-processors-Processor'),
  Promise = require('bluebird');

class _Processor {

  constructor(options) {
    this._options = options;
  }

  get options() {
    return this._options;
  }

  /**
   * Must be implemented.
   *
   * @param {Object} data
   * @return {Promise}
   */
  process(data) {
    return Promise.reject('Not implemented');
  }

  static get order() {
    return 1;
  }

  /**
   * Getter for processor id static constant.
   * Must be implemented.
   *
   * @return {String}
   */
  static get processorId() {
    throw Error('Missing processor ID');
  }

}

module.exports = _Processor;
