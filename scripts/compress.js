#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";
import { argv, cwd, exit } from "node:process";
import * as zlib from "node:zlib";

const usage = () => {
  console.error(`Usage: node compress-json.js <input.json> [--out <outputBasePath>]
  - Compresses JSON using Gzip, Brotli, and Deflate.
  - Outputs: <outputBasePath>.gz, .br, .deflate`);
  exit(1);
};

const getArgs = () => {
  const args = argv.slice(2);
  if (args.length === 0) usage();

  const inputPath = path.resolve(cwd(), args[0]);
  const outFlagIndex = args.indexOf("--out");
  const outputPath =
    outFlagIndex !== -1 && args[outFlagIndex + 1]
      ? path.resolve(cwd(), args[outFlagIndex + 1])
      : inputPath;

  return { inputPath, outputPath };
};

const formatSize = (bytes) => `${(bytes / 1024).toFixed(2)} KiB`;

const compressJson = async (jsonData, basePath) => {
  const minified = JSON.stringify(jsonData);
  const buffer = Buffer.from(minified, "utf8");

  const compressed = {
    gzip: zlib.gzipSync(buffer, { level: zlib.constants.Z_BEST_COMPRESSION }),
    // deflate: zlib.deflateSync(buffer, { level: zlib.constants.Z_BEST_COMPRESSION }),
    brotli: zlib.brotliCompressSync(buffer, {
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY },
    }),
  };

  console.log(`🗂️ ORIGINAL: ${formatSize(buffer.length)}`);

  await Promise.all(
    Object.entries(compressed).map(async ([type, data]) => {
      const ratio = ((data.length / buffer.length) * 100).toFixed(1);
      const outPath = `${basePath}.${type === "brotli" ? "br" : type}`;

      await fs.promises.writeFile(outPath, data);

      console.log(
        `📦 ${type.toUpperCase()}: ${formatSize(data.length)} (${ratio}% of original) → ${outPath}`,
      );
    }),
  );
};

const main = async () => {
  const { inputPath, outputPath } = getArgs();

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    exit(1);
  }

  try {
    const content = await fs.promises.readFile(inputPath, "utf8");
    const json = JSON.parse(content);
    await compressJson(json, outputPath);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    exit(1);
  }
};

main();
