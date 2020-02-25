const expect = require('chai').expect;
const imageGenerator = require('../src/image-generator');
const specFixture = require('./fixtures/image-spec.json');

describe('ImageProcessor', function() {

  const mockedGenerator = (spec) => {
    const readFileSync = (_) => 12345;
    const md5 = (_) => 'mockhash';
    const sharp = () => ({
      resize: () => ({
        toFormat: () => ({
          toBuffer: () => Promise.resolve({ byteLength: 999 })
        })
      })
    });
    const validate = () => true;
    const options = { readFileSync, md5, sharp, validate }
    return imageGenerator(spec, options );
  }

  describe('#create()', function() {

    it('should throw for an invalid spec', function() {
      expect(mockedGenerator).to.throw();
      expect(() => mockedGenerator('xxx')).to.throw();
      expect(() => mockedGenerator(['invalid', 'invalid'])).to.throw();
      expect(() => mockedGenerator(['1x1-160w.svg'])).to.throw();
    });

    it('should create', function() {
      expect(() => mockedGenerator(['1x1-160w.jpg'])).not.to.throw();
      expect(() => mockedGenerator(specFixture)).not.to.throw();
    })
  });

  describe('#parseSpec', function() {

    it('parses each passed spec', function() {
      const processor = mockedGenerator(specFixture);
      expect(processor.spec).to.have.lengthOf(12);
    })

    it('parses each attribute correctly', function() {
      const processor = mockedGenerator(['8x5-1360w.webp']);
      const parsed = processor.spec[0];
      expect(parsed.name).to.equal('8x5-1360w.webp');
      expect(parsed.width).to.equal(1360);
      expect(parsed.height).to.equal(1360 * 5 / 8);
      expect(parsed.type).to.equal('webp');
    })

  })

  describe('#process()', function() {

    it('should throw for an unsuported file type', function() {
      const instance = mockedGenerator(specFixture);
      expect(() => instance.process('not a file')).to.throw();
      expect(() => instance.process('/path/to/unsuported.svg')).to.throw();
      expect(() => instance.process('no-path.jpg')).not.to.throw();
    });

    it('should return an array of promises', function() {
      const instance = mockedGenerator(specFixture);
      const result = instance.process('file.jpg');
      expect(result).to.be.an('array');
      expect(result[0]).to.be.a('promise');
    });

    it('should return a promise that resolves to spec', async function() {
      const instance = mockedGenerator(['8x5-1360w.webp']);
      const result = await instance.process('file-name.jpg')[0];
      expect(result.source).to.be.a('function');
      expect(result.source().byteLength).to.equal(999);
      expect(result.size).to.be.a('function');
      expect(result.name).to.equal('file-name-mockhash-8x5-1360w.webp');
    });

  });

});