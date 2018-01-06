const debug = require('debug')('cgd-cli-readArgs');

module.exports = args => {
  debug('extracting params from', args);

  return require('command-line-args')([
    // cli
    {name: 'help', alias: 'h', type: Boolean},
    {name: 'interactive', alias: 'i', type: Boolean},

    // data
    {name: 'country', multiple: true},
    {name: 'calendar', multiple: true},

    // output filter
    {name: 'countries', multiple: true},
    {name: 'locales'},

    // output destination
    {name: 'destination', alias: 'd', defaultValue: 'dist'},
    {name: 'processors', alias: 'p', multiple: true, defaultValue: []}
  ], {argv: args});
};
