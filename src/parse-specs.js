"use strict";

const specPattern = /^(\d)x(\d)-(\d+)w\.(jpg|webp)$/;

module.exports = (specs) => {
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
