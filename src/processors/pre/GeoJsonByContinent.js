const debug = require('debug')('wgd-processors-pre-GeoJsonByContinent'),
  Promise = require('bluebird'),
  SimplifyGeoJsonData = require('./SimplifyGeoJsonData'),
  MapTerritoryContainmentByIso = require('./MapTerritoryContainmentByIso'),
  _Processor = require('../_Processor');

class GeoJsonByContinent extends _Processor {

  /**
   * @param {Object} data
   * @return {Promise}
   */
  process(data) {
    debug('process: started');

    const territoryContainmentByCountryIso = data.processors[MapTerritoryContainmentByIso.processorId],
      geoJsonData = data.processors[SimplifyGeoJsonData.processorId];

    return Promise.resolve(
      geoJsonData.features.reduce((featuresByContinent, feature) => {
        const featureIso = feature.properties.iso_a2,
          isoOfContinentHoldingFeature = territoryContainmentByCountryIso[featureIso]
            ? territoryContainmentByCountryIso[featureIso][0] // ordered array
            : undefined;

        if (isoOfContinentHoldingFeature) {

          if (featuresByContinent[isoOfContinentHoldingFeature] === undefined) {
            featuresByContinent[isoOfContinentHoldingFeature] = {
              type: 'FeatureCollection',
              features: []
            };
          }

          featuresByContinent[isoOfContinentHoldingFeature].features.push(feature);
        }

        return featuresByContinent;
      }, {})
    );
  }

  /**
   * Priority order of the processor.
   *
   * @return {number}
   */
  static get order() {
    return SimplifyGeoJsonData.order + 1;
  }

  static get processorId() {
    return 'geojson-by-continent';
  }

}

module.exports = GeoJsonByContinent;
