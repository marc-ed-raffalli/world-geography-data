const expect = require('chai').expect,
  LocalizedLanguageNameByLocaleCode = require('./LocalizedLanguageNameByLocaleCode');

describe('LocalizedLanguageNameByLocaleCode', () => {

  let processor;

  beforeEach(() => {
    processor = new LocalizedLanguageNameByLocaleCode({});
  });

  describe('process', () => {

    it('returns the languages mapped to the corresponding locale', () => {
      return processor.process({
        sources: {
          'cldr-localenames-full': {
            language: {
              en: {en: 'english', fo: 'language fo en'},
              fr: {fr: 'français', fo: 'language fo fr'}
            }
          }
        }
      })
        .then(res => {
          expect(res).to.deep.equal({
            en: 'english',
            fr: 'français'
          });
        });
    });

    it('ignores locales with no matching value', () => {
      return processor.process({
        sources: {
          'cldr-localenames-full': {
            language: {
              en: {en: 'english', fo: 'language fo en'},
              fr: {fr: 'français', fo: 'language fo fr'},
              it: {fr: 'francese', fo: 'language fo it'}  // missing it
            }
          }
        }
      })
        .then(res => {
          expect(res).to.deep.equal({
            en: 'english',
            fr: 'français'
          });
        });
    });

  });

});

