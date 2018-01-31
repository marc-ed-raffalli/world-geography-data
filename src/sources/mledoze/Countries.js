const debug = require('debug')('cgd-sources-mledoze-countries'),
  path = require('path'),
  Promise = require('bluebird'),
  intersection = require('lodash/intersection'),
  cloneDeep = require('lodash/cloneDeep'),

  io = require('../../common/io'),
  arrayUtils = require('../../common/utils').array,
  GitBasedSource = require('../GitBasedSource')
;

class Countries extends GitBasedSource {

  constructor() {
    super('https://github.com/mledoze/countries.git');
  }

  /**
   * This source provides most of the country data.
   * Returns true if at least one item in the config is a valid value.
   *
   * @param  {Object} options
   * @return {Boolean}
   */
  static isRequired(options = {}) {
    if (!options.country) return false;

    const whiteListValues = Countries.getMapOfWhiteListValues();
    return intersection(whiteListValues.country, options.country).length !== 0;
  }

  /**
   * Returns object with path to supported values
   * @return {Object}
   */
  static getMapOfWhiteListValues() {
    return {
      country: [
        'area',
        'borders',
        'capital',
        'flag',
        'latlng'
      ]
    };
  }

  static filterOutCountriesWithMissingISOId(arr) {
    return arr.filter(feature => {
      if (feature.cca2 || feature.cca3) return true;
      debug('extract: Warning country without ISO id', feature.name.common);
    });
  }

  static buildExtractedCountryData(options, arr) {
    const mapOfSelectedKeys = Countries.getMapOfWhiteListValues().country
      .reduce((res, key) => ({
          ...res,
          [key]: options.country.indexOf(key) !== -1
        }),
        {});

    return arr.map(c => {
      const res = {};

      if (c.cca2) {
        res.cca2 = c.cca2;
      }
      if (c.cca3) {
        res.cca3 = c.cca3;
      }

      // apply the country data select and build the object

      if (mapOfSelectedKeys.area) {
        res.area = c.area;
      }
      if (mapOfSelectedKeys.borders) {
        res.borders = c.borders;
      }
      if (mapOfSelectedKeys.capital) {
        res.capital = {en: c.capital};
      }
      if (mapOfSelectedKeys.latlng) {
        res.latlng = c.latlng;
      }

      return res;
    });
  }

  extract(options) {
    debug('extract: started');

    function filterCountriesData(res) {
      const allCountriesWithId = Countries.filterOutCountriesWithMissingISOId(res),
        extractedData = Countries.buildExtractedCountryData(options, allCountriesWithId);

      if (!options._filteredCountries) {
        return extractedData;
      }

      debug('extract: filtering selected countries');
      // improves perf by removing items already found
      // prevents side effects, preserves the original array
      const filteredCountries = cloneDeep(options._filteredCountries),
        removeIdFromArrayIfPresent = (country, keyUsedAsId, arr) => {
          return country[keyUsedAsId] && arrayUtils.removeIfPresent(country[keyUsedAsId], arr);
        },
        isInSelection = country => {
          if (removeIdFromArrayIfPresent(country, 'cca2', filteredCountries.iso_a2)
            || removeIdFromArrayIfPresent(country, 'cca3', filteredCountries.iso_a3)) {
            return true;
          }
        };

      return extractedData.filter(isInSelection);
    }

    // TODO implement filter for flags based on _filteredCountries

    return Promise.props({
      countries: this.getAllCountriesData().then(filterCountriesData),
      flags: this.getAllCountriesFlags()
    })
      .tap(() => debug('extract: done'));
  }

  /**
   * @return {Promise}
   */
  getAllCountriesData() {
    const dataFilePath = path.join(this.git.localPath, 'dist/countries.json');
    return io.json.read(dataFilePath);
  }

  /**
   * @return {Promise}
   */
  getAllCountriesFlags() {
    const flagDir = path.join(this.git.localPath, 'data');

    return io.dir.list(flagDir, '**.svg')
      .then(list =>
        list.reduce((flagByIso2, flagPath) => ({
          ...flagByIso2,
          [path.basename(flagPath, '.svg').toLocaleUpperCase()]: path.join(flagDir, flagPath)
        }), {})
      );
  }

}

module.exports = Countries;
