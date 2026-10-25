// Genera los íconos PNG de la app (mismo diseño que public/icons/icon.svg) sin dependencias externas.
// Uso: node scripts/generar-iconos.mjs
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const VERDE = [0x15, 0x80, 0x3d];
const BLANCO = [0xff, 0xff, 0xff];
const AMARILLO = [0xfa, 0xcc, 0x15];

function dentroRectRedondeado(x, y, x0, y0, ancho, alto, r) {
  if (x < x0 || x > x0 + ancho || y < y0 || y > y0 + alto) return false;
  const cx = Math.min(Math.max(x, x0 + r), x0 + ancho - r);
  const cy = Math.min(Math.max(y, y0 + r), y0 + alto - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

/** Color del punto (x, y) en coordenadas 0..100, o null si es transparente */
function colorEn(x, y, maskable) {
  const fondo = maskable ? true : dentroRectRedondeado(x, y, 0, 0, 100, 100, 22);
  if (!fondo) return null;
  // En la versión "maskable" el dibujo se encoge para quedar dentro de la zona segura
  const escala = maskable ? 0.8 : 1;
  const px = (x - 50) / escala + 50;
  const py = (y - 50) / escala + 50;
  if (
    dentroRectRedondeado(px, py, 24, 58, 12, 18, 3) ||
    dentroRectRedondeado(px, py, 44, 46, 12, 30, 3) ||
    dentroRectRedondeado(px, py, 64, 38, 12, 38, 3)
  )
    return BLANCO;
  if ((px - 70) ** 2 + (py - 25) ** 2 <= 49) return AMARILLO;
  return VERDE;
}

const TABLA_CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const b of buffer) c = TABLA_CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function bloque(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const tipoYDatos = Buffer.concat([Buffer.from(tipo, "ascii"), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(tipoYDatos));
  return Buffer.concat([largo, tipoYDatos, crc]);
}

function png(tamano, maskable) {
  const MUESTRAS = 4; // suavizado de bordes
  const filas = [];
  for (let fy = 0; fy < tamano; fy++) {
    const fila = Buffer.alloc(1 + tamano * 4); // byte 0 = filtro "ninguno"
    for (let fx = 0; fx < tamano; fx++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < MUESTRAS; sy++) {
        for (let sx = 0; sx < MUESTRAS; sx++) {
          const x = ((fx + (sx + 0.5) / MUESTRAS) / tamano) * 100;
          const y = ((fy + (sy + 0.5) / MUESTRAS) / tamano) * 100;
          const c = colorEn(x, y, maskable);
          if (c) {
            r += c[0];
            g += c[1];
            b += c[2];
            a++;
          }
        }
      }
      const i = 1 + fx * 4;
      if (a > 0) {
        fila[i] = Math.round(r / a);
        fila[i + 1] = Math.round(g / a);
        fila[i + 2] = Math.round(b / a);
      }
      fila[i + 3] = Math.round((a / (MUESTRAS * MUESTRAS)) * 255);
    }
    filas.push(fila);
  }
  const cabecera = Buffer.alloc(13);
  cabecera.writeUInt32BE(tamano, 0);
  cabecera.writeUInt32BE(tamano, 4);
  cabecera[8] = 8; // bits por canal
  cabecera[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloque("IHDR", cabecera),
    bloque("IDAT", deflateSync(Buffer.concat(filas))),
    bloque("IEND", Buffer.alloc(0)),
  ]);
}

const salida = new URL("../public/icons/", import.meta.url);
const iconos = [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["icon-maskable-512.png", 512, true],
  ["apple-touch-icon.png", 180, true], // iOS pone sus propias esquinas redondeadas
];
for (const [nombre, tamano, maskable] of iconos) {
  writeFileSync(new URL(nombre, salida), png(tamano, maskable));
  console.log("Creado", nombre);
}
