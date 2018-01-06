const expect = require('chai').expect,
  sinon = require('sinon'),
  path = require('path'),
  Promise = require('bluebird'),

  GitBasedSource = require('./GitBasedSource');

describe('GitBasedSource', () => {

  let gbs, gitUrl, repoName, destPath;

  beforeEach(() => {
    repoName = 'bar';
    gitUrl = `https://github.com/foo/${repoName}.git`;
    destPath = 'some/path';
  });

  describe('constructor', () => {

    it('sets git url', () => {
      gbs = new GitBasedSource(gitUrl);
      expect(gbs.git.url).to.equal(gitUrl);
    });

    it('sets git localPath when dest provided to {dest/repoName}', () => {
      gbs = new GitBasedSource(gitUrl, destPath);
      expect(gbs.git.localPath).to.equal(path.join(destPath, repoName));
    });

    it('defaults git localPath to {__dirname/tmp/git/repoName}', () => {
      gbs = new GitBasedSource(gitUrl);
      expect(gbs.git.localPath).to.equal(path.join(process.cwd(), 'tmp', 'git', repoName));
    });

  });

  describe('loadData', () => {

    beforeEach(() => {
      gbs = new GitBasedSource(gitUrl);
      // using Bluebird API, stub needs to be a Bluebird promise
      sinon.stub(gbs.git, 'initialize').callsFake(() => Promise.resolve('initialize'));
      sinon.stub(gbs.git, 'resetToRemote').callsFake(() => Promise.resolve('resetToRemote'));
    });

    it('loads last version of the remote repo', () => {
      return gbs.loadData()
        .then(res => {
          expect(gbs.git.initialize.calledOnce).to.be.true;
          expect(gbs.git.resetToRemote.calledOnce).to.be.true;

          expect(res).to.equal('resetToRemote');
        });
    });

    it('following calls return previous result', () => {
      return gbs.loadData()
        .then(() => gbs.loadData())
        .then(() => {
          expect(gbs.git.initialize.calledOnce).to.be.true;
          expect(gbs.git.resetToRemote.calledOnce).to.be.true;
        });
    });

  });

});

