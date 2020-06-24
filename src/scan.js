"use strict";

const specPattern = /^(\d)x(\d)-(\d+)w\.(jpg|webp)$/;

const parseSpecs = (specs) => {
  if (!Array.isArray(specs) || specs.some((spec) => !specPattern.test(spec))) {
    throw new Error("unexpected spec format");
  }
  return specs.map((spec) => {
    const [name, ratioWidth, ratioHeight, width, type] = spec.match(
      specPattern
    );
    const ratio = parseInt(ratioWidth) / parseInt(ratioHeight);
    const height = Math.round(parseInt(width) / ratio);
    return { name, width: parseInt(width), height, type };
  });
};

const processFilePartial = (specs, readFileSync, md5, sharp) => (filePth) => {
  const inFilePattern = /^.*?([^/\\]+)\.(jpg|png)$/;
  if (!inFilePattern.test(filePth)) {
    throw new Error(`unexpected file path: ${filePth}`);
  }
  const originalName = filePth.match(inFilePattern)[1];
  const bytes = readFileSync(filePth);
  const hash = md5(bytes);
  return specs.map((spec) => {
    const name = `${originalName}-${hash}-${spec.name}`;
    return sharp(bytes)
      .resize(spec.width, spec.height)
      .toFormat(spec.type)
      .toBuffer()
      .then((bytes) => {
        const size = bytes.byteLength;
        return { name, source: () => bytes, size: () => size };
      });
  });
};

module.exports = (
  specs,
  {
    readFileSync = require("fs").readFileSync,
    md5 = require("md5"),
    sharp = require("sharp"),
  } = {}
) => {
  const parsedSpecs = parseSpecs(specs);
  const process = processFilePartial(parsedSpecs, readFileSync, md5, sharp);
  return { specs: parsedSpecs, process };
};
