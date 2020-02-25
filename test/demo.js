const path = require('path');
const fs = require('fs');
const imageGenerator = require('../src/image-generator');
const spec = require('./fixtures/image-spec');
const filePth = path.join(__dirname,
    'fixtures/christopher-burns-Kj2SaNHG-hg-unsplash.jpg');

const generator = imageGenerator(spec);

Promise.all(generator.process(filePth))
    .then(assets => assets.forEach(asset => {
        const pth = path.join(__dirname, '../dist', asset.name);
        console.log(pth);
        fs.writeFileSync(pth, asset.source());
    })).catch(error => console.error(error));