module.exports = {
  dataItems: {
    country: [
      {
        name: 'Area',
        value: 'area'
      },
      {
        name: 'Bordering countries',
        value: 'borders'
      },
      {
        name: 'Capital city',
        value: 'capital'
      },
      {
        name: 'Coordinates lat/lng',
        value: 'latlng'
      },
      {
        name: 'Country name',
        value: 'name'
      },
      {
        name: 'Currency',
        value: 'currency' // dependency on CLDR numbers
      },
      {
        name: 'ISO code (3)',
        value: 'iso'
      },
      {
        name: 'Literacy',
        value: 'literacy'
      },
      {
        name: 'Most spoken languages (with %)',
        value: 'languagePopulation' // dependency on CLDR LocalNames
      },
      {
        name: 'Numeric code',
        value: 'numericCode'
      },
      {
        name: 'Official language(s)',
        value: 'officialLanguages'  // dependency on CLDR LocalNames
      },
      {
        name: 'Population',
        value: 'population'
      },
      {
        name: 'Telephone code',
        value: 'phoneCode'
      }
    ],
    geometry: [
      {
        name: 'Geo JSON 110m (low resolution)',
        value: 'geoJSON110m'
      },
      {
        name: 'Geo JSON 50m (medium resolution)',
        value: 'geoJSON50m'
      },
      {
        name: 'Geo JSON 10m (high resolution)',
        value: 'geoJSON10m'
      },
      {
        name: 'Topo JSON',
        value: 'topoJSON'
      }
    ],
    calendar: [
      {
        name: 'Week day names',
        value: 'weekDaysNames'
      },
      {
        name: 'Month names',
        value: 'monthNames'
      },
      {
        name: 'First day of the week',
        value: 'firstDay'
      },
      {
        name: 'Weekend start',
        value: 'weekendStart'
      },
      {
        name: 'Weekend end',
        value: 'weekendEnd'
      },
      {
        name: 'Date formats',
        value: 'dateFormats'
      },
      {
        name: 'Time formats',
        value: 'timeFormats'
      }
    ],
    locales: [
      'Output language locales (many: separate with comma) e.g. en-us,fr,es-ve',
      'Locales with region modifier will be defaulted to superset if no match, e.g. es-ve to es'
    ].join('\n'),
    countries: 'Only process countries with the ISO codes provided, 2 or 3 letters (many: separate with comma) e.g. IE,FR,IT'
  }
};
