/**
 * gen-qr-logo.mjs — QR code de marque HM Global (symbole au centre).
 *
 * QR à correction d'erreur HAUTE (niveau H, ~30 % de récupération) : le
 * symbole HM posé au centre n'empêche pas la lecture. Modules quasi noirs
 * sur fond blanc = lecture fiable sur tous les téléphones et à l'impression.
 *
 * Usage :
 *   node scripts/gen-qr-logo.mjs [url] [chemin-sortie.png]
 * Défaut : https://www.hm-global.fr → Desktop/…/hm-global-qr-logo.png
 */

import QRCode from "qrcode";
import sharp from "sharp";
import path from "path";

const URL = process.argv[2] || "https://www.hm-global.fr";
const OUT =
  process.argv[3] ||
  path.join(
    process.env.HOME,
    "Desktop/1 Haziran 2026 QR Kodlar/hm-global.fr/hm-global-qr-logo.png",
  );
const SIZE = 1600; // px — qualité impression

// 1. QR de base, correction d'erreur haute.
const qrBuf = await QRCode.toBuffer(URL, {
  errorCorrectionLevel: "H",
  type: "png",
  width: SIZE,
  margin: 2,
  color: { dark: "#1d1d1bff", light: "#ffffffff" },
});

// 2. Pastille blanche arrondie + symbole HM centré (≈ 22 % de la largeur).
const pad = Math.round(SIZE * 0.22);
const radius = Math.round(pad * 0.24);
const padSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${pad}" height="${pad}">` +
    `<rect width="${pad}" height="${pad}" rx="${radius}" ry="${radius}" fill="#ffffff"/></svg>`,
);

const symbolBox = Math.round(pad * 0.66);
const symbol = await sharp(path.join(process.cwd(), "public/logo/hm-global-symbol.png"))
  .resize({ width: symbolBox, height: symbolBox, fit: "inside" })
  .png()
  .toBuffer();
const sm = await sharp(symbol).metadata();

const badge = await sharp(padSvg)
  .composite([
    {
      input: symbol,
      left: Math.round((pad - (sm.width ?? symbolBox)) / 2),
      top: Math.round((pad - (sm.height ?? symbolBox)) / 2),
    },
  ])
  .png()
  .toBuffer();

const off = Math.round((SIZE - pad) / 2);
await sharp(qrBuf)
  .composite([{ input: badge, left: off, top: off }])
  .png()
  .toFile(OUT);

console.log(`✅ ${OUT}\n   → ${URL}`);
