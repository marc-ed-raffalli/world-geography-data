const uniq = require('lodash/uniq');

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
    locales = extractMultipleValues(options.locales) || ['en'],
    sourceDependencies = [];

  if (options.country) {
    sourceDependencies.push('territoryContainment');

    if (options.country.indexOf('languagePopulation') !== -1 || options.country.indexOf('officialLanguages') !== -1) {
      sourceDependencies.push('language');
    }

    if (options.country.indexOf('capital') !== -1 && locales.indexOf('en') === -1) {
      locales.push('en'); // city name matching is using english as base
    }
  }

  return {
    ...options,
    _sourceDependencies: sourceDependencies,
    _filteredCountries: !countries ? undefined : {
      iso_a2: countries.filter(str => str.length === 2),
      iso_a3: countries.filter(str => str.length === 3)
    },
    _targetedLocales: uniq(locales)
  };
};
