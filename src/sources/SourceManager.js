const debug = require('debug')('cgd-SourceManager'),
  Promise = require('bluebird'),

  GeoJSONRegions = require('./ashkyd/GeoJSONRegions'),
  Countries = require('./mledoze/Countries'),

  CldrCore = require('./unicode-cldr/CldrCore'),
  CldrDatesFull = require('./unicode-cldr/CldrDatesFull'),
  CldrLocalNamesFull = require('./unicode-cldr/CldrLocaleNamesFull'),
  CldrNumbersFull = require('./unicode-cldr/CldrNumbersFull');

class SourceManager {

  constructor(options) {
    this._sources = SourceManager.getSources()
      .filter(Klass => Klass.isRequired(options))
      .map(Klass => new Klass());

    this._sourceNames = this.sources.map(s => s.sourceName);
    this._options = options;
  }

  get options() {
    return this._options;
  }

  get sources() {
    return this._sources;
  }

  get sourceNames() {
    return this._sourceNames;
  }

  load() {
    debug('load: started', this.sourceNames);

    return Promise.all(
      this.sources.map(s => s.loadData())
    ).tap(() => debug('load: done', this.sourceNames));
  }

  /**
   * Runs extract on all the sources and returns a Promise.
   * The Promise resolves with the result mapped by source name.
   *
   * @return {Promise}
   */
  extract() {
    debug('Starting extraction', this.sourceNames);

    return Promise.reduce(this.sources,
      (mapOfExtractedContent, source) => source.extract(this.options)
        .then(content => {
          mapOfExtractedContent[source.sourceName] = content;
          return mapOfExtractedContent;
        }),
      {}
    );
  }

  /**
   * Returns an instance of SourceManager
   *
   * @param {Object} options
   * @return {SourceManager}
   */
  static getInstance(options) {
    return new SourceManager(options);
  }

  /**
   * Returns the list of classes extending GitBasedSource
   *
   * @return {GitBasedSource[]}
   */
  static getSources() {
    return [
      GeoJSONRegions,
      Countries,
      CldrCore,
      CldrDatesFull,
      CldrLocalNamesFull,
      CldrNumbersFull
    ];
  }

}

module.exports = SourceManager;
