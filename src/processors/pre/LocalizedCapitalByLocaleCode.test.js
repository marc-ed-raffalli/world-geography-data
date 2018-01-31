const expect = require('chai').expect,
  LocalizedCapitalByLocaleCode = require('./LocalizedCapitalByLocaleCode');

describe('LocalizedCapitalByLocaleCode', () => {

  let processor;

  beforeEach(() => {
    processor = new LocalizedCapitalByLocaleCode({
      _targetedLocales: ['en', 'fr', 'it']
    });
  });

  describe('extract', () => {

    it('returns localized city names', () => {
      return processor.process({
        sources: {
          countries: {
            countries: [
              {cca2: 'FO', capital: {en: ['capital Foo en']}, name: {common: 'Foo'}},
              {cca2: 'BR', capital: {en: ['capital Bar en']}, name: {common: 'Bar'}},
              {cca2: 'BZ', capital: {en: ['capital Baz A en', 'capital Baz B en']}, name: {common: 'Baz'}},
              {capital: {en: ['no cca2 branch']}, name: {common: 'cca2 missing'}}
            ]
          },
          'cldr-dates-full': {
            capital: {
              en: {cityFoo: 'capital Foo en', cityBaz: 'capital Baz B en'}, // bar missing for en fallback
              fr: {cityFoo: 'capital Foo fr', cityBar: 'capital Bar fr', cityBaz: 'capital Baz fr'},
              it: {cityFoo: 'capital Foo it'}  // partial matching
            }
          }
        }
      })
        .then(res => {
          expect(res).to.deep.equal({
            en: {
              FO: 'capital Foo en',
              BR: 'capital Bar en', // fallback
              BZ: 'capital Baz B en',
              _missing: []
            },
            fr: {
              FO: 'capital Foo fr',
              BZ: 'capital Baz fr',
              _missing: [
                ['capital Bar en'] // Bar fr not matched
              ]
            },
            it: {
              FO: 'capital Foo it',
              _missing: [
                ['capital Bar en'],
                ['capital Baz A en', 'capital Baz B en']
              ]
            }
          });
        });
    });

  });

});

