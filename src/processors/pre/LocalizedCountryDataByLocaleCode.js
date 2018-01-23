const debug = require('debug')('wgd-processors-pre-LocalizedCountryDataByLocaleCode'),
  intersection = require('lodash/intersection'),

  LocalizedCapitalByLocaleCode = require('./LocalizedCapitalByLocaleCode'),
  MapTerritoryContainmentByIso = require('./MapTerritoryContainmentByIso'),
  _Processor = require('../_Processor');

class LocalizedCountryDataByLocaleCode extends _Processor {

  /**
   * @param {Object} data
   * @return {Promise}
   */
  process(data) {
    const
      capitalByIsoByLocale = data.processors[LocalizedCapitalByLocaleCode.processorId],
      territoryContainmentByCountryIso = data.processors[MapTerritoryContainmentByIso.processorId],

      countryNamesByIsoByLocale = data.sources['cldr-localenames-full'].name,
      listOfIsoWithContainmentInfo = Object.keys(territoryContainmentByCountryIso),

      // build an object mapping same locales as for country names
      localizedCountryData = Object.keys(countryNamesByIsoByLocale)
        .reduce((countryDataByIsoByLocale, locale) => {

          // build an object mapping localized country info
          // for the list of country with names and containment info (continent, region, ...)
          countryDataByIsoByLocale[locale] = intersection(Object.keys(countryNamesByIsoByLocale[locale].all), listOfIsoWithContainmentInfo)
            .reduce((countryDataByIso, iso) => {

              // get the translated territory containment info for the current locale
              const locatedIn = territoryContainmentByCountryIso[iso].map(k => countryNamesByIsoByLocale[locale].all[k]);

              countryDataByIso[iso] = {
                name: countryNamesByIsoByLocale[locale].all[iso],
                continent: locatedIn[0],  // sorted array [continent, region, sub-region, ...]
                locatedIn
              };

              if (capitalByIsoByLocale[locale] && capitalByIsoByLocale[locale][iso]) {
                countryDataByIso[iso].capital = capitalByIsoByLocale[locale][iso];
              }
              else {
                debug('process: could not find capital for', iso, locale);
              }

              return countryDataByIso;
            }, {});

          return countryDataByIsoByLocale;
        }, {});

    return Promise.resolve(localizedCountryData);
  }

  /**
   * Priority order of the processor.
   *
   * @return {number}
   */
  static get order() {
    return LocalizedCapitalByLocaleCode.order + MapTerritoryContainmentByIso.order;
  }

  static get processorId() {
    return 'localized-country-data-by-locale-code';
  }

}

module.exports = LocalizedCountryDataByLocaleCode;
