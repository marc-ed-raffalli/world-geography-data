const expect = require('chai').expect,
  sinon = require('sinon'),

  cli = require('.')
;

describe('CLI', () => {

  let argv, next,
    mockInteractiveAnswers;

  beforeEach(() => {
    argv = ['node', '.'];
    next = sinon.spy();
    mockInteractiveAnswers = {confirm: true};

    sinon.stub(cli, 'printHelp');
    sinon.stub(cli, 'runInteractivePrompt').resolves(mockInteractiveAnswers);
  });

  afterEach(() => {
    cli.printHelp.restore();
    cli.runInteractivePrompt.restore();
    cli.readArguments.restore && cli.readArguments.restore();
  });

  function runCli(additionalArgs = []) {
    return cli.run(argv.concat(additionalArgs), next);
  }

  describe('Help', () => {

    function testPrintHelp() {
      expect(cli.printHelp.calledOnce).to.be.true;
      expect(cli.runInteractivePrompt.called).to.be.false;
      expect(next.called).to.be.false;
    }

    it('shows the help with -h', () => {
      return runCli(['-h'])
        .then(() => {
          testPrintHelp();
        });
    });

    it('shows the help with --help', () => {
      return runCli(['--help'])
        .then(() => {
          testPrintHelp();
        });
    });

    it('shows the help when no args are supplied', () => {
      return runCli()
        .then(() => {
          testPrintHelp();
        });
    });

  });

  describe('Interactive prompt', () => {

    it('starts interactive prompt with -i', () => {
      return runCli(['-i'])
        .then(() => {
          expect(cli.runInteractivePrompt.calledOnce).to.be.true;
          expect(cli.printHelp.called).to.be.false;
        });
    });

    it('starts interactive prompt with --interactive', () => {
      return runCli(['--interactive'])
        .then(() => {
          expect(cli.runInteractivePrompt.calledOnce).to.be.true;
          expect(cli.printHelp.called).to.be.false;
        });
    });

    it('calls next with interactive prompt data when prompt confirm is true', () => {
      return runCli(['--interactive'])
        .then(() => {
          expect(next.calledOnce).to.be.true;
          expect(next.calledWithMatch(mockInteractiveAnswers)).to.be.true;
        });
    });

    it('does NOT call next when interactive prompt confirm is false', () => {
      mockInteractiveAnswers.confirm = false;

      return runCli(['--interactive'])
        .then(() => {
          expect(next.called).to.be.false;
        });
    });

  });

  describe('Standard flow', () => {

    let mockArgs;

    beforeEach(() => {
      mockArgs = {};
      sinon.stub(cli, 'readArguments').returns(mockArgs);
    });

    it('calls next with CLI options', () => {
      return runCli(['--country'])
        .then(() => {
          expect(next.calledOnce).to.be.true;
          expect(next.calledWithMatch(mockArgs)).to.be.true;
        });
    });

  });

});

