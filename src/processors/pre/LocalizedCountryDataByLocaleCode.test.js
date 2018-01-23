const expect = require('chai').expect,
  merge = require('lodash/merge'),
  LocalizedCapitalByLocaleCode = require('./LocalizedCapitalByLocaleCode'),
  MapTerritoryContainmentByIso = require('./MapTerritoryContainmentByIso'),
  LocalizedCountryDataByLocaleCode = require('./LocalizedCountryDataByLocaleCode');

describe('LocalizedCountryDataByLocaleCode', () => {

  let processor,
    mockCountryNamesByIsoByLocale, mockCapitalNamesByIsoByLocale, mockData, mockLocales,
    result;

  function nameByIsoByLocaleGen(isoArr, localeArr, nameGen) {
    return localeArr.reduce((isoMapByLocale, locale) => ({
      ...isoMapByLocale,
      [locale]: isoArr.reduce((nameByIso, iso) => ({
        ...nameByIso,
        [iso]: nameGen(iso, locale)
      }), {})
    }), {});
  }

  beforeEach(() => {
    result = undefined;
    mockLocales = ['en', 'fr'];

    processor = new LocalizedCountryDataByLocaleCode({
      _targetedLocales: mockLocales
    });
  });

  describe('process', () => {

    let mockContinentsByIsoByLocale, mockRegionsByIsoByLocale, mockSubRegionsByIsoByLocale,
      _nameGen = (isoArr, strRoot) => nameByIsoByLocaleGen(isoArr, mockLocales, (iso, locale) => `${strRoot} ${iso} ${locale}`);

    beforeEach(() => {
      const mockIsoArr = ['AA', 'BB', 'CC', 'YY'];
      // YY should be ignored as not associated to any containment info

      mockCountryNamesByIsoByLocale = _nameGen(mockIsoArr, 'Country');
      mockCapitalNamesByIsoByLocale = _nameGen(mockIsoArr, 'Capital');

      // 001
      // 002
      //  - 020
      //  - 021
      // 003
      //  - 030
      //    - 300
      //    - 301
      //  - 031
      //    - 310
      mockContinentsByIsoByLocale = _nameGen(['001', '002', '003', '004'], 'Continent');
      mockRegionsByIsoByLocale = _nameGen(['020', '021', '030', '031'], 'Region');
      mockSubRegionsByIsoByLocale = _nameGen(['300', '301', '310'], 'Sub Region');

      mockData = {
        sources: {
          'cldr-core': {
            territoryContainment: {mock: 'value'}
          },
          'cldr-localenames-full': {
            name: {
              en: {
                all: merge({},
                  mockCountryNamesByIsoByLocale.en,
                  mockContinentsByIsoByLocale.en,
                  mockRegionsByIsoByLocale.en,
                  mockSubRegionsByIsoByLocale.en
                )
              },
              fr: {
                all: merge({},
                  mockCountryNamesByIsoByLocale.fr,
                  mockContinentsByIsoByLocale.fr,
                  mockRegionsByIsoByLocale.fr,
                  mockSubRegionsByIsoByLocale.fr
                )
              }
            }
          }
        },
        processors: {
          [LocalizedCapitalByLocaleCode.processorId]: mockCapitalNamesByIsoByLocale,
          [MapTerritoryContainmentByIso.processorId]: {
            AA: ['001'],
            BB: ['002', '020'],
            CC: ['003', '030', '300'],
            ZZ: ['004'] // should be ignored as not in localized map
          }
        }
      };

    });

    it('returns localized country name, structure (continent, region, ...) and capital by local code', () => {
      const n = mockCountryNamesByIsoByLocale,
        c = mockCapitalNamesByIsoByLocale,
        cont = mockContinentsByIsoByLocale,
        reg = mockRegionsByIsoByLocale,
        sReg = mockSubRegionsByIsoByLocale;

      return processor.process(mockData)
        .then(result => {
          expect(result).to.deep.equal({
            en: {
              AA: {name: n.en.AA, capital: c.en.AA, continent: cont.en['001'], locatedIn: [cont.en['001']]},
              BB: {
                name: n.en.BB,
                capital: c.en.BB,
                continent: cont.en['002'],
                locatedIn: [cont.en['002'], reg.en['020']]
              },
              CC: {
                name: n.en.CC,
                capital: c.en.CC,
                continent: cont.en['003'],
                locatedIn: [cont.en['003'], reg.en['030'], sReg.en['300']]
              }
            },
            fr: {
              AA: {name: n.fr.AA, capital: c.fr.AA, continent: cont.fr['001'], locatedIn: [cont.fr['001']]},
              BB: {
                name: n.fr.BB,
                capital: c.fr.BB,
                continent: cont.fr['002'],
                locatedIn: [cont.fr['002'], reg.fr['020']]
              },
              CC: {
                name: n.fr.CC,
                capital: c.fr.CC,
                continent: cont.fr['003'],
                locatedIn: [cont.fr['003'], reg.fr['030'], sReg.fr['300']]
              }
            }
          });
        });
    });

    it('skips capital if not translated', () => {
      const n = mockCountryNamesByIsoByLocale,
        cont = mockContinentsByIsoByLocale;

      delete mockCapitalNamesByIsoByLocale.en.AA;

      return processor.process(mockData)
        .then(result => {
          expect(result.en.AA).to.deep.equal({name: n.en.AA, continent: cont.en['001'], locatedIn: [cont.en['001']]});
        });
    });

    it('skips countries missing either containment info or translated name', () => {
      return processor.process(mockData)
        .then(result => {
          expect(result.en.YY).to.be.undefined;
          expect(result.en.ZZ).to.be.undefined;
        });
    });

  });

});

