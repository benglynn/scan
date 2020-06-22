const path = require('path');
const fs = require('fs');
const { createScan } = require('../src');
const spec = require('../test/fixtures/image-spec');
const filePth = path.join(__dirname,
    '../test/fixtures/christopher-burns-Kj2SaNHG-hg-unsplash.jpg');

const generator = createScan(spec);

Promise.all(generator.process(filePth))
    .then(assets => assets.forEach(asset => {
        const pth = path.join(__dirname, '../dist', asset.name);
        fs.writeFileSync(pth, asset.source());
        console.log(`Created ${pth}`);
    })).catch(error => console.error(error));