const expect = require('chai').expect,
  MapTerritoryContainmentByIso = require('./MapTerritoryContainmentByIso'),
  GeoJsonByContinent = require('./GeoJsonByContinent');

describe('GeoJsonByContinent', () => {

  let processor;

  beforeEach(() => {
    processor = new GeoJsonByContinent({});
  });

  describe('extract', () => {

    it('returns geometry by ISO2', () => {
      return processor.process({
        processors: {
          [MapTerritoryContainmentByIso.processorId]: {
            AA: ['001'],
            BB: ['002', '020'],
            CC: ['002', '021'],
            DD: ['003'] // unused
          },
          'simplify-geojson-data': {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              properties: {iso_a2: 'AA'},
              geometry: {type: 'Polygon', coordinates: [1, 2, 3]}
            }, {
              type: 'Feature',
              properties: {iso_a2: 'BB'},
              geometry: {type: 'Polygon', coordinates: [4, 5, 6]}
            }, {
              type: 'Feature',
              properties: {iso_a2: 'CC'},
              geometry: {type: 'Polygon', coordinates: [7, 8, 9]}
            }]
          }
        }
      })
        .then(res => {
          // must keeps the feature properties untouched
          expect(res).to.deep.equal({
            '001': {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                properties: {iso_a2: 'AA'},
                geometry: {type: 'Polygon', coordinates: [1, 2, 3]}
              }]
            },
            '002': {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                properties: {iso_a2: 'BB'},
                geometry: {type: 'Polygon', coordinates: [4, 5, 6]}
              }, {
                type: 'Feature',
                properties: {iso_a2: 'CC'},
                geometry: {type: 'Polygon', coordinates: [7, 8, 9]}
              }]
            }
          });
        });
    });

  });

});

