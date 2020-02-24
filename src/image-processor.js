class ImageProcessor {

    constructor(spec, options) {
        this.options = options;
        if (!this.options.validate(spec)) {
            throw new Error('unexpected spec format');
        }
        this.expandedSpec = ImageProcessor.parseSpec(spec);
    }

    static parseSpec (spec) {
        const itemPattern = new RegExp(ImageProcessor.specItemPattern);
        return spec.map(key => {
            const [name, ratioWidth, ratioHeight, width, type] = key
                .match(itemPattern);
            const ratio = parseInt(ratioWidth) / parseInt(ratioHeight);
            const height = Math.round(parseInt(width) / ratio);
            return { name, width: parseInt(width), height, type }
        })
    }

    static create (spec, options={}) {
        const resolved = {
            readFileSync: options.readFileSync || require('fs').readFileSync,
            md5: options.md5 || require('md5'),
            sharp: options.sharp || require('sharp'),
            validate: options.validate || (() => {
                const Ajv = require('ajv');
                const ajv = new Ajv({ allErrors: true });
                return ajv.compile(ImageProcessor.specSchema);
            })()
        }
        return new ImageProcessor(spec, resolved);
    }

    process (filePth) {
        const inFilePattern = /^.*?([^/\\]+)\.(jpg|png)$/;
        const valid = inFilePattern.test(filePth) === true;
        if (!valid) {
            throw new Error(`unexpected file path: ${filePth}`);
        }
        const originalName = filePth.match(inFilePattern)[1];
        const bytes = this.options.readFileSync(filePth);
        const hash = this.options.md5(bytes);
        return this.expandedSpec.map(imgSpec => {
            const name = `${originalName}-${hash}-${imgSpec.name}`;
            return this.options.sharp(bytes)
                .resize(imgSpec.width, imgSpec.height)
                .toFormat(imgSpec.type)
                .toBuffer()
                .then(bytes => {
                    const size = bytes.byteLength;
                    return { name, source: () => bytes, size: () => size };
                });
        });
    }
}

ImageProcessor.specItemPattern = '^(\\d)x(\\d)\\-(\\d+)w\\.(jpg|webp)$';

ImageProcessor.specSchema = {
    type: 'array',
    items: { type: 'string', pattern: ImageProcessor.specItemPattern }
}

module.exports = {
    createProcessor: ImageProcessor.create,
    parseSpec: ImageProcessor.parseSpec
};