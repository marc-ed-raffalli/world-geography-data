const expect = require('chai').expect,
  sinon = require('sinon'),
  cloneDeep = require('lodash/cloneDeep'),
  Countries = require('./Countries');

describe('Countries', () => {

  let source;

  describe('isRequired', () => {

    it('returns false when options is not a white listed value', () => {
      expect(Countries.isRequired({})).to.be.false;
      expect(Countries.isRequired({country: ['foo']})).to.be.false;
    });

    it('returns true when options.country contains any white listed values', () => {
      const possibleValues = Countries.getMapOfWhiteListValues().country;

      possibleValues.forEach(val => {
        expect(Countries.isRequired({country: [val]})).to.be.true;
      });

      expect(Countries.isRequired({country: possibleValues})).to.be.true;
    });

  });

  describe('extract', () => {

    let mockAllCountriesData, options;

    beforeEach(() => {
      source = new Countries();
      // select nothing except the default ids
      options = {country: []};

      sinon.stub(source, 'getAllCountriesData').callsFake(() => Promise.resolve(mockAllCountriesData));
    });

    afterEach(() => {
      source.getAllCountriesData.restore();
    });

    it('returns data from getAllCountriesData', () => {
      mockAllCountriesData = [
        {cca2: 'FO', cca3: 'FOO'}
      ];

      return source.extract(options)
        .then(res => {
          expect(res).to.deep.equal(mockAllCountriesData);
          expect(source.getAllCountriesData.calledOnce).to.be.true;
        });
    });

    it('filters out countries not in provided options._filteredCountries', () => {
      mockAllCountriesData = [
        {cca2: 'FO', cca3: 'FOO'},
        {cca2: 'BA', cca3: 'BAR'},
        {cca2: 'BZ', cca3: 'BAZ'}
      ];
      options._filteredCountries = {
        iso_a2: ['FO'],
        iso_a3: ['BAR']
      };

      return source.extract(options)
        .then(res => {
          expect(res).to.deep.equal([
            {cca2: 'FO', cca3: 'FOO'},
            {cca2: 'BA', cca3: 'BAR'}
          ]);
          expect(source.getAllCountriesData.calledOnce).to.be.true;
        });
    });

    it('ignores countries without cca2 AND cca3', () => {
      mockAllCountriesData = [
        {cca2: 'FO', cca3: 'FOO', name: {common: 'Foo'}},
        {cca2: 'BA', cca3: 'BAR', name: {common: 'Bar'}},
        {name: {common: 'Baz'}}
      ];

      return source.extract(options)
        .then(res => {
          expect(res).to.deep.equal([
            {cca2: 'FO', cca3: 'FOO'},
            {cca2: 'BA', cca3: 'BAR'}
          ]);
          expect(source.getAllCountriesData.calledOnce).to.be.true;
        });
    });

    it('does not mutate the provided options object', () => {
      options._filteredCountries = {
        iso_a2: ['FO'],
        iso_a3: ['BAR']
      };

      const controlObject = cloneDeep(options);

      return source.extract(options)
        .then(() => {
          expect(options).to.deep.equal(controlObject);
        });
    });

    describe('targeted data', () => {

      beforeEach(() => {
        mockAllCountriesData = [
          // @formatter:off
          {cca3: 'FOO', area: 1, latlng: [1, 1], borders: ['Foo borders'], capital: 'Foo capital', name: {common: 'Foo'}},
          {cca3: 'BAR', area: 2, latlng: [2, 2], borders: ['Bar borders'], capital: 'Bar capital', name: {common: 'Bar'}},
          {cca3: 'BAZ', area: 3, latlng: [3, 3], borders: ['Baz borders'], capital: 'Baz capital', name: {common: 'Baz'}}
          // @formatter:on
        ];
      });

      function test(name, f, options) {
        it(name, () => {
          const expectedOutput = mockAllCountriesData.map(f);

          return source.extract(options)
            .then(res => {
              expect(res).to.deep.equal(expectedOutput);
            });
        });
      }

      test('returns latlng', c => ({cca3: c.cca3, latlng: c.latlng}), {country: ['latlng']});

      test('returns borders', c => ({cca3: c.cca3, borders: c.borders}), {country: ['borders']});

      test('returns area', c => ({cca3: c.cca3, area: c.area}), {country: ['area']});

      test('returns capital as capital: {en: capitalValue}',
        c => ({
          cca3: c.cca3,
          capital: {en: c.capital}
        }),
        {country: ['capital']}
      );

      test('returns all',
        c => ({
          cca3: c.cca3,
          area: c.area,
          borders: c.borders,
          capital: {en: c.capital},
          latlng: c.latlng
        }),
        Countries.getMapOfWhiteListValues()
      );

    });

  });

});

