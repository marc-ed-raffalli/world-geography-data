const expect = require('chai').expect,
  sinon = require('sinon'),
  ProcessorManager = require('./ProcessorManager'),
  _Processor = require('./_Processor');

describe('ProcessorManager', () => {

  let processorManager,
    mockPreProcessors,
    mockPostProcessors,

    buildMockPreProcessor = (processorId, order = 1, stub = () => {
    }) => {
      return class F extends _Processor {

        process(data) {
          return stub(data);
        }

        static get processorId() {
          return processorId;
        }

        static get order() {
          return order;
        }

      };
    },
    buildMockPostProcessor = (processorId, required = false, order = 1, preProcessorDependencies = [], stub = () => {
    }) => {
      return class F extends _Processor {

        process(data) {
          return stub(data);
        }

        static get processorId() {
          return processorId;
        }

        static get order() {
          return order;
        }

        static get preProcessorDependencies() {
          return preProcessorDependencies;
        }

        static isRequired() {
          return required;
        }

      };
    };

  beforeEach(() => {
    sinon.stub(ProcessorManager, 'getPostProcessors').callsFake(() => mockPostProcessors);
  });

  afterEach(() => {
    processorManager = undefined;
    mockPreProcessors = undefined;
    mockPostProcessors = undefined;

    ProcessorManager.getPostProcessors.restore();
  });

  describe('constructor', () => {

    beforeEach(() => {
      mockPreProcessors = {
        a: buildMockPreProcessor('a', 4),
        b: buildMockPreProcessor('b', 0),
        c: buildMockPreProcessor('c', 1),
        d: buildMockPreProcessor('d', 3),
        e: buildMockPreProcessor('e', 2)
      };
    });

    it('sets the list of required post processors by order', () => {
      mockPostProcessors = [
        buildMockPostProcessor('foo', true),
        buildMockPostProcessor('qux', true, 3),
        buildMockPostProcessor('baz', true, 2),
        buildMockPostProcessor('bar')
      ]; // unordered

      const ids = new ProcessorManager().postProcessors.map(p => p.constructor.processorId);
      expect(ids).to.deep.equal(['foo', 'baz', 'qux']);
    });

    it('sets the list of pre processor dependencies by order', () => {
      mockPostProcessors = [
        buildMockPostProcessor('foo', true, 1, [mockPreProcessors.b, mockPreProcessors.c]),
        buildMockPostProcessor('bar', true, 1, [mockPreProcessors.c, mockPreProcessors.d]),
        buildMockPostProcessor('baz', true, 1, [mockPreProcessors.a, mockPreProcessors.c])
      ]; // unordered

      const ids = new ProcessorManager().preProcessors.map(p => p.constructor.processorId);
      expect(ids).to.deep.equal(['b', 'c', 'd', 'a']);
    });

  });

  describe('processDependencies', () => {

    it('calls processor.extract serially providing data and stores returned value to data[processorId]', () => {
      const aStub = sinon.stub().resolves(2),
        bStub = sinon.stub().resolves(3),
        cStub = sinon.stub().resolves(4),
        data = {sources: {aaa: 'aaa'}};

      mockPreProcessors = {
        a: buildMockPreProcessor('a', 2, aStub),
        b: buildMockPreProcessor('b', 3, bStub),
        c: buildMockPreProcessor('c', 1, cStub)
      };

      mockPostProcessors = [
        buildMockPostProcessor('foo', true, 1, [mockPreProcessors.a, mockPreProcessors.b, mockPreProcessors.c])
      ];

      processorManager = new ProcessorManager();

      return processorManager.processDependencies(data)
        .then(() => {
          expect(aStub.calledWithExactly(data)).to.be.true;
          expect(bStub.calledWithExactly(data)).to.be.true;
          expect(cStub.calledWithExactly(data)).to.be.true;

          expect(cStub.calledBefore(aStub)).to.be.true;
          expect(aStub.calledBefore(bStub)).to.be.true;

          expect(data.processors.a).to.equal(2);
          expect(data.processors.b).to.equal(3);
          expect(data.processors.c).to.equal(4);
        });
    });

  });

  describe('processOutput', () => {

    it('calls processors.extract serially', () => {
      const fooStub = sinon.stub().resolves(2),
        barStub = sinon.stub().resolves(3),
        bazStub = sinon.stub().resolves(4),
        data = {sources: {aaa: 'aaa'}};

      mockPostProcessors = [
        buildMockPostProcessor('foo', true, 2, [], fooStub),
        buildMockPostProcessor('bar', true, 3, [], barStub),
        buildMockPostProcessor('baz', true, 1, [], bazStub)
      ];

      processorManager = new ProcessorManager();

      return processorManager.processOutput(data)
        .then(() => {
          expect(fooStub.calledWithExactly(data)).to.be.true;
          expect(barStub.calledWithExactly(data)).to.be.true;
          expect(bazStub.calledWithExactly(data)).to.be.true;

          expect(bazStub.calledBefore(fooStub)).to.be.true;
          expect(fooStub.calledBefore(barStub)).to.be.true;
        });
    });

  });

  describe('process', () => {

    it('calls processDependencies first, then processOutput', () => {
      mockPostProcessors = [
        buildMockPostProcessor('foo', true)
      ];

      processorManager = new ProcessorManager();

      sinon.stub(processorManager, 'processDependencies').resolves(2);
      sinon.stub(processorManager, 'processOutput').resolves(3);

      return processorManager.process(1)
        .then(res => {
          expect(processorManager.processDependencies.calledWithExactly(1)).to.be.true;
          expect(processorManager.processDependencies.calledOnce).to.be.true;

          expect(processorManager.processOutput.calledWithExactly(2)).to.be.true;
          expect(processorManager.processOutput.calledOnce).to.be.true;

          expect(processorManager.processDependencies.calledBefore(processorManager.processOutput)).to.be.true;
          expect(res).to.equal(3);
        });
    });

  });

});
