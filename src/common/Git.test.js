const expect = require('chai').expect,
  sinon = require('sinon'),

  io = require('./io'),
  Git = require('./Git');

describe('Git', () => {

  const errMessageURLInvalid = 'Git repo URL is required',
    errMessageRepoNotInitialized = 'Git repo not initialized';

  let git, url, repoName, localPath,
    mockSimpleGitInstance;

  beforeEach(() => {
    repoName = 'bar';
    url = `https://github.com/foo/${repoName}.git`;
    localPath = 'some/path';

    mockSimpleGitInstance = {
      init: sinon.stub().resolves('init'),           // resolves to method name to test last returned
      addRemote: sinon.stub().resolves('addRemote'), //
      fetch: sinon.stub().resolves('fetch'),         //
      reset: sinon.stub().resolves('reset')          //
    };

    sinon.stub(Git, '_getSimpleGitInstance').returns(mockSimpleGitInstance);
  });

  afterEach(() => {
    git = undefined;

    // stubs / spies to restore
    [
      io.dir.exists,
      io.dir.create,
      Git._getSimpleGitInstance
    ].forEach(f => f.restore && f.restore());
  });

  describe('constructor', () => {

    it('sets source repo url', () => {
      git = new Git(url);
      expect(git.url).to.equal(url);
    });

    it('sets localPath', () => {
      git = new Git(url, localPath);
      expect(git.localPath).to.equal(localPath);
    });

  });

  describe('initialize', () => {

    let dirExists;

    beforeEach(() => {
      git = new Git(url, localPath);

      // callsFake function to allow changing value in the test
      sinon.stub(io.dir, 'exists').callsFake(() => Promise.resolve(dirExists));
      sinon.stub(io.dir, 'create').resolves();
    });

    it('checks directory exists', () => {
      return git.initialize()
        .then(() => {
          expect(io.dir.exists.calledOnce).to.be.true;
          expect(io.dir.exists.calledWithExactly(git.localPath)).to.be.true;
        });
    });

    describe('path does not exist', () => {

      it('calls init and addRemote', () => {
        dirExists = false;

        return git.initialize()
          .then(() => {
            expect(io.dir.create.calledOnce).to.be.true;
            expect(io.dir.create.calledWithExactly(git.localPath)).to.be.true;

            expect(Git._getSimpleGitInstance.calledOnce).to.be.true;
            expect(Git._getSimpleGitInstance.calledWithExactly(git.localPath)).to.be.true;

            expect(mockSimpleGitInstance.init.calledOnce).to.be.true;

            expect(mockSimpleGitInstance.addRemote.calledOnce).to.be.true;
            expect(mockSimpleGitInstance.addRemote.calledWithExactly('origin', git.url)).to.be.true;
          });
      });

      it('returns promise from call to addRemote', () => {
        dirExists = false;

        return git.initialize()
          .then(res => {
            expect(res).to.equal('addRemote');
          });
      });

    });

    describe('path exists', () => {

      it('fetch if directory pointed by localPath exists', () => {
        dirExists = true;

        return git.initialize()
          .then(() => {
            expect(io.dir.create.called).to.be.false;
            expect(mockSimpleGitInstance.init.called).to.be.false;
            expect(mockSimpleGitInstance.addRemote.called).to.be.false;
          });
      });

    });

  });

  describe('resetToRemote', () => {

    beforeEach(() => {
      git = new Git(url, localPath);
    });

    it('calls git fetch and git reset --hard', () => {
      git._setSimpleGitInstance();

      return git.resetToRemote()
        .then(() => {
          expect(mockSimpleGitInstance.fetch.calledOnce).to.be.true;

          expect(mockSimpleGitInstance.reset.calledOnce).to.be.true;
          expect(mockSimpleGitInstance.reset.calledWithExactly(['--hard', undefined])).to.be.true;
        });
    });

    it('calls git reset with provided tag name', () => {
      git._setSimpleGitInstance();

      return git.resetToRemote('foo')
        .then(() => {
          expect(mockSimpleGitInstance.reset.calledOnce).to.be.true;
          expect(mockSimpleGitInstance.reset.calledWithExactly(['--hard', 'foo'])).to.be.true;
        });
    });

    it('returns promise from call to reset', () => {
      git._setSimpleGitInstance();

      return git.resetToRemote()
        .then(res => {
          expect(res).to.equal('reset');
        });
    });

    it('throws error when repo not initialized before', () => {
      expect(() => git.resetToRemote()).to.throw(errMessageRepoNotInitialized);
      expect(() => git.resetToRemote('xyz')).to.throw(errMessageRepoNotInitialized);
    });

  });

  describe('getRepoNameFromUrl', () => {

    it('returns repo name', () => {
      expect(Git.getRepoNameFromUrl(url)).to.equal(repoName);
    });

  });

});

