class ImageProcessor {

    constructor(spec, opts) {
        const options = {
            fs: require('fs'),
            sharp: require('sharp'),
            md5: require('md5'),
            ...opts
        }
        if (options.vaidate === undefined) {
            const Ajv = require('ajv');
            const ajv = new Ajv({ allErrors: true });
            options.validate = ajv.compile(this.specSchema());
        }
        this.specItemPattern = '^(\\d)x(\\d)\\-(\\d+)w\\.(jpg|webp)$';
        this.readFileSync = options.fs.readFileSync;
        this.md5 = options.md5;
        this.sharp = options.sharp;
        this.validate = options.validate;
        this.spec = this.parseSpec(spec);
    }

    specSchema () {
        return {
            type: 'array',
            items: { type: 'string', pattern: this.specItemPattern }
        };
    }

    parseSpec (rawSpec) {
        if (!this.validate(rawSpec)) throw new Error('unexpected spec format');
        const itemPattern = new RegExp(this.specItemPattern);
        return rawSpec.map(key => {
            const [name, ratioWidth, ratioHeight, width, type] = key
                .match(itemPattern);
            const ratio = parseInt(ratioWidth) / parseInt(ratioHeight);
            const height = Math.round(parseInt(width) / ratio);
            return { name, width: parseInt(width), height, type }
        })
    }

    process (filePth) {
        const inFilePattern = /^.*?([^/\\]+)\.(jpg|png)$/;
        const valid = inFilePattern.test(filePth) === true;
        if (!valid) throw new Error(`unexpected file path: ${filePth}`);
        const originalName = filePth.match(inFilePattern)[1];
        const bytes = this.readFileSync(filePth);
        const hash = this.md5(bytes);
        return this.spec.map(imgSpec => {
            const name = `${originalName}-${hash}-${imgSpec.name}`;
            return this.sharp(bytes).resize(imgSpec.width, imgSpec.height)
                .toFormat(imgSpec.type).toBuffer().then(bytes => {
                    const size = bytes.byteLength;
                    return { name, source: () => bytes, size: () => size };
                });
        });
    }
}

const create = (spec, options) => new ImageProcessor(spec, options);

module.exports = create;