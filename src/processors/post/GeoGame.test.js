const expect = require('chai').expect,
  path = require('path'),
  sinon = require('sinon'),
  io = require('../../common/io'),
  GeoJsonByContinent = require('../pre/GeoJsonByContinent'),
  LocalizedCountryDataByIsoByContinentByLocale = require('../pre/LocalizedCountryDataByIsoByContinentByLocale'),
  LocalizedLanguageNameByLocaleCode = require('../pre/LocalizedLanguageNameByLocaleCode'),
  LocalizedCountryDataByLocaleCode = require('../pre/LocalizedCountryDataByLocaleCode'),
  GeoGame = require('./GeoGame');

describe('GeoGame', () => {

  let processor;

  beforeEach(() => {
    processor = new GeoGame({destination: 'dist'}); // default value
  });

  afterEach(() => {
    io.json.write.restore && io.json.write.restore();
  });

  describe('outputLanguagesMappedByLocale', () => {

    it('writes file dist/geo-game/locales.json', () => {
      const expectedPath = path.join('dist', 'geo-game', 'locales.json'),
        expectedData = {
          en: 'english',
          fr: 'français'
        },
        data = {
          processors: {
            [LocalizedLanguageNameByLocaleCode.processorId]: expectedData
          }
        };

      sinon.stub(io.json, 'write').resolves(1);

      return processor.outputLanguagesMappedByLocale(data)
        .then(res => {
          expect(io.json.write.calledWithExactly(expectedPath, expectedData)).to.be.true;
          expect(res).to.equal(1);
        });
    });

  });

  describe('outputContinentByLocale', () => {

    function nameByIsoByLocaleGen(isoArr, localeArr, nameGen) {
      return localeArr.reduce((isoMapByLocale, locale) => ({
        ...isoMapByLocale,
        [locale]: isoArr.reduce((nameByIso, iso) => ({
          ...nameByIso,
          [iso]: nameGen(iso, locale)
        }), {})
      }), {});
    }

    it('writes file dist/geo-game/continents.json', () => {
      const expectedPath = path.join('dist', 'geo-game', 'continents.json'),
        continents = [
          '002', // Africa
          '142', // Asia
          '150', // Europe,
          '003', // North America
          '005', // South America
          '009' // Oceania
        ],
        expectedData = nameByIsoByLocaleGen(continents, ['en', 'fr'], (iso, locale) => `${iso} ${locale}`),
        data = {
          sources: {
            'cldr-localenames-full': {
              name: {
                en: {groups: expectedData.en},
                fr: {groups: expectedData.fr}
              }
            }
          }
        };

      sinon.stub(io.json, 'write').resolves(1);

      return processor.outputContinentByLocale(data)
        .then(res => {
          expect(io.json.write.calledWithMatch(expectedPath, {
            en: {
              africa: expectedData.en['002'],
              asia: expectedData.en['142'],
              europe: expectedData.en['150'],
              'north-america': expectedData.en['003'],
              'south-america': expectedData.en['005'],
              oceania: expectedData.en['009']
            },
            fr: {
              africa: expectedData.fr['002'],
              asia: expectedData.fr['142'],
              europe: expectedData.fr['150'],
              'north-america': expectedData.fr['003'],
              'south-america': expectedData.fr['005'],
              oceania: expectedData.fr['009']
            }
          })).to.be.true;
          expect(res).to.equal(1);
        });
    });

  });

  describe('outputLocalizedDataByLocaleByContinent', () => {

    it('writes file for each locale dist/geo-game/data/{locale}/{continent}.json', () => {
      const
        expectedPath = path.join('dist', 'geo-game', 'locales'),
        countryData = {
          en: {
            FO: {name: 'country Foo en'},
            BR: {name: 'country Bar en'},
            BZ: {name: 'country Baz en'}
          },
          fr: {
            FO: {name: 'country Foo fr'},
            BR: {name: 'country Bar fr'},
            BZ: {name: 'country Baz fr'}
          }
        },
        expectedData = {
          en: {
            '001': {
              FO: countryData.en.FO
            },
            '002': {
              BR: countryData.en.BR,
              BZ: countryData.en.BZ
            }
          },
          fr: {
            '001': {
              FO: countryData.fr.FO
            },
            '002': {
              BR: countryData.fr.BR,
              BZ: countryData.fr.BZ
            }
          }
        },
        data = {
          sources: {
            'cldr-localenames-full': {
              name: {
                en: {
                  groups: {
                    '001': 'Aaa-Aa',
                    '002': 'Bbb'
                  }
                }
              }
            }
          },
          processors: {
            [LocalizedCountryDataByIsoByContinentByLocale.processorId]: expectedData
          }
        };

      sinon.stub(io.json, 'write').resolves();

      return processor.outputLocalizedDataByLocaleByContinent(data)
        .then(() => {
          expect(io.json.write.calledWithMatch(path.join(expectedPath, 'en', 'aaa-aa.json'), expectedData.en['001'])).to.be.true;
          expect(io.json.write.calledWithMatch(path.join(expectedPath, 'en', 'bbb.json'), expectedData.en['002'])).to.be.true;

          // keep the english name for the file
          expect(io.json.write.calledWithMatch(path.join(expectedPath, 'fr', 'aaa-aa.json'), expectedData.fr['001'])).to.be.true;
          expect(io.json.write.calledWithMatch(path.join(expectedPath, 'fr', 'bbb.json'), expectedData.fr['002'])).to.be.true;
        });
    });

  });

  describe('outputGeometry', () => {

    it('writes file for each continent to dist/geo-game/geometry/{continent-name}.json', () => {
      const expectedPath = path.join('dist', 'geo-game', 'geo-json'),
        expectedDataByContinentIso = {
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
        },
        data = {
          sources: {
            'cldr-localenames-full': {
              name: {
                en: {
                  groups: {
                    '001': 'Foo (bar)',
                    '002': 'Baz'
                  }
                }
              }
            }
          },
          processors: {
            [GeoJsonByContinent.processorId]: expectedDataByContinentIso
          }
        };

      sinon.stub(io.json, 'write').resolves();

      return processor.outputGeometry(data)
        .then(() => {
          expect(io.json.write.calledWithExactly(path.join(expectedPath, 'foo-bar.json'), expectedDataByContinentIso['001'])).to.be.true;
          expect(io.json.write.calledWithExactly(path.join(expectedPath, 'baz.json'), expectedDataByContinentIso['002'])).to.be.true;
        });
    });

  });

  describe('outputFlags', () => {

    beforeEach(() => {
      sinon.stub(io, 'copy').resolves();
    });

    afterEach(() => {
      io.copy.restore();
    });

    it('output all flags to dist/geo-game/flags/{iso_a2}.svg', () => {
      const expectedPath = path.join('dist', 'geo-game', 'flags'),
        flags = [
          'some/path/to/aaa.svg',
          'some/path/to/bbb.svg',
          'some/path/to/ccc.svg'
        ];

      return processor.outputFlags({
        sources: {
          'cldr-core': {
            codeMappings: {
              isoToAlpha3: {
                AA: 'AAA',
                BB: 'BBB'
              }
            }
          },
          countries: {
            flags: {
              AAA: flags[0],
              BBB: flags[1],
              CCC: flags[2]
            }
          }
        },
        processors: {
          [LocalizedCountryDataByLocaleCode.processorId]: {
            en: {AA: 'country Aa en', BB: 'country Bb en', CC: 'country Cc en'}
          }
        }
      })
        .then(() => {
          expect(io.copy.calledWithExactly(flags[0], path.join(expectedPath, 'AA.svg')));
          expect(io.copy.calledWithExactly(flags[1], path.join(expectedPath, 'BB.svg')));
        });
    });

  });

});

