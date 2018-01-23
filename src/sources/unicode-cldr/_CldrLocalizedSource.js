const debug = require('debug')('cgd-sources-CLDR-localized'),
  path = require('path'),
  Promise = require('bluebird'),
  intersection = require('lodash/intersection'),
  io = require('../../common/io'),
  localeUtils = require('../../common/locale'),
  GitBasedSource = require('../GitBasedSource')
;

class CldrLocalizedSource extends GitBasedSource {

  constructor(url) {
    super(url);
  }

  /**
   * CLDR localized files are stored in folders based on the locale.
   * The first part of the locale is lowercase, the second varies e.g. `az-Cyrl`, `en-150`, `en-US-POSIX`
   * Attempts a read with the local provided, then reads the file matching e.g. `en-us` to `en-US-POSIX`.
   * If no match are listed, will attempt a read using the main locale e.g. `en-FO` to `en`
   *
   * @param {String} locale
   * @param {String} fileName
   * @return {Promise}
   */
  readLocalizedFile(locale, fileName) {
    debug('readLocalizedFile:', locale, fileName);

    const mainLocale = localeUtils.getMainLocale(locale),
      // all main locales are lowercase in CLDR folders
      localeInPath = locale === mainLocale ? locale.toLocaleLowerCase() : locale,
      dataFilePath = path.join(this.git.localPath, 'main', localeInPath, fileName);

    return io.json.read(dataFilePath)
      .catch(err => {
        if (err.code !== 'ENOENT') {
          throw err;
        }

        // file not found,
        // most probable cause is the supplied locale has no case sensitive direct match
        debug('readLocalizedFile:', locale, dataFilePath, 'not found, attempting to find a match');

        return io.dir.list(path.join(this.git.localPath, 'main'), `${locale}**/${fileName}`, {nocase: true})
          .then(matchingPaths => {
            if (matchingPaths.length === 0) {
              debug('readLocalizedFile: no match found for', locale, dataFilePath);
              // there is no match of the current locale value
              // fallback to the main locale e.g. en-IE to en
              if (mainLocale !== locale) {
                debug('readLocalizedFile: attempt fallback to main locale', mainLocale);
                return this.readLocalizedFile(mainLocale, fileName);
              }

              return;
            }

            debug('readLocalizedFile: found match for', locale, fileName, matchingPaths);
            const fallBackPath = path.join(this.git.localPath, 'main', matchingPaths[0]);
            return io.json.read(fallBackPath);
          });
      });
  }

  /**
   *
   * @param targetedValues
   * @param targetedLocales
   * @param valueToGetterMap
   */
  buildLocalizedExtractionProps(targetedValues, targetedLocales, valueToGetterMap) {
    const supportedValues = Object.keys(valueToGetterMap);

    // all values in common are the one to extract
    return intersection(targetedValues, supportedValues)
      .reduce((props, valueKey) => ({
          // build object mapping valueKey to getter value by locale
          // valueKey: {
          //  en: {...}, // getter result
          //  fr: {...}
          // }
          ...props,
          [valueKey]: Promise.reduce(
            targetedLocales,
            (accumulator, locale) => valueToGetterMap[valueKey](locale)
              .then(value => ({
                ...accumulator,
                [locale]: value
              })),
            {})
        }),
        {});
  }
}

module.exports = CldrLocalizedSource;
