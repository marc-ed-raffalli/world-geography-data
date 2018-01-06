const debug = require('debug')('cgd-sources-CLDR-numbers-full'),
  intersection = require('lodash/intersection'),
  GitBasedSource = require('../GitBasedSource')
;

class CldrNumbersFull extends GitBasedSource {

  constructor() {
    super('https://github.com/unicode-cldr/cldr-numbers-full.git');
  }

  /**
   * This source provides country data.
   * Returns true if at least one item in the config is a valid value.
   *
   * @param  {Object} options
   * @return {Boolean}
   */
  static isRequired(options = {}) {
    if (!options.country) return false;

    const whiteListValues = CldrNumbersFull.getMapOfWhiteListValues();
    return intersection(whiteListValues.country, options.country).length !== 0;
  }

  /**
   * Returns object with path to supported values
   * @return {Object}
   */
  static getMapOfWhiteListValues() {
    return {
      country: [
        'currency'
      ]
    };
  }

}

module.exports = CldrNumbersFull;
