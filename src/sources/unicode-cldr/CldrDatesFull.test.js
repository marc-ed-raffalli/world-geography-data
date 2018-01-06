const expect = require('chai').expect,
  sinon = require('sinon'),
  io = require('../../common/io'),
  CldrDatesFull = require('./CldrDatesFull');

describe('CldrDatesFull', () => {

  let source;

  describe('isRequired', () => {

    it('returns false when options.calendar is undefined', () => {
      expect(CldrDatesFull.isRequired({})).to.be.false;
    });

    it('returns false when options.calendar does not contain any white listed values', () => {
      expect(CldrDatesFull.isRequired({calendar: ['foo']})).to.be.false;
    });

    it('returns true when options.calendar contains any white listed values', () => {
      const possibleValues = CldrDatesFull.getMapOfWhiteListValues().calendar;

      possibleValues.forEach(val => {
        expect(CldrDatesFull.isRequired({calendar: [val]})).to.be.true;
      });

      expect(CldrDatesFull.isRequired({calendar: possibleValues})).to.be.true;
    });

  });

  describe('Localized file read', () => {

    let mockJsonReadValue;

    beforeEach(() => {
      source = new CldrDatesFull();

      // allow mockJsonReadValue to be updated in the test
      sinon.stub(io.json, 'read').callsFake(() => Promise.resolve(mockJsonReadValue));
    });

    afterEach(() => {
      io.json.read.restore();
    });

    describe('getCityNames', () => {

      function setMockData(zones) {
        mockJsonReadValue = {
          main: {
            en: {
              dates: {
                timeZoneNames: {
                  zone: zones
                }
              }
            }
          }
        };
      }

      it('returns localized city names', () => {
        setMockData({
          America: {
            Adak: {
              exemplarCity: 'Adak'
            },
            Argentina: {
              Rio_Gallegos: {
                exemplarCity: 'Rio Gallegos'
              }
            }
          },
          Europe: {
            Amsterdam: {
              exemplarCity: 'Amsterdam'
            }
          }
        });

        return source.getCityNames('en')
          .then(res => {
            expect(res).to.deep.equal({
              Adak: 'Adak',
              Rio_Gallegos: 'Rio Gallegos',
              Amsterdam: 'Amsterdam'
            });
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
      source = new CldrDatesFull();
      options = {country: ['capital'], _targetedLocales: ['en', 'fr']};

      setStubForLocalizedMethod('getCityNames');
    });

    afterEach(() => {
      source.getCityNames.restore();
    });

    it('returns cities mapped by id by locale', () => {
      mockLocalizedNames = {
        en: {fo: 'capital fo en', ba: 'capital ba en'},
        fr: {fo: 'capital fo fr', ba: 'capital ba fr'}
      };

      return source.extract(options)
        .then(res => {
          expect(res.capital).to.deep.equal(mockLocalizedNames);
        });
    });

  });

});

