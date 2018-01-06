const expect = require('chai').expect,
  sinon = require('sinon'),
  path = require('path'),
  cloneDeep = require('lodash/cloneDeep'),
  io = require('../../common/io'),
  GeoJSONRegions = require('./GeoJSONRegions');

describe('GeoJSONRegions', () => {

  let source;

  afterEach(() => {
    source = undefined;
  });

  describe('isRequired', () => {

    it('returns false when geometry is not a white listed value', () => {
      expect(GeoJSONRegions.isRequired({})).to.be.false;
      expect(GeoJSONRegions.isRequired({geometry: false})).to.be.false;
      expect(GeoJSONRegions.isRequired({geometry: 'foo'})).to.be.false;
    });

    it('returns true when geometry is a white listed value', () => {
      GeoJSONRegions.getMapOfWhiteListValues().geometry
        .forEach(val => {
          expect(GeoJSONRegions.isRequired({geometry: val})).to.be.true;
        });
    });

  });

  describe('getAllCountriesGeoJson', () => {

    let mockRead;

    beforeEach(() => {
      source = new GeoJSONRegions();
      mockRead = {foo: 'bar'};

      sinon.stub(io.json, 'read').resolves(mockRead);
    });

    afterEach(() => {
      io.json.read.restore();
    });

    it('calls io.json.read with countries/{precision}/all.geojson', () => {
      return source.getAllCountriesGeoJson('110m')
        .then(res => {
          const expectedPath = path.join(source.git.localPath, 'countries/110m/all.geojson');

          expect(res).to.deep.equal(mockRead);
          expect(io.json.read.calledOnce).to.be.true;
          expect(io.json.read.calledWithExactly(expectedPath)).to.be.true;
        });
    });

  });

  describe('extract', () => {

    let mockAllGeoJsonData;

    function getGeoJsonCollection(features) {
      return {
        type: 'FeatureCollection',
        features: features
      };
    }

    beforeEach(() => {
      source = new GeoJSONRegions();

      sinon.stub(source, 'getAllCountriesGeoJson').callsFake(() => Promise.resolve(mockAllGeoJsonData));
    });

    afterEach(() => {
      source.getAllCountriesGeoJson.restore();
    });

    it('returns data from getAllCountriesGeoJson(precision)', () => {
      mockAllGeoJsonData = getGeoJsonCollection([{properties: {iso_a2: 'FO', iso_a3: 'FOO'}}]);

      return source.extract({geometry: 'geoJSON110m'})
        .then(res => {
          expect(res).to.deep.equal(mockAllGeoJsonData);
          expect(source.getAllCountriesGeoJson.calledOnce).to.be.true;
          expect(source.getAllCountriesGeoJson.calledWithExactly('110m')).to.be.true;
        });
    });

    it('filters out countries not in provided options._filteredCountries', () => {
      const expectedRes = [
          {properties: {iso_a2: 'FO', iso_a3: 'FOO'}},
          {properties: {iso_a2: 'BA', iso_a3: 'BAR'}}
        ],
        filteredCountries = {
          iso_a2: ['FO'],
          iso_a3: ['BAR']
        };

      mockAllGeoJsonData = getGeoJsonCollection([
        ...expectedRes,
        {properties: {iso_a2: 'BZ', iso_a3: 'BAZ'}}
      ]);

      return source.extract({geometry: 'geoJSON110m', _filteredCountries: filteredCountries})
        .then(res => {
          expect(res).to.deep.equal(getGeoJsonCollection(expectedRes));
          expect(source.getAllCountriesGeoJson.calledOnce).to.be.true;
        });
    });

    it('ignores countries without iso_a2 AND iso_a3', () => {
      const expectedRes = [
        {properties: {iso_a2: 'FO', iso_a3: 'FOO'}},
        {properties: {iso_a2: 'BA', iso_a3: 'BAR'}}
      ];

      mockAllGeoJsonData = getGeoJsonCollection(
        expectedRes.concat([
          {properties: {name: 'Some BAZ'}}
        ])
      );

      return source.extract({geometry: 'geoJSON110m'})
        .then(res => {
          expect(res).to.deep.equal(getGeoJsonCollection(expectedRes));
          expect(source.getAllCountriesGeoJson.calledOnce).to.be.true;
        });
    });

    it('has no side effect on countries filter array', () => {
      const filteredCountries = {
          iso_a2: ['FO'],
          iso_a3: ['BAR']
        },
        controlObject = cloneDeep(filteredCountries);

      return source.extract({geometry: 'geoJSON110m', _filteredCountries: filteredCountries})
        .then(() => {
          expect(filteredCountries).to.deep.equal(controlObject);
        });
    });

  });

});

