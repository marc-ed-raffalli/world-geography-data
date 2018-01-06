const debug = require('debug')('cgd-sources-AshKyd-geojsonRegions'),
  path = require('path'),
  cloneDeep = require('lodash/cloneDeep'),

  io = require('../../common/io'),
  arrayUtils = require('../../common/utils').array,
  GitBasedSource = require('../GitBasedSource'),
  dataItems = require('../../constants').dataItems
;

class GeoJSONRegions extends GitBasedSource {

  constructor() {
    super('https://github.com/AshKyd/geojson-regions.git');
  }

  /**
   * This source provides the geometry.
   * Returns true if the config requires a geometry shape.
   *
   * @param  {Object} options
   * @return {Boolean}
   */
  static isRequired(options = {}) {
    if (!options.geometry) return false;

    return GeoJSONRegions.getMapOfWhiteListValues().geometry.indexOf(options.geometry) !== -1;
  }

  /**
   * Returns object with path to supported values
   * @return {Object}
   */
  static getMapOfWhiteListValues() {
    return {
      geometry: dataItems.geometry.map(d => d.value)
    };
  }

  static filterOutFeaturesWithMissingISOId(arr) {
    return arr.filter(feature => {
      if (feature.properties.iso_a2 || feature.properties.iso_a3) return true;
      debug('extract: Warning country without ISO id', feature.properties.name);
    });
  }

  extract(options) {
    debug('extract: started');

    const precision = options.geometry.replace('geoJSON', '');

    return this.getAllCountriesGeoJson(precision)
      .then(res => {
        debug('extract: loaded');

        const extractedData = {
          ...res,
          features: GeoJSONRegions.filterOutFeaturesWithMissingISOId(res.features)
        };

        if (!options._filteredCountries) {
          return extractedData;
        }

        debug('extract: filtering selected countries');
        // improves perf by removing items already found
        // prevents side effects, preserves the original array
        const filteredCountries = cloneDeep(options._filteredCountries),
          removeFeatureIdFromArray = (feature, keyUsedAsId, arr) => {
            return feature.properties[keyUsedAsId] && arrayUtils.removeIfPresent(feature.properties[keyUsedAsId], arr);
          },
          isInSelection = feature => {
            if (removeFeatureIdFromArray(feature, 'iso_a2', filteredCountries.iso_a2)
              || removeFeatureIdFromArray(feature, 'iso_a3', filteredCountries.iso_a3)) {
              return true;
            }
          };

        extractedData.features = extractedData.features.filter(isInSelection);

        return extractedData;
      });
  }

  /**
   * @param {String} precision `110m` | `50m` | `10m`
   * @return {Promise}
   */
  getAllCountriesGeoJson(precision) {
    const allGeoJsonFilePath = path.join(this.git.localPath, `countries/${precision}/all.geojson`);
    return io.json.read(allGeoJsonFilePath);
  }

}

module.exports = GeoJSONRegions;
