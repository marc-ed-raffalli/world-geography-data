module.exports = options => {
  if (!options) throw Error('Missing arguments');

  function extractMultipleValues(value) {
    let arr;

    if (typeof value === 'string') {
      arr = value.split(',').map(s => s.trim());
    }
    else if (Array.isArray(value)) {
      arr = value;
    }

    return arr ? arr.sort() : undefined;
  }

  const countries = extractMultipleValues(options.countries),
    locales = extractMultipleValues(options.locales),
    sourceDependencies = [];

  if (options.country) {

    if (options.country.indexOf('languagePopulation') || options.country.indexOf('officialLanguages')) {
      sourceDependencies.push('language');
    }
  }

  return {
    ...options,
    _sourceDependencies: sourceDependencies,
    _filteredCountries: !countries ? undefined : {
      iso_a2: countries.filter(str => str.length === 2),
      iso_a3: countries.filter(str => str.length === 3)
    },
    _targetedLocales: locales ? locales : ['en']
  };
};
