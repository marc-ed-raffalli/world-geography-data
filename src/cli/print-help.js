const cliUsage = require('command-line-usage'),
  dataItems = require('../constants').dataItems,

  toBulletList = arr => arr.map(i => ({name: '• ' + i.value, description: i.name}))
;

module.exports = () => {

  const help = [
    {
      header: 'World Geography data builder',
      content: [
        'This script helps you to build a tailored data set based on your country data selection.',
        '',
        'The data available is coming from the following sources:'
      ]
    },
    {
      content: [
        {name: '• CLDR', repo: '[italic]{https://github.com/unicode-cldr}'},
        {name: '• AshKyd / geojson-regions', repo: '[italic]{https://github.com/AshKyd/geojson-regions}'},
        {name: '• mledoze / countries', repo: '[italic]{https://github.com/mledoze/countries}'}
      ]
    },
    {
      header: 'Options',
      optionList: [
        {
          name: 'help',
          alias: 'h',
          description: 'Display this usage guide.'
        },
        {
          name: 'interactive',
          alias: 'i',
          description: 'Start the interactive prompt to build a configuration.'
        },
        {
          name: 'country',
          description: 'Country data to collect.'
        },
        {
          name: 'geometry',
          description: 'Country geometry shape to collect.'
        },
        {
          name: 'calendar',
          description: 'Calendar data to collect.'
        },
        {
          name: 'locales',
          description: dataItems.locales
        },
        {
          name: 'countries',
          description: dataItems.countries
        },
        {
          name: 'destination',
          alias: 'd',
          description: 'Path where to write the output (default: [italic]{dist})'
        }
      ]
    },
    {
      header: 'geometry',
      content: toBulletList(dataItems.geometry)
    }
  ].concat(
    ['country', 'calendar']
      .map(itemKey => ({
        header: itemKey,
        content: toBulletList(dataItems[itemKey])
      }))
  );

  console.log(cliUsage(help));
};
