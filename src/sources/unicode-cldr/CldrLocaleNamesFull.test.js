const expect = require('chai').expect,
  sinon = require('sinon'),
  io = require('../../common/io'),
  CldrLocaleNamesFull = require('./CldrLocaleNamesFull');

describe('CldrLocaleNamesFull', () => {

  let source;

  describe('isRequired', () => {

    it('returns false when options.country is undefined', () => {
      expect(CldrLocaleNamesFull.isRequired({})).to.be.false;
    });

    it('returns false when options.country does not contain any white listed values', () => {
      expect(CldrLocaleNamesFull.isRequired({country: ['foo']})).to.be.false;
      expect(CldrLocaleNamesFull.isRequired({_sourceDependencies: ['foo']})).to.be.false;
    });

    it('returns true when options contains any white listed values', () => {
      const whiteListValues = CldrLocaleNamesFull.getMapOfWhiteListValues();

      whiteListValues.country.forEach(val => {
        expect(CldrLocaleNamesFull.isRequired({country: [val]})).to.be.true;
      });

      expect(CldrLocaleNamesFull.isRequired({_sourceDependencies: whiteListValues._sourceDependencies})).to.be.true;
      expect(CldrLocaleNamesFull.isRequired({country: whiteListValues.country})).to.be.true;
    });

  });

  describe('Localized file read', () => {

    let mockJsonReadValue, mockExpectedData;

    beforeEach(() => {
      source = new CldrLocaleNamesFull();

      // allow mockJsonReadValue to be updated in the test
      sinon.stub(io.json, 'read').callsFake(() => Promise.resolve(mockJsonReadValue));
    });

    afterEach(() => {
      io.json.read.restore();
    });

    describe('getTerritoryNames', () => {

      beforeEach(() => {
        mockExpectedData = {
          all: {
            '001': 'Group 1',
            '123': 'Group 123',
            FO: 'fo en',
            BA: 'ba en',
            'FO-alt-short': 'fo short en'
          },
          territories: {
            FO: 'fo en',
            BA: 'ba en'
          },
          groups: {
            '001': 'Group 1',
            '123': 'Group 123'
          }
        };
        mockJsonReadValue = {
          main: {
            en: {
              localeDisplayNames: {
                territories: {
                  ...mockExpectedData.territories,
                  ...mockExpectedData.groups,
                  'FO-alt-short': 'fo short en'
                }
              }
            }
          }
        };
      });

      it('returns localeDisplayNames.territories', () => {
        return source.getTerritoryNames('en')
          .then(res => {
            expect(res).to.deep.equal(mockExpectedData);
          });
      });

    });

    describe('getLanguageNames', () => {

      beforeEach(() => {
        mockExpectedData = {FO: 'fo en', BA: 'ba en'};
        mockJsonReadValue = {
          main: {
            en: {
              localeDisplayNames: {
                languages: mockExpectedData
              }
            }
          }
        };
      });

      it('returns localeDisplayNames.languages', () => {
        return source.getLanguageNames('en')
          .then(res => {
            expect(res).to.deep.equal(mockExpectedData);
          });
      });

    });

  });

  describe('extract', () => {

    let mockLocalizedNames, options;

    function setStubForLocalizedMethod(methodName) {
      const stub = sinon.stub(source, methodName);
      stub.withArgs('en').callsFake(() => Promise.resolve(mockLocalizedNames.en));
      stub.withArgs('fr').callsFake(() => Promise.resolve(mockLocalizedNames.fr));
      stub.throws();
    }

    beforeEach(() => {
      source = new CldrLocaleNamesFull();
      options = {country: [], _targetedLocales: ['en', 'fr']};

      setStubForLocalizedMethod('getTerritoryNames');
      setStubForLocalizedMethod('getLanguageNames');
    });

    afterEach(() => {
      source.getTerritoryNames.restore();
      source.getLanguageNames.restore();
    });

    it('returns territories mapped by locale', () => {
      options.country = ['name'];
      mockLocalizedNames = {
        en: {fo: 'country fo en', ba: 'country ba en'},
        fr: {fo: 'country fo fr', ba: 'country ba fr'}
      };

      return source.extract(options)
        .then(res => {
          expect(res.name).to.deep.equal(mockLocalizedNames);
        });
    });

    it('returns language mapped by locale', () => {
      options._sourceDependencies = ['language'];
      mockLocalizedNames = {
        en: {fo: 'language fo en', ba: 'language ba en'},
        fr: {fo: 'language fo fr', ba: 'language ba fr'}
      };

      return source.extract(options)
        .then(res => {
          expect(res.language).to.deep.equal(mockLocalizedNames);
        });
    });

  });

});

