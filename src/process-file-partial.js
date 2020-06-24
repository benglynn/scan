"use strict";

module.exports = (specs, readFileSync, md5, sharp) => (filePth) => {
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
