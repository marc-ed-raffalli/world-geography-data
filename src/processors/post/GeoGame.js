const debug = require('debug')('wgd-processors-GeoGame'),
  path = require('path'),
  dashify = require('dashify'),
  Promise = require('bluebird'),
  OutputProcessor = require('../OutputProcessor'),
  io = require('../../common/io'),

  MapTerritoryContainmentByIso = require('../pre/MapTerritoryContainmentByIso'),
  FilterOutCountriesWithoutGeometry = require('../pre/FilterOutCountriesWithoutGeometry'),
  PrepareGeoJsonData = require('../pre/PrepareGeoJsonData'),
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

    const operations = [
      this.outputLanguagesMappedByLocale(data),
      this.outputContinentByLocale(data),
      this.outputLocalizedDataByLocaleByContinent(data),
      this.outputLocalizationStatus(data),
      this.outputGeometry(data)
    ];

    if (this.options.country.indexOf('flag') !== -1) {
      operations.push(this.outputFlags(data));
    }

    return Promise.all(operations)
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

  // quick hack to compute the translation status for the locales
  outputLocalizationStatus(data) {
    const localizationStatusFilePath = path.join(this.outputPath, 'status.json'),
      dataByIsoByContinentByLocale = data.processors[LocalizedCountryDataByIsoByContinentByLocale.processorId],
      namesByIso = data.sources['cldr-localenames-full'].name.en.groups,
      continentKeyByIso = Object.keys(dataByIsoByContinentByLocale.en)
        .reduce((res, continentIso) => ({
          ...res,
          [continentIso]: dashify(namesByIso[continentIso], {condense: true})
        }), {}),

      localizationStatusByContinentByLocale = {},
      computeContinentLocalizationStatus = (localizedContinentData, continentIso) => {
        const isoKeys = Object.keys(localizedContinentData),
          status = isoKeys
            .reduce((status, isoKey) => ({
              capital: localizedContinentData[isoKey].capital ? status.capital + 1 : status.capital
            }), {capital: 0});

        status.countryName = isoKeys.length; // straight...

        if (localizationStatusByContinentByLocale.en) {
          const enStatus = localizationStatusByContinentByLocale.en[continentKeyByIso[continentIso]];

          status.capitalPct = Math.round(100 / enStatus.capital * status.capital);
          status.countryNamePct = Math.round(100 / enStatus.countryName * status.countryName);
          status.capitalMissing = enStatus.capital - status.capital;

          status.table = {
            countryName: [status.countryName, status.countryNamePct],
            capital: [status.capital, status.capitalPct, status.capitalMissing]
          };
        }

        return status;
      },
      computeLocaleStatus = dataByIsoByContinent => {
        const res = Object.keys(dataByIsoByContinent)
          .reduce((statusByContinent, continentIso) => ({
            ...statusByContinent,
            [continentKeyByIso[continentIso]]: computeContinentLocalizationStatus(dataByIsoByContinent[continentIso], continentIso)
          }), {});

        return res;
      };

    debug('outputLocalizationStatus: writing status to', localizationStatusFilePath);

    localizationStatusByContinentByLocale.en = computeLocaleStatus(dataByIsoByContinentByLocale.en);

    const status = Object.keys(dataByIsoByContinentByLocale)
      .filter(locale => locale !== 'en') // en used as reference data, do not compute twice
      .reduce((statusByLocale, locale) => ({
        ...statusByLocale,
        [locale]: computeLocaleStatus(dataByIsoByContinentByLocale[locale])
      }), localizationStatusByContinentByLocale);

    return io.json.write(localizationStatusFilePath, status);
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

  outputFlags(data) {
    debug('outputFlags: started');
    const flagsDirPath = path.join(this.outputPath, 'flags'),
      isoToAlpha3 = data.sources['cldr-core'].codeMappings.isoToAlpha3,
      listOfCountryIso = Object.keys(data.processors[LocalizedCountryDataByLocaleCode.processorId].en),
      copyPromises = [];

    for (let i = 0; i < listOfCountryIso.length; i++) {
      const countryA3 = isoToAlpha3[listOfCountryIso[i]],
        flagPath = countryA3 ? data.sources.countries.flags[countryA3] : undefined;

      if (!flagPath) {
        debug('outputFlags: flag not found for', countryA3, listOfCountryIso[i]);
        continue;
      }

      copyPromises.push(
        io.copy(flagPath, path.join(flagsDirPath, `${countryA3}.svg`))
      );
    }

    return Promise.all(copyPromises)
      .tap(() => debug('outputFlags: done'));
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

      PrepareGeoJsonData,
      FilterOutCountriesWithoutGeometry,
      GeoJsonByContinent
    ];
  }

  static isRequired(options = {}) {
    return super.isRequired(options, GeoGame.processorId);
  }

}

module.exports = GeoGame;
