const expect = require('chai').expect,
  MapTerritoryContainmentByIso = require('./MapTerritoryContainmentByIso');

describe('MapTerritoryContainmentByIso', () => {

  let processor, result;

  beforeEach(() => {
    processor = new MapTerritoryContainmentByIso({});
    result = undefined;

    return processor.process({
      // Continents listed as tree root
      //
      // 002: Africa          // test multiple sub regions
      //  - 020
      //    - AA
      //    - AB
      //  - 021
      //    - AC
      // 003: North America   // test deeply nested sub regions
      //  - 030
      //    - 300
      //      - BA
      // 005: South America   // test common nesting structure
      //  - 050
      //    - CA
      // 009: Oceania
      //  - 090
      //    - DA
      // 142: Asia            // test shallow nesting
      //  - EA
      //  - EB
      // 150: Europe
      //  - FA
      sources: {
        'cldr-core': {
          territoryContainment: {
            // Africa
            '002': ['020', '021'],
            '020': ['AA', 'AB'],
            '021': ['AC'],
            // North America
            '003': ['030'],
            '030': ['300'],
            '300': ['BA'],
            // South America
            '005': ['050'],
            '050': ['CA'],
            // Oceania
            '009': ['090'],
            '090': ['DA'],
            // Asia
            '142': ['EA', 'EB'],
            // Europe
            '150': ['FA'],
            // should be ignored
            '123': ['ZZ']
          }
        }
      }
    }).then(res => result = res);
  });

  it('returns 2 levels down with siblings', () => {
    expect(result.AA).to.deep.equal(['002', '020']);
    expect(result.AB).to.deep.equal(['002', '020']);
    expect(result.AC).to.deep.equal(['002', '021']);
  });

  it('returns 1 level down', () => {
    expect(result.EA).to.deep.equal(['142']);
    expect(result.EB).to.deep.equal(['142']);
    expect(result.FA).to.deep.equal(['150']);
  });

  it('returns 2 levels down', () => {
    expect(result.CA).to.deep.equal(['005', '050']);
    expect(result.DA).to.deep.equal(['009', '090']);
  });

  it('returns 3 levels down', () => {
    expect(result.BA).to.deep.equal(['003', '030', '300']);
  });

  it('returns exclusively node children of listed continents', () => {
    expect(Object.keys(result)).to.deep.equal(['AA', 'AB', 'AC', 'BA', 'CA', 'DA', 'EA', 'EB', 'FA']);
  });

});

