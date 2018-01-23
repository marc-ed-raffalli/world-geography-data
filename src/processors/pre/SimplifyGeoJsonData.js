const debug = require('debug')('wgd-processors-pre-SimplifyGeoJsonData'),
  Promise = require('bluebird'),
  _Processor = require('../_Processor');

/**
 * Reduces the geometry properties to local insensitive data.
 * - iso_a2
 * - iso_a3
 * - latlng
 * - area
 */
class SimplifyGeoJsonData extends _Processor {

  /**
   * Removes locale sensitive data from geojson-regions
   * and adds info (area, latlng) from mledoze / countries
   *
   * @param {Object} data
   * @return {Promise}
   */
  process(data) {
    debug('process: started');

    const dataByIso = data.sources.countries.reduce((dataByIso, country) => {
      const info = {
        latlng: country.latlng,
        area: country.area
      };

      return {
        ...dataByIso,
        [country.cca2]: info,
        [country.cca3]: info
      };
    }, {});

    return Promise.resolve({
      type: 'FeatureCollection',
      features: data.sources['geojson-regions'].features
        .map(feature => {
          const isoA2 = feature.properties.iso_a2,
            isoA3 = feature.properties.iso_a3,
            additionalInfo = dataByIso[isoA2] ? dataByIso[isoA2] : dataByIso[isoA3];

          if (!additionalInfo || !Array.isArray(additionalInfo.latlng)) {
            debug('process: cannot find latlng for', isoA2, isoA3, feature.properties.name);
          }

          return {
            ...feature,
            properties: {
              iso_a2: isoA2,
              iso_a3: isoA3,
              latlng: additionalInfo ? additionalInfo.latlng : undefined,
              area: additionalInfo ? additionalInfo.area : undefined
            }
          };
        })
        .filter(feature => {
          const prop = feature.properties;
          // geojson-regions/countries/50m/all.geojson has few entries without iso_a2 / not present in mledoze repo
          // latlng required in game
          return Array.isArray(prop.latlng) && (prop.iso_a2 && isNaN(prop.iso_a2));
        })
    });
  }

  static get processorId() {
    return 'simplify-geojson-data';
  }

}

module.exports = SimplifyGeoJsonData;
