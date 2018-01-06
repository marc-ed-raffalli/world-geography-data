const expect = require('chai').expect,
  transformArgs = require('./transform-args');

describe('transform-args', () => {

  describe('countries', () => {

    it('extracts values from string (CLI)', () => {
      const args = transformArgs({countries: 'FOO,BAR,BZ'});

      expect(args._filteredCountries).to.deep.equal({
        iso_a2: ['BZ'],
        iso_a3: ['BAR', 'FOO'] // sorted
      });
    });

    it('extracts values from array', () => {
      const args = transformArgs({countries: ['FOO', 'BAR', 'BZ']});

      expect(args._filteredCountries).to.deep.equal({
        iso_a2: ['BZ'],
        iso_a3: ['BAR', 'FOO']
      });
    });

  });

  describe('locales', () => {

    it('extracts values from string (CLI)', () => {
      const args = transformArgs({locales: 'fo-BA,bz'});

      expect(args._targetedLocales).to.deep.equal(['bz', 'fo-BA']);
    });

    it('extracts values from array', () => {
      const args = transformArgs({locales: ['bz', 'fo-BA']});

      expect(args._targetedLocales).to.deep.equal(['bz', 'fo-BA']);
    });

  });

  describe('Sources dependencies', () => {

    it('languagePopulation and officialLanguages adds dependency to language', () => {
      expect(transformArgs({country: ['languagePopulation']})._sourceDependencies).to.include('language');
      expect(transformArgs({country: ['officialLanguages']})._sourceDependencies).to.include('language');
      expect(transformArgs({country: ['officialLanguages', 'officialLanguages']})._sourceDependencies).to.include('language');
    });

  });

});

