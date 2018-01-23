const expect = require('chai').expect,
  SimplifyGeoJsonData = require('./SimplifyGeoJsonData'),
  LocalizedCountryDataByLocaleCode = require('./LocalizedCountryDataByLocaleCode'),
  FilterOutCountriesWithoutGeometry = require('./FilterOutCountriesWithoutGeometry');

describe('FilterOutCountriesWithoutGeometry', () => {

  let processor;

  beforeEach(() => {
    processor = new FilterOutCountriesWithoutGeometry({});
  });

  describe('extract', () => {

    it('returns countries with geometry', () => {
      return processor.process({
        processors: {
          [SimplifyGeoJsonData.processorId]: {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              properties: {iso_a2: 'FO'},
              geometry: {type: 'Polygon', coordinates: [1, 2, 3]}
            }, {
              type: 'Feature',
              properties: {iso_a2: 'BR'},
              geometry: {type: 'Polygon', coordinates: [4, 5, 6]}
            }]
          },
          [LocalizedCountryDataByLocaleCode.processorId]: {
            en: {FO: 'country Foo en', BR: 'country Bar en', BZ: 'country Baz en'},
            fr: {FO: 'country Foo fr', BR: 'country Bar fr', BZ: 'country Baz fr'}
          }
        }
      })
        .then(res => {
          expect(res).to.deep.equal({
            en: {FO: 'country Foo en', BR: 'country Bar en'},
            fr: {FO: 'country Foo fr', BR: 'country Bar fr'}
          });
        });
    });

  });

});

