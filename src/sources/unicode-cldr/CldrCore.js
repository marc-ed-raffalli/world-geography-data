const debug = require('debug')('cgd-sources-CLDR-core'),
  intersection = require('lodash/intersection'),
  path = require('path'),
  Promise = require('bluebird'),
  io = require('../../common/io'),
  GitBasedSource = require('../GitBasedSource')
;

class CldrCore extends GitBasedSource {

  constructor() {
    super('https://github.com/unicode-cldr/cldr-core.git');
  }

  /**
   * This source provides calendar and country data.
   * Returns true if at least one item in the config is a valid value.
   *
   * @param  {Object} options
   * @return {Boolean}
   */
  static isRequired(options = {}) {
    const whiteListValues = CldrCore.getMapOfWhiteListValues();
    return Object.keys(whiteListValues)
      .some(key => options[key] !== undefined && intersection(whiteListValues[key], options[key]).length !== 0);
  }

  /**
   * Returns object with path to supported values
   * @return {Object}
   */
  static getMapOfWhiteListValues() {
    return {
      country: [
        'iso',
        'numericCode',
        'phoneCode',
        'population',
        'literacy',
        'officialLanguages',
        'languagePopulation',
        'currency'
      ],
      calendar: [
        'firstDay',
        'weekendStart',
        'weekendEnd'
      ]
    };
  }

  extract(options) {
    debug('extract:');

    return Promise.props({
      codeMappings: this.getCountryCodesMapping()
    });
  }

  getCountryCodesMapping() {
    debug('getCountryCodesMapping: started');

    const codeMappingsFilePath = path.join(this.git.localPath, 'supplemental/codeMappings.json');

    return io.json.read(codeMappingsFilePath)
      .then(data => {
        const mappings = data.supplemental.codeMappings,
          isoKeys = Object.keys(mappings),
          base = {
            isoToAlpha3: {},
            alpha3ToIso: {}
          };

        return isoKeys.reduce((res, key) => {
          const alpha3 = key.length === 3 && !mappings[key]._alpha3 ? key : mappings[key]._alpha3;

          if (alpha3) {
            res.alpha3ToIso[alpha3] = key;
            res.isoToAlpha3[key] = alpha3;
          }
          else {
            debug('getCountryCodesMapping: missing _alpha3 for', key);
          }

          return res;
        }, base);
      });
  }

}

module.exports = CldrCore;
