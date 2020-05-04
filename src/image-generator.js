class ImageGenerator {

    constructor(spec, options) {
        this.options = options;
        this.parseSpec(spec);
    }

    parseSpec (spec) {
        if (!this.options.validate(spec)) {
            throw new Error('unexpected spec format');
        }
        this.spec = spec.map(key => {
            const [name, ratioWidth, ratioHeight, width, type] = key
                .match(ImageGenerator.specItemPattern);
            const ratio = parseInt(ratioWidth) / parseInt(ratioHeight);
            const height = Math.round(parseInt(width) / ratio);
            return { name, width: parseInt(width), height, type };
        });
    }

    static create (spec, options={}) {
        const resolved = {
            readFileSync: options.readFileSync || require('fs').readFileSync,
            md5: options.md5 || require('md5'),
            sharp: options.sharp || require('sharp'),
            validate: options.validate || ImageGenerator.validate
        };
        return new ImageGenerator(spec, resolved);
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
        return this.spec.map(imgSpec => {
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

ImageGenerator.specItemPattern = /^(\d)x(\d)-(\d+)w\.(jpg|webp)$/;

ImageGenerator.validate = (specs) => {
    const isValid = Array.isArray(specs) && specs.every(spec =>
        typeof spec === 'string' && ImageGenerator.specItemPattern.test(spec));
    return isValid;
};

module.exports = ImageGenerator.create;