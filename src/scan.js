"use strict";

const specItemPattern = /^(\d)x(\d)-(\d+)w\.(jpg|webp)$/;

const parseSpecs = (specs) => {
  if (
    !Array.isArray(specs) ||
    specs.some((spec) => !specItemPattern.test(spec))
  ) {
    throw new Error("unexpected spec format");
  }
  return specs.map((key) => {
    const [name, ratioWidth, ratioHeight, width, type] = key.match(
      specItemPattern
    );
    const ratio = parseInt(ratioWidth) / parseInt(ratioHeight);
    const height = Math.round(parseInt(width) / ratio);
    return { name, width: parseInt(width), height, type };
  });
};

const processFilePartial = (spec, readFileSync, md5, sharp) => (filePth) => {
  const inFilePattern = /^.*?([^/\\]+)\.(jpg|png)$/;
  const valid = inFilePattern.test(filePth) === true;
  if (!valid) {
    throw new Error(`unexpected file path: ${filePth}`);
  }
  const originalName = filePth.match(inFilePattern)[1];
  const bytes = readFileSync(filePth);
  const hash = md5(bytes);
  return spec.map((imgSpec) => {
    const name = `${originalName}-${hash}-${imgSpec.name}`;
    return sharp(bytes)
      .resize(imgSpec.width, imgSpec.height)
      .toFormat(imgSpec.type)
      .toBuffer()
      .then((bytes) => {
        const size = bytes.byteLength;
        return { name, source: () => bytes, size: () => size };
      });
  });
};

module.exports = (spec, options = {}) => {
  return new Scan(spec, options);
};

class Scan {
  constructor(
    specs,
    {
      readFileSync = require("fs").readFileSync,
      md5 = require("md5"),
      sharp = require("sharp"),
    } = {}
  ) {
    this.spec = parseSpecs(specs);
    this.process = processFilePartial(this.spec, readFileSync, md5, sharp);
  }
}
