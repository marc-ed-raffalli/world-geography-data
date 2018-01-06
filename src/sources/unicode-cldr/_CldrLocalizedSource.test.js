const expect = require('chai').expect,
  path = require('path'),
  sinon = require('sinon'),
  io = require('../../common/io'),
  _CldrLocalizedSource = require('./_CldrLocalizedSource');

describe('CldrLocalizedSource', () => {

  let source;

  afterEach(() => {
    source = undefined;
  });

  describe('readLocalizedFile', () => {

    let locale, fileName, basePath,
      mockJsonReadValue, mockDirList;

    beforeEach(() => {
      source = new _CldrLocalizedSource('https://github.com/foo/bar.git');
      locale = 'fo-ba';
      fileName = 'someFile.json';
      basePath = path.join(source.git.localPath, 'main');
      mockDirList = [];

      sinon.stub(io.dir, 'list').callsFake(() => Promise.resolve(mockDirList));
    });

    afterEach(() => {
      mockJsonReadValue = undefined;
      mockDirList = undefined;

      io.json.read.restore && io.json.read.restore();
      io.dir.list.restore && io.dir.list.restore();
    });

    it('attempts to read file first', () => {
      mockJsonReadValue = {foo: 'bar'};

      sinon.stub(io.json, 'read').resolves(mockJsonReadValue);

      return source.readLocalizedFile(locale, fileName)
        .then(res => {
          const expectedPath = path.join(basePath, locale, fileName);

          expect(io.json.read.calledOnce).to.be.true;
          expect(io.json.read.calledWithExactly(expectedPath)).to.be.true;
          expect(res).to.deep.equal(mockJsonReadValue);

          expect(io.dir.list.called).to.be.false;
        });
    });

    it('list matching locale paths after read attempt', () => {
      sinon.stub(io.json, 'read').rejects({code: 'ENOENT'});

      return source.readLocalizedFile(locale, fileName)
        .then(() => {
          // one on the recursive call
          expect(io.dir.list.calledTwice).to.be.true;
          expect(io.dir.list.getCall(0).calledWithExactly(basePath, `${locale}**/${fileName}`, {nocase: true})).to.be.true;
          expect(io.dir.list.getCall(1).calledWithExactly(basePath, `${locale.split('-')[0]}**/${fileName}`, {nocase: true})).to.be.true;
        });
    });

    it('returns undefined when fallback path is empty and locale is main', () => {
      sinon.stub(io.json, 'read').rejects({code: 'ENOENT'});
      mockDirList = [];

      return source.readLocalizedFile('fo', fileName)
        .then(res => {
          expect(res).to.be.undefined;
        });
    });

    it('calls itself with main local part when fallback path is empty and locale has sub group', () => {
      mockJsonReadValue = {foo: 'bar'};
      mockDirList = [];

      const attemptedPath = path.join(basePath, 'fo-ba', fileName),
        realPath = path.join(basePath, 'fo', fileName);

      const stub = sinon.stub(io.json, 'read');
      stub.withArgs(attemptedPath).rejects({code: 'ENOENT'});
      stub.withArgs(realPath).resolves(mockJsonReadValue);
      stub.throws();

      sinon.spy(source, 'readLocalizedFile');

      return source.readLocalizedFile(locale, fileName)
        .then(res => {
          expect(source.readLocalizedFile.calledTwice).to.be.true;
          expect(source.readLocalizedFile.getCall(1).calledWithExactly('fo', fileName)).to.be.true;

          expect(res).to.deep.equal(mockJsonReadValue);
        });
    });

    it('uses matching locale paths as fallback', () => {
      mockJsonReadValue = {foo: 'bar'};
      mockDirList = [`fo-BA/${fileName}`];

      const attemptedPath = path.join(basePath, 'fo-ba', fileName),
        realPath = path.join(basePath, mockDirList[0]);

      sinon.stub(io.json, 'read')
        .withArgs(attemptedPath).rejects({code: 'ENOENT'})
        .withArgs(realPath).resolves(mockJsonReadValue);

      return source.readLocalizedFile(locale, fileName)
        .then(res => {
          expect(res).to.deep.equal(mockJsonReadValue);
        });
    });

  });

});

