const expect = require('chai').expect;
const { createScan } = require('../src');
const specFixture = require('./fixtures/image-spec.json');

describe('Scan', function () {

    const createStubScan = spec => {
        const readFileSync = () => 12345;
        const md5 = () => 'mockhash';
        const sharp = () => ({
            resize: () => ({
                toFormat: () => ({
                    toBuffer: () => Promise.resolve({ byteLength: 999 })
                })
            })
        });
        const options = { readFileSync, md5, sharp };
        return createScan(spec, options);
    };

    describe('create', function () {

        it('should throw for an invalid spec', function () {
            const message = 'unexpected spec format';
            expect(createStubScan).to.throw(message);
            expect(() => createStubScan('xxx')).to.throw(message);
            expect(() => createStubScan(['invalid', 'invalid'])).to.throw(message);
            expect(() => createStubScan(['1x1-160w.svg'])).to.throw(message);
        });

        it('should create', function () {
            expect(() => createStubScan(['1x1-160w.jpg'])).not.to.throw();
            expect(() => createStubScan(specFixture)).not.to.throw();
        });
    });

    describe('parseSpec', function () {

        it('parses each passed spec', function () {
            const processor = createStubScan(specFixture);
            expect(processor.spec).to.have.lengthOf(12);
        });

        it('parses each attribute correctly', function () {
            const processor = createStubScan(['8x5-1360w.webp']);
            const parsed = processor.spec[0];
            expect(parsed.name).to.equal('8x5-1360w.webp');
            expect(parsed.width).to.equal(1360);
            expect(parsed.height).to.equal(1360 * 5 / 8);
            expect(parsed.type).to.equal('webp');
        });

    });

    describe('process', function () {

        it('should throw for an unsuported file type', function () {
            const instance = createStubScan(specFixture);
            const message = /^unexpected file path/;
            expect(() => instance.process('not a file')).to.throw(message);
            expect(() => instance.process('/path/to/unsuported.svg')).to.throw(message);
            expect(() => instance.process('no-path.jpg')).not.to.throw();
        });

        it('should return an array of promises', function () {
            const instance = createStubScan(specFixture);
            const result = instance.process('file.jpg');
            expect(result).to.be.an('array');
            expect(result[0]).to.be.a('promise');
        });

        it('should return a promise that resolves to spec', async function () {
            const instance = createStubScan(['8x5-1360w.webp']);
            const result = await instance.process('file-name.jpg')[0];
            expect(result.source).to.be.a('function');
            expect(result.source().byteLength).to.equal(999);
            expect(result.size).to.be.a('function');
            expect(result.name).to.equal('file-name-mockhash-8x5-1360w.webp');
        });

    });

});