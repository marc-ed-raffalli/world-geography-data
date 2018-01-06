const expect = require('chai').expect,
  utils = require('./utils');

describe('utils', () => {

  describe('object', () => {

    describe('reverseKeyValueMapping', () => {

      it('returns city names by city ID', () => {
        const reverseMap = utils.object.reverseKeyValueMapping({
          keyA: 'valA',
          keyB: 'valB'
        });

        expect(reverseMap).to.deep.equal({
          'valA': 'keyA',
          'valB': 'keyB'
        });
      });

    });

  });

});

