const expect = require('chai').expect,
  sinon = require('sinon'),
  io = require('../../common/io'),
  CldrCore = require('./CldrCore');

describe('CldrCore', () => {

  let source;

  afterEach(() => {
    source = undefined;
  });

  describe('isRequired', () => {

    it('returns false when options.country AND options.calendar are undefined', () => {
      expect(CldrCore.isRequired({})).to.be.false;
    });

    it('returns false when options does not contain any white listed values', () => {
      expect(CldrCore.isRequired({calendar: [], country: ['foo']})).to.be.false;
      expect(CldrCore.isRequired({calendar: ['foo'], country: []})).to.be.false;
    });

    it('returns true when options.country contains any white listed values', () => {
      const possibleValues = CldrCore.getMapOfWhiteListValues().country;

      possibleValues.forEach(val => {
        expect(CldrCore.isRequired({country: [val]})).to.be.true;
      });

      expect(CldrCore.isRequired({country: possibleValues})).to.be.true;
    });

    it('returns true when options.calendar contains any white listed values', () => {
      const possibleValues = CldrCore.getMapOfWhiteListValues().calendar;

      possibleValues.forEach(val => {
        expect(CldrCore.isRequired({calendar: [val]})).to.be.true;
      });

      expect(CldrCore.isRequired({calendar: possibleValues})).to.be.true;
    });

    it('returns true when both options.calendar AND options.country contain any white listed values', () => {
      expect(CldrCore.isRequired(CldrCore.getMapOfWhiteListValues())).to.be.true;
    });

  });

  describe('Core file read', () => {

    let mockJsonReadValue, mockExpectedData;

    beforeEach(() => {
      source = new CldrCore();

      // callsFake function to allow changing value in the test
      sinon.stub(io.json, 'read').callsFake(() => Promise.resolve(mockJsonReadValue));
    });

    afterEach(() => {
      io.json.read.restore();
    });

    describe('getCountryCodesMapping', () => {

      it('returns alpha3 by ISO', () => {
        mockJsonReadValue = {
          supplemental: {
            codeMappings: {
              FO: {
                _alpha3: 'FOO'
              },
              BA: {
                _alpha3: 'BAR'
              }
            }
          }
        };

        return source.getCountryCodesMapping().then((res) => {
          expect(res.alpha3ToIso.FOO).to.equal('FO');
          expect(res.isoToAlpha3.FO).to.equal('FOO');

          expect(res.alpha3ToIso.BAR).to.equal('BA');
          expect(res.isoToAlpha3.BA).to.equal('BAR');
        });
      });

      it('ignores missing alpha3 values', () => {
        mockJsonReadValue = {
          supplemental: {
            codeMappings: {
              FO: {},
              BA: {
                _alpha3: 'BAR'
              }
            }
          }
        };

        return source.getCountryCodesMapping().then((res) => {
          expect(res.alpha3ToIso.FOO).to.be.undefined;
          expect(res.isoToAlpha3.FO).to.be.undefined;

          expect(res.alpha3ToIso.BAR).to.equal('BA');
          expect(res.isoToAlpha3.BA).to.equal('BAR');
        });
      });

      it('interprets key of length 3 as alpha3 values', () => {
        // a set of value has a key of len 3 and no _alpha3 value set
        // "BSD": {
        //   "_numeric": "44"
        // }
        mockJsonReadValue = {
          supplemental: {
            codeMappings: {
              FOO: {},
              BA: {
                _alpha3: 'BAR'
              }
            }
          }
        };

        return source.getCountryCodesMapping().then((res) => {
          expect(res.alpha3ToIso.FOO).to.equal('FOO');
          expect(res.isoToAlpha3.FOO).to.equal('FOO');
        });
      });

    });

    describe('getTerritoryContainments', () => {

      beforeEach(() => {
        mockExpectedData = {
          FOO: {_contains: [1, 2, 3]},
          BAR: {_contains: [4, 5, 6]}
        };

        mockJsonReadValue = {
          supplemental: {
            territoryContainment: {
              ...mockExpectedData,
              'BAR-status-foo': 'Bar'
            }
          }
        };
      });

      it('returns territoryContainment', () => {
        return source.getTerritoryContainments()
          .then(res => {
            expect(res).to.deep.equal({
              FOO: [1, 2, 3],
              BAR: [4, 5, 6]
            });
          });
      });

    });

  });

});

