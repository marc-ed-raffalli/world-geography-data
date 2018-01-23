const debug = require('debug')('wgd-processors-pre-MapTerritoryContainmentByIso'),
  Promise = require('bluebird'),
  _Processor = require('../_Processor');

class MapTerritoryContainmentByIso extends _Processor {

  /**
   * @param {Object} data
   * @return {Promise}
   */
  process(data) {
    debug('process: started');

    const continents = [
      '002', // Africa
      '003', // North America
      '005', // South America
      '009', // Oceania
      '142', // Asia
      '150' // Europe
    ];

    return Promise.resolve(
      MapTerritoryContainmentByIso.getRegionStructureByIso(data.sources['cldr-core'].territoryContainment, continents)
    );
  }

  /**
   * Inverses the mapping of territoryContainment.
   * Returns a flattened array by ISO of the containment from the level of the provided roots
   *
   * @param territoryContainment
   * @param roots {Array<String>}
   * @return {Object}
   */
  static getRegionStructureByIso(territoryContainment, roots) {
    // expected structure is an array of child by iso on multi levels:
    // 000: ['111', '222']
    // 111: ['AA']
    // 222: ['333']
    // 333: ['BB', 'CC']

    const groupRegex = /^[0-9]{3}$/,
      territoryRegex = /^[A-Z]{2}$/,
      structureDepthByIso = {},
      depthFirstRecursive = (childArr, accumulator = []) => {
        if (!childArr) return;

        if (groupRegex.test(childArr[0])) {
          // array of sub groups
          return childArr.forEach(groupId => depthFirstRecursive(territoryContainment[groupId], [...accumulator, groupId]));
        }

        if (territoryRegex.test(childArr[0])) {
          // array of territory iso
          childArr.forEach(iso => {
            structureDepthByIso[iso] = accumulator.slice();
          });
        }
      };

    roots.forEach(continentId => depthFirstRecursive(territoryContainment[continentId], [continentId]));

    return structureDepthByIso;
  }

  static get processorId() {
    return 'map-territory-containment-by-iso';
  }

}

module.exports = MapTerritoryContainmentByIso;
