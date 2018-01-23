const debug = require('debug')('wgd-processors-GeoGame'),
  path = require('path'),
  dashify = require('dashify'),
  Promise = require('bluebird'),
  OutputProcessor = require('../OutputProcessor'),
  io = require('../../common/io'),

  MapTerritoryContainmentByIso = require('../pre/MapTerritoryContainmentByIso'),
  FilterOutCountriesWithoutGeometry = require('../pre/FilterOutCountriesWithoutGeometry'),
  SimplifyGeoJsonData = require('../pre/SimplifyGeoJsonData'),
  GeoJsonByContinent = require('../pre/GeoJsonByContinent'),
  LocalizedLanguageNameByLocaleCode = require('../pre/LocalizedLanguageNameByLocaleCode'),
  LocalizedCapitalByLocaleCode = require('../pre/LocalizedCapitalByLocaleCode'),
  LocalizedCountryDataByIsoByContinentByLocale = require('../pre/LocalizedCountryDataByIsoByContinentByLocale'),
  LocalizedCountryDataByLocaleCode = require('../pre/LocalizedCountryDataByLocaleCode');

class GeoGame extends OutputProcessor {

  constructor(options) {
    super(options);

    this._outputPath = path.join(this.options.destination, 'geo-game');
  }

  get outputPath() {
    return this._outputPath;
  }

  process(data) {
    debug('process: started');

    return Promise.all([
      this.outputLanguagesMappedByLocale(data),
      this.outputContinentByLocale(data),
      this.outputLocalizedDataByLocaleByContinent(data),
      this.outputGeometry(data)
    ])
      .tap(() => debug('process: done'))
      .catch(err => debug('process: error', err));
  }

  /**
   * Outputs the name of languages mapped by locale.
   * Used for language selection menu.
   *
   * @param {Object} data
   * @return {Promise}
   */
  outputLanguagesMappedByLocale(data) {
    const localesFilePath = path.join(this.outputPath, 'locales.json');

    debug('outputLanguagesMappedByLocale: writing locales to', localesFilePath);

    return io.json.write(localesFilePath, data.processors[LocalizedLanguageNameByLocaleCode.processorId]);
  }

  /**
   * Outputs the name of continents mapped by locale.
   * Used for game start screen.
   *
   * @param {Object} data
   * @return {Promise}
   */
  outputContinentByLocale(data) {
    const continentsFilePath = path.join(this.outputPath, 'continents.json'),
      nameByLocale = data.sources['cldr-localenames-full'].name,
      continentIsoToUserReadableKey = {
        '002': 'africa',
        '142': 'asia',
        '150': 'europe',
        '003': 'north-america',
        '005': 'south-america',
        '009': 'oceania'
      },
      continents = Object.keys(continentIsoToUserReadableKey);

    const continentByLocale = Object.keys(nameByLocale).reduce((continentByLocale, locale) => ({
      ...continentByLocale,
      // build continent map by locale
      [locale]: continents.reduce((continentByKey, continentId) => ({
        ...continentByKey,
        // build translated continent name by user readable key
        [continentIsoToUserReadableKey[continentId]]: nameByLocale[locale].groups[continentId]
      }), {})
    }), {});

    // quick starter for game locale files
    // return Promise.all([
    //   Object.keys(continentByLocale).map(locale =>
    //     io.json.write(path.join(this.outputPath, 'continents', `${locale}.json`), {continents: continentByLocale[locale]}))
    // ]);
    return io.json.write(continentsFilePath, continentByLocale);
  }

  /**
   * Outputs localized country data.
   *
   * @param {Object} data
   * @return {Promise}
   */
  outputLocalizedDataByLocaleByContinent(data) {
    debug('outputLocalizedDataByLocaleByContinent: started');

    const
      basePath = path.join(this.outputPath, 'locales'),
      dataByIsoByContinentByLocale = data.processors[LocalizedCountryDataByIsoByContinentByLocale.processorId],
      namesByIso = data.sources['cldr-localenames-full'].name.en.groups,

      writeContinentData = (locale, continentIso) => {
        const fileName = `${dashify(namesByIso[continentIso], {condense: true})}.json`;

        return io.json.write(path.join(basePath, locale, fileName), dataByIsoByContinentByLocale[locale][continentIso]);
      },

      writePromises = Object.keys(dataByIsoByContinentByLocale)
        .reduce((arr, locale) => [
          ...arr,
          Object.keys(dataByIsoByContinentByLocale[locale])
            .map(continent => writeContinentData(locale, continent))
        ], []);

    return Promise.all(writePromises)
      .tap(() => debug('outputLocalizedDataByLocaleByContinent: done'));
  }

  /**
   * Outputs geometry by continent.
   *
   * @param {Object} data
   * @return {Promise}
   */
  outputGeometry(data) {
    const featuresByContinent = data.processors[GeoJsonByContinent.processorId],
      namesByIso = data.sources['cldr-localenames-full'].name.en.groups;

    return Promise.all(
      Object.keys(featuresByContinent)
        .map(continentIso => {
          const fileName = `${dashify(namesByIso[continentIso], {condense: true})}.json`;

          return io.json.write(path.join(this.outputPath, 'geo-json', fileName), featuresByContinent[continentIso]);
        })
    )
      .tap(() => debug('outputGeometry: done'));
  }

  static get processorId() {
    return 'geo-game';
  }

  static get preProcessorDependencies() {
    return [
      MapTerritoryContainmentByIso,
      LocalizedLanguageNameByLocaleCode,
      LocalizedCapitalByLocaleCode,
      LocalizedCountryDataByLocaleCode,
      LocalizedCountryDataByIsoByContinentByLocale,

      SimplifyGeoJsonData,
      FilterOutCountriesWithoutGeometry,
      GeoJsonByContinent
    ];
  }

  static isRequired(options = {}) {
    return super.isRequired(options, GeoGame.processorId);
  }

}

module.exports = GeoGame;
