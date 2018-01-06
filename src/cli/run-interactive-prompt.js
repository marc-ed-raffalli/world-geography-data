const inquirer = require('inquirer'),
  dataItems = require('../constants').dataItems
;

module.exports = () => inquirer.prompt([
  {
    type: 'checkbox',
    message: 'Select country info',
    name: 'country',
    // force ISO to be selected
    choices: dataItems.country.map(q => q.value !== 'iso' ? q : {
      ...q,
      checked: true,
      disabled: true
    })
  },
  {
    type: 'list',
    message: 'Select geometry',
    name: 'geometry',
    choices: [
      {
        name: 'None',
        value: false
      }
    ].concat(dataItems.geometry)
  },
  {
    type: 'checkbox',
    message: 'Select calendar info',
    name: 'calendar',
    choices: dataItems.calendar
  },
  {
    type: 'input',
    message: dataItems.locales,
    name: 'locales',
    default: 'en',
    validate: value => value.trim().length !== 0
  },
  {
    type: 'input',
    message: 'Path where to write the output',
    name: 'destination',
    default: 'dist'
  },
  {
    type: 'confirm',
    message: 'Proceed with the above details?',
    name: 'confirm',
    default: true
  }
]);
