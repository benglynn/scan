const path = require('path');
const fs = require('fs');
const createProcessor = require('./image-processor');

const processor = createProcessor(require('./article-image-spec'));

const filePth = path
    .join(__dirname, 'christopher-burns-Kj2SaNHG-hg-unsplash.jpg');
Promise.all(processor.process(filePth))
    .then(images => images.forEach(image => {
        const pth = path.join(__dirname, '../dist', image.name);
        fs.writeFileSync(pth, image.source());
    }))
    .catch(e => console.error(e));