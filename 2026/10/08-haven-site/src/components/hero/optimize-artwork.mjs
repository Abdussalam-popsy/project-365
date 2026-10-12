import sharp from "sharp";

const directory = new URL("../../../public/hero/", import.meta.url);

for (const theme of ["day", "night"]) {
  const input = new URL(`haven-${theme}-original.png`, directory);
  for (const width of [768, 1200, 1586]) {
    for (const format of ["avif", "webp"]) {
      const output = new URL(`haven-${theme}-${width}.${format}`, directory);
      const result = await sharp(input.pathname)
        .resize({ width, withoutEnlargement: true })
        .toFormat(format, { quality: format === "avif" ? 65 : 82, effort: 6 })
        .toFile(output.pathname);
      console.log(`${output.pathname.split("/").pop()}: ${result.width} × ${result.height}, ${Math.round(result.size / 1024)} KiB`);
    }
  }
}
