// Genera los íconos PNG para la PWA sin dependencias externas
// Fondo oscuro (#0f172a) con círculo azul (#3b82f6) y letras "TP"

import zlib from "zlib";
import fs from "fs";
import path from "path";

const publicDir = path.resolve("public");
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

function crc32(buf) {
  const table = Array.from({ length: 256 }, (_, i) => {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  let crc = 0xffffffff;
  for (const byte of buf) crc = (table[(crc ^ byte) & 0xff] ^ (crc >>> 8)) >>> 0;
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createIconPNG(size) {
  const cx = size / 2;
  const cy = size / 2;
  const radio = size * 0.42;
  const grosor = size * 0.07;

  // Píxeles RGB
  const pixels = [];
  for (let y = 0; y < size; y++) {
    pixels.push(0); // filtro de fila
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Fondo con esquinas redondeadas (radio = size * 0.18)
      const cornerR = size * 0.18;
      const inRounded =
        (x >= cornerR && x <= size - cornerR) ||
        (y >= cornerR && y <= size - cornerR) ||
        Math.sqrt(Math.min(x, size - x - 1) ** 2 + Math.min(y, size - y - 1) ** 2) <=
          cornerR;

      if (!inRounded) {
        pixels.push(0, 0, 0, 0); // transparente
        continue;
      }

      // Círculo exterior (borde azul)
      if (dist <= radio && dist >= radio - grosor) {
        pixels.push(59, 130, 246, 255); // azul
      }
      // Interior del círculo: fondo más claro
      else if (dist < radio - grosor) {
        pixels.push(30, 41, 59, 255); // azul muy oscuro
      }
      // Fondo del ícono
      else {
        pixels.push(15, 23, 42, 255); // #0f172a
      }
    }
  }

  const rawData = Buffer.from(pixels);
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const sizes = [
  { name: "icon-192.png",        size: 192 },
  { name: "icon-512.png",        size: 512 },
  { name: "apple-touch-icon.png",size: 180 },
];

for (const { name, size } of sizes) {
  const dest = path.join(publicDir, name);
  fs.writeFileSync(dest, createIconPNG(size));
  console.log(`✓ ${name} (${size}x${size})`);
}

console.log("\nÍconos generados en /public");
