const expect = require('chai').expect,
  CldrNumbersFull = require('./CldrNumbersFull');

describe('CldrNumbersFull', () => {

  describe('isRequired', () => {

    it('returns false when options.country is undefined', () => {
      expect(CldrNumbersFull.isRequired({})).to.be.false;
    });

    it('returns false when options.country does not contain any white listed values', () => {
      expect(CldrNumbersFull.isRequired({country: ['foo']})).to.be.false;
    });

    it('returns true when options.country contains any white listed values', () => {
      const possibleValues = CldrNumbersFull.getMapOfWhiteListValues().country;

      possibleValues.forEach(val => {
        expect(CldrNumbersFull.isRequired({country: [val]})).to.be.true;
      });

      expect(CldrNumbersFull.isRequired({country: possibleValues})).to.be.true;
    });

  });

});

