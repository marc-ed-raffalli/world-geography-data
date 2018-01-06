const debug = require('debug')('cgd-sources-CLDR-dates-full'),
  Promise = require('bluebird'),
  intersection = require('lodash/intersection'),
  _CldrLocalizedSource = require('./_CldrLocalizedSource')
;

class CldrDatesFull extends _CldrLocalizedSource {

  constructor() {
    super('https://github.com/unicode-cldr/cldr-dates-full.git');
  }

  /**
   * This source provides calendar data.
   * Returns true if at least one item in the config is a valid value.
   *
   * @param  {Object} options
   * @return {Boolean}
   */
  static isRequired(options = {}) {
    const whiteListValues = CldrDatesFull.getMapOfWhiteListValues();
    return Object.keys(whiteListValues)
      .some(key => options[key] !== undefined && intersection(whiteListValues[key], options[key]).length !== 0);
  }

  /**
   * Returns object with path to supported values
   * @return {Object}
   */
  static getMapOfWhiteListValues() {
    return {
      country: ['capital'],
      calendar: [
        'weekDaysNames',
        'monthNames',
        'dateFormats',
        'timeFormats'
      ]
    };
  }

  extract(options) {
    debug('extract: started');

    const valueToGetterMap = {
        capital: locale => this.getCityNames(locale)
      },
      props = this.buildLocalizedExtractionProps(options.country, options._targetedLocales, valueToGetterMap);

    return Promise.props(props);
  }

  /**
   * Returns localized city names from timezone data
   * See `_CldrLocalizedSource` `readLocalizedFile()` for file read strategy
   *
   * @return {Promise}
   */
  getCityNames(locale) {
    debug('getCityNames:', locale);

    return this.readLocalizedFile(locale, 'timeZoneNames.json')
      .then(data => {
        debug('getCityNames: loaded', locale);

        function getExemplarCityRecursively(object, key, depth) {
          if (depth >= 10) {
            debug('getCityNames: too many recursion, check object structure', locale);
            return;
          }

          if (!object) return;

          // zone is the starting object
          if (key !== 'zone' && object !== undefined && object.exemplarCity) {
            res[key] = object.exemplarCity;
            return;
          }

          Object.keys(object)
            .forEach(key => getExemplarCityRecursively(object[key], key, depth + 1));
        }

        const timeZoneNames = data.main[Object.keys(data.main)[0]].dates.timeZoneNames,
          res = {};

        getExemplarCityRecursively(timeZoneNames.zone, 'zone', 0);

        return res;
      });
  }

}

module.exports = CldrDatesFull;
