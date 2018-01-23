const debug = require('debug')('wgd-processors-pre-LocalizedCapitalByLocaleCode'),
  Promise = require('bluebird'),
  objectUtils = require('../../common/utils').object,
  _Processor = require('../_Processor');

class LocalizedCapitalByLocaleCode extends _Processor {

  /**
   * @param {Object} data
   * @return {Promise}
   */
  process(data) {
    const localizedCapitalByIsoByLocale = this.options._targetedLocales
      .reduce((capitalByLocaleByIso, locale) => {
        capitalByLocaleByIso[locale] = LocalizedCapitalByLocaleCode.mapLocalizedCityNameByCountryIso(
          data.sources.countries,
          data.sources['cldr-dates-full'].capital,
          locale
        );

        return capitalByLocaleByIso;
      }, {});

    return Promise.resolve(localizedCapitalByIsoByLocale);
  }

  static mapLocalizedCityNameByCountryIso(countries, localizedCityNamesByLocale, locale) {
    const cityNameToIdMap = objectUtils.reverseKeyValueMapping(localizedCityNamesByLocale.en);

    return countries.reduce((capitalByIso, country) => {
      if (country.cca2) {
        // Country can have multiple capitals in mledoze / countries
        const capital = country.capital.en.find(capital => cityNameToIdMap[capital] !== undefined),
          cityId = cityNameToIdMap[capital];

        // check if the city id has a match in the targeted locale
        if (cityId && localizedCityNamesByLocale[locale][cityId]) {
          capitalByIso[country.cca2] = localizedCityNamesByLocale[locale][cityId];
        }
        else if (locale === 'en') {
          // english fallback from mledoze / countries
          capitalByIso[country.cca2] = country.capital.en[0];
        }
        else {
          debug('process: could not match', country.capital.en, locale);
          capitalByIso._missing.push(country.capital.en);
        }
      }
      else {
        debug('process: missing country.cca2 in', country);
      }

      return capitalByIso;
    }, {_missing: []});
  }

  static get processorId() {
    return 'localized-capital-by-locale-code';
  }

}

module.exports = LocalizedCapitalByLocaleCode;
