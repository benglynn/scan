const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const md5 = require('md5');
const Ajv = require('ajv');
const spec = require('./article-image-spec');

const schema = {
    type: 'array',
    items: { type: 'string', pattern: '^\\dx\\d\\-\\d+w\\.(jpg|webp)$' }
}

const expand = rawSpec => {
    const ajv = new Ajv({allErrors: true});
    const validate = ajv.compile(schema);
    if (!validate(rawSpec)) throw (ajv.errorsText(validate.errors));
    const pattern = /^(\d)x(\d)\-(\d+)w\.(jpg|webp)$/;
    return rawSpec.map(key => {
        const [name, ratioWidth, ratioHeight, width, type] = key.match(pattern);
        const ratio = parseInt(ratioWidth) / parseInt(ratioHeight);
        const height = Math.round(parseInt(width) / ratio);
        return { name, width: parseInt(width), height, type }
    })
}

const process = (originalName, originalBytes, spec) => {
    const hash = md5(originalBytes);
    const originalNameOnly = originalName.replace(/\.[^\.]+$/, `-${hash}`);
    return expand(spec).map(imgSpec => {
        const name = `${originalNameOnly}-${imgSpec.name}`;
        return sharp(originalBytes).resize(imgSpec.width, imgSpec.height)
            .toFormat(imgSpec.type).toBuffer().then(bytes => {
                const size = bytes.byteLength;
                return { name, source: () => bytes, size: () => size };
            })
    });
}

const fileName = 'christopher-burns-Kj2SaNHG-hg-unsplash.jpg';
const originalBytes = fs.readFileSync(path.join(__dirname, fileName));
Promise.all(process(fileName, originalBytes, spec))
    .then(images => images.forEach(image => {
        const pth = path.join(__dirname, '../dist', image.name);
        fs.writeFileSync(pth, image.source());
    }))
    .catch(e => console.error(e));