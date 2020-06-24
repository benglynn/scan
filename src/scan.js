"use strict";

class Scan {
  constructor(
    spec,
    {
      readFileSync = require("fs").readFileSync,
      md5 = require("md5"),
      sharp = require("sharp"),
      validate = Scan.validate,
    } = {}
  ) {
    this.readFileSync = readFileSync;
    this.md5 = md5;
    this.sharp = sharp;
    this.validate = validate;
    this.parseSpec(spec);
  }

  parseSpec(spec) {
    if (!this.validate(spec)) {
      throw new Error("unexpected spec format");
    }
    this.spec = spec.map((key) => {
      const [name, ratioWidth, ratioHeight, width, type] = key.match(
        Scan.specItemPattern
      );
      const ratio = parseInt(ratioWidth) / parseInt(ratioHeight);
      const height = Math.round(parseInt(width) / ratio);
      return { name, width: parseInt(width), height, type };
    });
  }

  static create(spec, options = {}) {
    return new Scan(spec, options);
  }

  process(filePth) {
    const inFilePattern = /^.*?([^/\\]+)\.(jpg|png)$/;
    const valid = inFilePattern.test(filePth) === true;
    if (!valid) {
      throw new Error(`unexpected file path: ${filePth}`);
    }
    const originalName = filePth.match(inFilePattern)[1];
    const bytes = this.readFileSync(filePth);
    const hash = this.md5(bytes);
    return this.spec.map((imgSpec) => {
      const name = `${originalName}-${hash}-${imgSpec.name}`;
      return this.sharp(bytes)
        .resize(imgSpec.width, imgSpec.height)
        .toFormat(imgSpec.type)
        .toBuffer()
        .then((bytes) => {
          const size = bytes.byteLength;
          return { name, source: () => bytes, size: () => size };
        });
    });
  }
}

Scan.specItemPattern = /^(\d)x(\d)-(\d+)w\.(jpg|webp)$/;

Scan.validate = (specs) => {
  const isValid =
    Array.isArray(specs) &&
    specs.every(
      (spec) => typeof spec === "string" && Scan.specItemPattern.test(spec)
    );
  return isValid;
};

module.exports = Scan.create;
