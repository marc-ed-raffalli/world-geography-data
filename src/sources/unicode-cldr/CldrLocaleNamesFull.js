const debug = require('debug')('cgd-sources-CLDR-localeNames-full'),
  Promise = require('bluebird'),
  intersection = require('lodash/intersection'),
  _CldrLocalizedSource = require('./_CldrLocalizedSource')
;

class CldrLocaleNamesFull extends _CldrLocalizedSource {

  constructor() {
    super('https://github.com/unicode-cldr/cldr-localenames-full.git');
  }

  /**
   * This source provides localized names of countries, languages.
   * Returns true if at least one item in the config is a valid value.
   *
   * @param  {Object} options
   * @return {Boolean}
   */
  static isRequired(options = {}) {
    const whiteListValues = CldrLocaleNamesFull.getMapOfWhiteListValues();

    return Object.keys(whiteListValues)
      .some(key => options[key] !== undefined && intersection(whiteListValues[key], options[key]).length !== 0);
  }

  /**
   * Returns object with path to supported values
   * @return {Object}
   */
  static getMapOfWhiteListValues() {
    return {
      _sourceDependencies: ['language'],
      country: [
        'name',
        'borders', // localized names of bordering countries
        'officialLanguages',
        'languagePopulation'
      ]
    };
  }

  extract(options) {
    debug('extract: started');

    const valueToGetterMap = {
        name: locale => this.getTerritoryNames(locale),
        language: locale => this.getLanguageNames(locale)
      },
      targetedValues = options.country.concat(options._sourceDependencies),
      props = this.buildLocalizedExtractionProps(targetedValues, options._targetedLocales, valueToGetterMap);

    return Promise.props(props);
  }

  /**
   * Returns localized country names mapped by country code
   * See `_CldrLocalizedSource` `readLocalizedFile()` for file read strategy
   *
   * @return {Promise}
   */
  getTerritoryNames(locale) {
    debug('getTerritoryNames:', locale);

    return this.readLocalizedFile(locale, 'territories.json')
      .then(data => {
        debug('getTerritoryNames: loaded', locale);

        return data.main[Object.keys(data.main)[0]].localeDisplayNames.territories;
      });
  }

  /**
   * Returns localized language names mapped by language code
   * See `_CldrLocalizedSource` `readLocalizedFile()` for file read strategy
   *
   * @return {Promise}
   */
  getLanguageNames(locale) {
    debug('getLanguageNames:', locale);

    return this.readLocalizedFile(locale, 'languages.json')
      .then(data => {
        debug('getLanguageNames: loaded', locale);

        return data.main[Object.keys(data.main)[0]].localeDisplayNames.languages;
      });
  }

}

module.exports = CldrLocaleNamesFull;
