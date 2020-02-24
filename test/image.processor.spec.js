const expect = require('chai').expect;
const { createProcessor, parseSpec } = require('../src/image-processor');
const specFixture = require('./fixtures/image-spec.json');

describe('ImageProcessor', function() {

  describe('#create()', function() {

    it('should throw for an invalid spec', function() {
      expect(createProcessor).to.throw();
      expect(() => createProcessor('xxx')).to.throw();
      expect(() => createProcessor(['invalid', 'invalid'])).to.throw();
      expect(() => createProcessor(['1x1-160w.svg'])).to.throw();
    });

    it('should create', function() {
      expect(() => createProcessor(['1x1-160w.jpg'])).not.to.throw();
      expect(() => createProcessor(specFixture)).not.to.throw();
    })

  });

  describe('#parseSpec', function() {

    it('parses each passed spec', function() {
      const parsedFixture = parseSpec(specFixture);
      expect(parsedFixture).to.have.lengthOf(12);
    })

    it('parses each attribute correctly', function() {
      const parsed = parseSpec(['8x5-1360w.webp'])[0];
      expect(parsed.name).to.equal('8x5-1360w.webp');
      expect(parsed.width).to.equal(1360);
      expect(parsed.height).to.equal(1360 * 5 / 8);
      expect(parsed.type).to.equal('webp');
    })

  })
});