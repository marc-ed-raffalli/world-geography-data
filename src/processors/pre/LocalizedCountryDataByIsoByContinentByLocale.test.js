const expect = require('chai').expect,
  MapTerritoryContainmentByIso = require('./MapTerritoryContainmentByIso'),
  LocalizedCountryDataByLocaleCode = require('./LocalizedCountryDataByLocaleCode'),
  LocalizedCountryDataByIsoByContinentByLocale = require('./LocalizedCountryDataByIsoByContinentByLocale');

describe('LocalizedCountryDataByIsoByContinentByLocale', () => {

  let processor;

  beforeEach(() => {
    processor = new LocalizedCountryDataByIsoByContinentByLocale({});
  });

  describe('extract', () => {

    it('returns country data by iso by continent by locale', () => {
      const countryData = {
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
      };

      return processor.process({
        processors: {
          [MapTerritoryContainmentByIso.processorId]: {
            FO: ['001'],
            BR: ['002', '020'],
            BZ: ['002', '021'],
            DD: ['003'] // unused
          },
          [LocalizedCountryDataByLocaleCode.processorId]: {
            en: countryData.en,
            fr: countryData.fr
          }
        }
      })
        .then(res => {
          expect(res).to.deep.equal({
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
          });
        });
    });

  });

});

