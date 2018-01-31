const debug = require('debug')('wgd-processors-pre-FilterOutCountriesWithoutGeometry'),
  Promise = require('bluebird'),
  LocalizedCountryDataByLocaleCode = require('./LocalizedCountryDataByLocaleCode'),
  PrepareGeoJsonData = require('./PrepareGeoJsonData'),
  _Processor = require('../_Processor');

class FilterOutCountriesWithoutGeometry extends _Processor {

  /**
   * @param {Object} data
   * @return {Promise}
   */
  process(data) {
    debug('process: started');

    const
      countryDataByIsoByLocale = data.processors[LocalizedCountryDataByLocaleCode.processorId],
      countryGeometryByIso2 = data.processors[PrepareGeoJsonData.processorId].features
        .reduce((geoByIso, feature) => ({...geoByIso, [feature.properties.iso_a2]: true}), {});

    function reduceKeepCountriesWithGeometry(countriesByIso) {
      return Object.keys(countriesByIso).reduce((res, iso) => {
        if (countryGeometryByIso2[iso]) {
          res[iso] = countriesByIso[iso];
        }
        return res;
      }, {});
    }

    return Promise.resolve(
      Object.keys(countryDataByIsoByLocale)
        .reduce((res, locale) => ({
          ...res,
          [locale]: reduceKeepCountriesWithGeometry(countryDataByIsoByLocale[locale])
        }), {})
    );
  }

  static get processorId() {
    return 'filter-out-countries-without-geometry';
  }

  /**
   * Priority order of the processor.
   *
   * @return {number}
   */
  static get order() {
    return LocalizedCountryDataByLocaleCode.order + PrepareGeoJsonData.order;
  }
}

module.exports = FilterOutCountriesWithoutGeometry;
