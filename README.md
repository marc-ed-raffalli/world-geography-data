# World Geography Data

Gathers geography related data from different sources and merge it to different formats.


## Sources


### AshKyd/geojson-regions

https://github.com/AshKyd/geojson-regions

Country GeoJSON with following precision:
- [x] 10m
- [x] 50m
- [x] 110m

### mledoze / countries

https://github.com/mledoze/countries

- [x] area
- [x] borders
- [x] capital city (en only)
- [x] latlng
- [] geo.json
- [] topo.json
- [] svg flag

### CLDR - Unicode Common Locale Data Repository

- XML  [CLDR downloads](http://cldr.unicode.org/index/downloads)
- JSON [Github](https://github.com/unicode-cldr), 
  *[repos structure]([Github](https://github.com/unicode-cldr/cldr-json))*

#### cldr-core

https://github.com/unicode-cldr/cldr-core.git

- [x] country ISO code
  https://github.com/unicode-cldr/cldr-core/blob/master/supplemental/codeMappings.json
  
- [x] currency data: period of usage
  https://github.com/unicode-cldr/cldr-core/blob/master/supplemental/currencyData.json
  
- [x] telephone country codes
  https://github.com/unicode-cldr/cldr-core/blob/master/supplemental/telephoneCodeData.json
  
- territory grouping (e.g. EU, UN)
  https://github.com/unicode-cldr/cldr-core/blob/master/supplemental/territoryContainment.json
  
- info:
    - [x] population
    - [x] literacy %
    - [x] language 
          - population %
          - status: official / regional official
  https://github.com/unicode-cldr/cldr-core/blob/master/supplemental/territoryInfo.json
  
- week data:
    - [x] first day
    - [x] weekend start/end
  https://github.com/unicode-cldr/cldr-core/blob/master/supplemental/weekData.json
    
#### cldr-dates-full

https://github.com/unicode-cldr/cldr-dates-full.git

- Gregorian calendar:
    - [x] month
    - [x] day
    - [x] dateFormats
    - [x] timeFormats
  https://github.com/unicode-cldr/cldr-dates-full/blob/master/main/fr/ca-gregorian.json
  
#### cldr-localenames-full

https://github.com/unicode-cldr/cldr-localenames-full.git

- [x] localized language names
  https://github.com/unicode-cldr/cldr-localenames-full/blob/master/main/fr/languages.json
  
- [] localized script names
  https://github.com/unicode-cldr/cldr-localenames-full/blob/master/main/fr/scripts.json
  
- [x] localized territory names
  https://github.com/unicode-cldr/cldr-localenames-full/blob/master/main/fr/territories.json
  

#### cldr-numbers-full

https://github.com/unicode-cldr/cldr-numbers-full.git

- [x] currency names, symbol
  https://github.com/unicode-cldr/cldr-numbers-full/blob/master/main/fr/currencies.json



## Output


## TODO

- [x] add support for locale fallback

## Notes

### CLDR Known Issues

See revision notes for CLDR 32: http://cldr.unicode.org/index/downloads/cldr-32

> Known Issues
> 3. Subdivision Names
>    The draft subdivision names were imported from wikidata.
>    Names that had characters outside of the language's exemplars were excluded for now. 
>    Names that would cause collisions were allowed, but marked with superscripted numbers. 
>    The goal is to clean up these names over time.

### Locale Path issues

The targeted locale is taken from user input.
The following sources use the locale in the path:
 
- cldr-dates-full
- cldr-localenames-full
- cldr-numbers-full

The variations are big enough not to be handled in a case by case basis.
The first part of the locale is lowercase, the second varies: `az-Cyrl`, `en-150`, `en-US-POSIX`... 


## Special thanks

Special thanks to the following libraries and developers!

- [Simple Git](https://github.com/steveukx/git-js) 
- [Bluebird](http://bluebirdjs.com/)
- [command-line-args](https://www.npmjs.com/package/command-line-args) 
- [command-line-usage](https://www.npmjs.com/package/command-line-usage) 
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) 
