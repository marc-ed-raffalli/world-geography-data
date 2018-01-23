const debug = require('debug')('wgd-processors-ProcessorManager'),
  Promise = require('bluebird'),
  uniqBy = require('lodash/uniqBy'),
  flatten = require('lodash/flatten');

class ProcessorManager {

  constructor(options = {}) {
    const sortByOrder = (a, b) => a.order - b.order,
      postProcessorClasses = ProcessorManager.getPostProcessors().filter(Klass => Klass.isRequired(options)),
      nonUniqueListOfDepsClasses = flatten(postProcessorClasses.map(Klass => Klass.preProcessorDependencies)),

      orderedPreProcessorClasses = uniqBy(nonUniqueListOfDepsClasses, Klass => Klass.processorId).sort(sortByOrder),
      orderedPostProcessorClasses = postProcessorClasses.sort(sortByOrder);

    this._preProcessors = orderedPreProcessorClasses.map(Klass => new Klass(options));
    this._postProcessors = orderedPostProcessorClasses.map(Klass => new Klass(options));

    debug('constructor: pre-processors', orderedPreProcessorClasses.map(K => K.processorId),
      'post-processors:', orderedPostProcessorClasses.map(K => K.processorId));
  }

  get preProcessors() {
    return this._preProcessors;
  }

  get postProcessors() {
    return this._postProcessors;
  }

  /**
   * Calls the list of pre-processors serially and mutates the object at each step.
   * Sets the resolved value to data.processors[processorId]
   *
   * @param {Object} data
   * @param {Object} data.sources data from sources
   * @return {Promise}
   */
  processDependencies(data) {
    data.processors = {};

    return Promise.each(this.preProcessors,
      processor => processor.process(data)
        .then(content => {
          data.processors[processor.constructor.processorId] = content;
        })
    ).then(() => data);
  }

  /**
   * Output only generates the files to store the interpreted results.
   * Ordered as some processors may depend on previous output to be done.
   *
   * @param data
   * @return {Promise}
   */
  processOutput(data) {
    return Promise.each(this.postProcessors, processor => processor.process(data));
  }

  /**
   * @param data
   * @return {Promise}
   */
  process(data) {
    return this.processDependencies(data)
      .then(d => this.processOutput(d));
  }

  static getPostProcessors() {
    return [
      require('./post/GeoGame')
    ];
  }

  /**
   * Returns an instance of ProcessorManager
   *
   * @param {Object} options
   * @return {ProcessorManager}
   */
  static getInstance(options) {
    return new ProcessorManager(options);
  }

}

module.exports = ProcessorManager;
