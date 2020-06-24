"use strict";

const parseSpecs = require("./parse-specs");
const processFilePartial = require("./process-file-partial");

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
