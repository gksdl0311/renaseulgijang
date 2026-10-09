import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { photoCollections } from "../src/data/photos.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public");
const manifestPath = path.join(root, "src/data/image-manifest.json");
const targetWidths = [480, 800, 1200];
const originals = [
  "hero/portrait.jpg",
  "media/photo/portrait-cover.jpg",
  "media/photo/onstage-cover.jpg",
  ...photoCollections.onstage,
  ...photoCollections.portrait,
  ...JSON.parse(await readFile(path.join(root, "src/data/press.json"), "utf8"))
    .filter(article => article.image).map(article => article.image.replace(/^\/+/, "")),
];

// Keep memory and CPU usage predictable when other development tasks are running.
sharp.concurrency(2);
const results = new Map();
let next = 0;

async function optimize(original) {
  const input = path.join(publicRoot, original);
  const bytes = await readFile(input);
  const metadata = await sharp(bytes).metadata();
  const rotated = metadata.orientation >= 5;
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;
  if (!width || !height) throw new Error(`Missing intrinsic image dimensions: ${original}`);

  const widths = [...new Set(targetWidths.map(target => Math.min(target, width)))];
  const stem = original.replace(/\.[^.]+$/, "");
  const variants = [];
  for (const target of widths) {
    const source = `optimized/${stem}-${target}.webp`;
    const output = path.join(publicRoot, source);
    await mkdir(path.dirname(output), { recursive: true });
    const info = await sharp(bytes)
      .rotate()
      .resize({ width: target, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(output);
    variants.push({ src: source, width: info.width, height: info.height, bytes: (await stat(output)).size });
  }

  results.set(original, {
    width,
    height,
    originalBytes: bytes.length,
    originalSha256: createHash("sha256").update(bytes).digest("hex"),
    variants,
  });
}

await Promise.all(Array.from({ length: 3 }, async () => {
  while (next < originals.length) await optimize(originals[next++]);
}));

const manifest = Object.fromEntries(originals.map(original => [original, results.get(original)]));
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
const originalBytes = [...results.values()].reduce((total, image) => total + image.originalBytes, 0);
const optimizedBytes = [...results.values()].reduce((total, image) => total + image.variants.reduce((bytes, variant) => bytes + variant.bytes, 0), 0);
console.log(`Optimized ${originals.length} photographs into ${[...results.values()].reduce((total, image) => total + image.variants.length, 0)} WebP variants.`);
console.log(`Originals preserved: ${(originalBytes / 1024 / 1024).toFixed(2)} MiB; all generated variants: ${(optimizedBytes / 1024 / 1024).toFixed(2)} MiB.`);
