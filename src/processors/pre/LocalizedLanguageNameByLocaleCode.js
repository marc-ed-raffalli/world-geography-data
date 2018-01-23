const debug = require('debug')('wgd-processors-pre-LocalizedLanguageNameByLocaleCode'),
  Promise = require('bluebird'),
  _Processor = require('../_Processor');

class LocalizedLanguageNameByLocaleCode extends _Processor {

  /**
   * @param {Object} data
   * @return {Promise}
   */
  process(data) {
    const languageByLocale = data.sources['cldr-localenames-full'].language,
      localeCodes = Object.keys(languageByLocale),
      languageByMatchingLocale = localeCodes
        .reduce((res, locale) => {
          if (languageByLocale[locale][locale] !== undefined) {
            res[locale] = languageByLocale[locale][locale];
          }

          return res;
        }, {});

    debug(`matched ${Object.keys(languageByMatchingLocale).length} locales`);

    return Promise.resolve(languageByMatchingLocale);
  }

  static get processorId() {
    return 'localized-language-name-by-locale-code';
  }

}

module.exports = LocalizedLanguageNameByLocaleCode;
