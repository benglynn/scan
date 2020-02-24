const path = require('path');
const fs = require('fs');
const { createProcessor } = require('./src/image-processor');
const spec = require('./test/fixtures/image-spec');

const processor = createProcessor(spec);

const filePth = path
    .join(__dirname, 'test', 'fixtures', 'christopher-burns-Kj2SaNHG-hg-unsplash.jpg');
Promise.all(processor.process(filePth))
    .then(images => images.forEach(image => {
        const pth = path.join(__dirname, './dist', image.name);
        fs.writeFileSync(pth, image.source());
    }))
    .catch(e => console.error(e));