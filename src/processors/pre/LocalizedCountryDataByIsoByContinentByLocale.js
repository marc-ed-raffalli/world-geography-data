const debug = require('debug')('wgd-processors-pre-LocalizedCountryDataByIsoByContinentByLocale'),
  Promise = require('bluebird'),
  MapTerritoryContainmentByIso = require('./MapTerritoryContainmentByIso'),
  LocalizedCountryDataByLocaleCode = require('./LocalizedCountryDataByLocaleCode'),
  _Processor = require('../_Processor');

class LocalizedCountryDataByIsoByContinentByLocale extends _Processor {

  /**
   * @param {Object} data
   * @return {Promise}
   */
  process(data) {
    debug('process: started');

    const
      countryDataByIsoByLocale = data.processors[LocalizedCountryDataByLocaleCode.processorId],
      territoryContainmentByCountryIso = data.processors[MapTerritoryContainmentByIso.processorId],

      getContinentIso = iso => territoryContainmentByCountryIso[iso][0],

      reduceGroupCountryByContinent = countryDataByIso => {
        return Object.keys(countryDataByIso)
          .reduce((res, iso) => {
            const continentIso = getContinentIso(iso);

            if (res[continentIso] === undefined) {
              res[continentIso] = {};
            }

            res[continentIso][iso] = countryDataByIso[iso];

            return res;
          }, {});
      };

    return Promise.resolve(
      Object.keys(countryDataByIsoByLocale)
        .reduce((res, locale) => ({
          ...res,
          [locale]: reduceGroupCountryByContinent(countryDataByIsoByLocale[locale])
        }), {})
    );
  }

  /**
   * Priority order of the processor.
   *
   * @return {number}
   */
  static get order() {
    return LocalizedCountryDataByLocaleCode.order + 1;
  }

  static get processorId() {
    return 'localized-country-data-by-iso-by-continent-by-locale';
  }

}

module.exports = LocalizedCountryDataByIsoByContinentByLocale;
