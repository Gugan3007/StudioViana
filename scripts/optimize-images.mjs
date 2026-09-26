#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readdir } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_WIDTHS = [480, 768, 1280, 1920, 2560];
const RASTER_EXTENSIONS = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);

export function planResponsiveWidths(sourceWidth, candidates = DEFAULT_WIDTHS) {
  const ordered = [...new Set(candidates)]
    .filter((width) => Number.isFinite(width) && width > 0)
    .sort((a, b) => a - b);
  if (!ordered.length || !Number.isFinite(sourceWidth) || sourceWidth <= 0) {
    return [];
  }
  const cap = Math.min(sourceWidth, ordered.at(-1));
  const widths = ordered.filter((width) => width <= cap);
  if (!widths.includes(cap)) widths.push(cap);
  return widths;
}

export function derivativeName(filename, width, format) {
  const extension = extname(filename);
  return `${basename(filename, extension)}-${width}.${format}`;
}

export function parseOptimizerArgs(args) {
  const options = {
    dryRun: false,
    input: "public/images",
    output: undefined,
    overwrite: false,
  };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--dry-run") options.dryRun = true;
    else if (argument === "--overwrite") options.overwrite = true;
    else if (argument === "--input") options.input = args[++index];
    else if (argument === "--output") options.output = args[++index];
    else throw new Error(`Unknown optimizer argument: ${argument}`);
  }
  if (!options.input) throw new Error("--input requires a directory");
  options.output ??= `${options.input.replace(/\/$/, "")}-optimized`;
  if (
    resolve(options.input) === resolve(options.output) &&
    !options.overwrite
  ) {
    throw new Error(
      "Refusing to write into the input directory without --overwrite",
    );
  }
  return options;
}

async function findImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const images = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) images.push(...(await findImages(path)));
    else if (RASTER_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      images.push(path);
    }
  }
  return images;
}

export async function optimizeImages(options) {
  const { default: sharp } = await import("sharp");
  const input = resolve(options.input);
  const output = resolve(options.output);
  const files = await findImages(input);
  const plan = [];

  for (const file of files) {
    const metadata = await sharp(file).metadata();
    if (!metadata.width) continue;
    const directory = join(output, dirname(relative(input, file)));
    for (const width of planResponsiveWidths(metadata.width)) {
      for (const format of ["avif", "webp"]) {
        const destination = join(
          directory,
          derivativeName(file, width, format),
        );
        plan.push({ destination, file, format, width });
        if (options.dryRun || (!options.overwrite && existsSync(destination))) {
          continue;
        }
        await mkdir(directory, { recursive: true });
        const pipeline = sharp(file).rotate().resize({
          fit: "inside",
          height: 2560,
          width,
          withoutEnlargement: true,
        });
        if (format === "avif")
          await pipeline.avif({ quality: 62 }).toFile(destination);
        else await pipeline.webp({ quality: 78 }).toFile(destination);
      }
    }
  }
  return plan;
}

async function main() {
  const options = parseOptimizerArgs(process.argv.slice(2));
  const plan = await optimizeImages(options);
  const label = options.dryRun ? "planned" : "processed";
  process.stdout.write(
    `Studio Viana image optimizer: ${label} ${plan.length} derivatives in ${options.output}\n`,
  );
}

const executable = process.argv[1] ? resolve(process.argv[1]) : "";
if (fileURLToPath(import.meta.url) === executable) {
  main().catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
