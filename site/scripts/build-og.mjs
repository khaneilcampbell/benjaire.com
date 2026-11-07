// Builds the two 1200x630 share cards in the v0.4 "Silver Blue" style:
//   public/og/benjaire-og.png  company card: signal lines on night landing in
//                              one ice-blue point, the pearl lockup and the
//                              slogan (keep in sync with SITE.slogan).
//   public/og/flow-og.png      Flow card: the B + "Flow" lockup, the promise,
//                              the price and a sample owner alert.
// Run from site/: node scripts/build-og.mjs
// The text is SVG, so it needs Archivo (instanced at wdth 112) and IBM Plex
// Mono installed as system fonts, named ArchivoOG330, ArchivoOG400 and
// "IBM Plex Mono". The @fontsource files converted with fontTools work.
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const W = 1200, H = 630;
const C = { night: '#0b0d10', night2: '#12161c', on: '#e8edf3', low: '#9aa7b6', ice: '#8fb3dc', blue: '#2e5a8c', paper: '#ffffff', ink: '#0b0d10', mid: '#3d4651', faint: '#566170', line: '#dde3ea', dangerT: '#f8e9e7', danger: '#a3271a', bg: '#f4f6f8' };

// The logo files recoloured to pearl for the dark card (shape untouched).
const pearl = async (file, height) => {
  const svg = (await readFile(file, 'utf8')).replaceAll('#1f2124', C.on);
  return sharp(Buffer.from(svg), { density: 600 }).resize({ height }).png().toBuffer();
};

// Deterministic signal lines converging on (tx, ty), dot grid and glow.
const field = (tx, ty, n = 22) => {
  let paths = '';
  for (let i = 0; i < n; i++) {
    const y = 20 + i * (H - 40) / (n - 1) + ((i * 37) % 13);
    const c1 = 220 + ((i * 53) % 260);
    paths += `<path d="M-20 ${y.toFixed(1)} C ${c1} ${(y + (i % 2 ? 50 : -50)).toFixed(1)}, ${tx - 260 + ((i * 29) % 140)} ${ty}, ${tx} ${ty}"/>`;
  }
  let dots = '';
  for (let x = 12; x < W; x += 24) for (let y = 12; y < H; y += 24) dots += `<circle cx="${x}" cy="${y}" r="1"/>`;
  return `
  <rect width="${W}" height="${H}" fill="${C.night}"/>
  <g fill="${C.on}" fill-opacity=".07">${dots}</g>
  <defs>
    <linearGradient id="lg" x1="0" x2="${tx}" y1="0" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${C.on}" stop-opacity=".05"/>
      <stop offset=".6" stop-color="${C.on}" stop-opacity=".2"/>
      <stop offset="1" stop-color="${C.ice}" stop-opacity=".9"/>
    </linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="${C.ice}" stop-opacity=".32"/><stop offset="1" stop-color="${C.ice}" stop-opacity="0"/></radialGradient>
    <linearGradient id="veil" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="${C.night}" stop-opacity="1"/><stop offset=".42" stop-color="${C.night}" stop-opacity=".85"/><stop offset=".62" stop-color="${C.night}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <circle cx="${tx}" cy="${ty}" r="260" fill="url(#glow)"/>
  <g fill="none" stroke="url(#lg)" stroke-width="1.2">${paths}</g>
  <rect width="${W}" height="${H}" fill="url(#veil)"/>`;
};

// Company card.
{
  const tx = 930, ty = 300;
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${field(tx, ty)}
    <circle cx="${tx}" cy="${ty}" r="22" fill="none" stroke="${C.ice}" stroke-opacity=".45"/>
    <circle cx="${tx}" cy="${ty}" r="7" fill="${C.ice}"/>
    <path d="M${tx} ${ty}H${W + 10}" stroke="${C.ice}" stroke-opacity=".5"/>
    <text font-family="ArchivoOG400" font-size="60" letter-spacing="-1.8" fill="${C.on}"><tspan x="62" y="430">Smarter systems.</tspan></text>
    <text font-family="ArchivoOG400" font-size="60" letter-spacing="-1.8" fill="${C.ice}"><tspan x="62" y="500">Better business.</tspan></text>
    <text x="64" y="566" font-family="IBM Plex Mono" font-size="15" letter-spacing="2.4" fill="${C.low}">DIGITAL SOLUTIONS · BENJAIRE.COM · NEW YORK</text>
  </svg>`;
  await sharp(Buffer.from(svg))
    .composite([{ input: await pearl('public/brand/benjaire-lockup-horizontal.svg', 34), left: 64, top: 64 }])
    .png({ compressionLevel: 9 }).toFile('public/og/benjaire-og.png');
  console.log('wrote public/og/benjaire-og.png');
}

// Flow card. The alert is sample data and says so.
{
  const ax = 690, ay = 170, aw = 450, ah = 290;
  const tx = ax, ty = ay + ah / 2;
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${field(tx, ty)}
    <rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" rx="16" fill="${C.paper}"/>
    <path d="M${ax} ${ay + 44}H${ax + aw}" stroke="${C.line}"/>
    <g fill="${C.line}"><circle cx="${ax + 22}" cy="${ay + 22}" r="5"/><circle cx="${ax + 38}" cy="${ay + 22}" r="5"/><circle cx="${ax + 54}" cy="${ay + 22}" r="5"/></g>
    <text x="${ax + 74}" y="${ay + 27}" font-family="IBM Plex Mono" font-size="12" letter-spacing="1.6" fill="${C.faint}">OWNER ALERT</text>
    <text x="${ax + aw - 22}" y="${ay + 27}" text-anchor="end" font-family="IBM Plex Mono" font-size="12" letter-spacing="1.6" fill="${C.faint}">SAMPLE DATA</text>
    <circle cx="${ax + 26}" cy="${ay + 72}" r="4" fill="${C.blue}"/>
    <text x="${ax + 38}" y="${ay + 76}" font-family="IBM Plex Mono" font-size="12" letter-spacing="1.6" fill="${C.blue}">SORTED BY CLAUDE · JUST NOW</text>
    <text x="${ax + 22}" y="${ay + 108}" font-family="Inter" font-weight="600" font-size="19" fill="${C.ink}">[Urgent] New inquiry: Dana Lee, Lee &amp; Co</text>
    <g font-family="Inter" font-weight="500" font-size="14">
      <rect x="${ax + 22}" y="${ay + 126}" width="82" height="28" rx="14" fill="${C.bg}"/><text x="${ax + 63}" y="${ay + 145}" text-anchor="middle" fill="${C.ink}">Branding</text>
      <rect x="${ax + 112}" y="${ay + 126}" width="70" height="28" rx="14" fill="${C.dangerT}"/><text x="${ax + 147}" y="${ay + 145}" text-anchor="middle" fill="${C.danger}">Urgent</text>
      <rect x="${ax + 190}" y="${ay + 126}" width="64" height="28" rx="14" fill="${C.bg}"/><text x="${ax + 222}" y="${ay + 145}" text-anchor="middle" fill="${C.ink}">$5,000</text>
    </g>
    <path d="M${ax + 23} ${ay + 172}V${ay + 212}" stroke="${C.line}" stroke-width="2"/>
    <text font-family="Inter" font-size="15" fill="${C.mid}"><tspan x="${ax + 36}" y="${ay + 188}">Hi Dana, thank you for reaching out. A launch</tspan><tspan x="${ax + 36}" y="${ay + 208}">next week is a tight window…</tspan></text>
    <g font-family="Inter" font-weight="500" font-size="14">
      <rect x="${ax + 22}" y="${ay + 234}" width="92" height="36" rx="18" fill="${C.ink}"/><text x="${ax + 68}" y="${ay + 257}" text-anchor="middle" fill="${C.paper}">I replied</text>
      <rect x="${ax + 122}" y="${ay + 234}" width="142" height="36" rx="18" fill="${C.blue}"/><text x="${ax + 193}" y="${ay + 257}" text-anchor="middle" fill="${C.paper}">Became a client</text>
      <rect x="${ax + 272.5}" y="${ay + 234.5}" width="70" height="35" rx="17.5" fill="none" stroke="${C.line}"/><text x="${ax + 307}" y="${ay + 257}" text-anchor="middle" fill="${C.ink}">Close</text>
    </g>
    <text x="104" y="92" font-family="ArchivoOG400" font-size="30" letter-spacing="-.6" fill="${C.on}">Benjaire <tspan font-family="ArchivoOG400" fill="${C.ice}">Flow</tspan></text>
    <text font-family="ArchivoOG400" font-size="54" letter-spacing="-1.6" fill="${C.on}"><tspan x="62" y="360">Every inquiry,</tspan></text>
    <text font-family="ArchivoOG400" font-size="54" letter-spacing="-1.6" fill="${C.ice}"><tspan x="62" y="424">answered on time.</tspan></text>
    <text x="64" y="486" font-family="Inter" font-size="20" fill="${C.low}">The inquiry system for service firms.</text>
    <text x="64" y="566" font-family="IBM Plex Mono" font-size="15" letter-spacing="2.4" fill="${C.low}">FROM $79, ONE TIME · BENJAIRE.COM</text>
  </svg>`;
  await sharp(Buffer.from(svg))
    .composite([{ input: await sharp('public/brand/benjaire-monogram-pearl.svg', { density: 600 }).resize({ height: 36 }).png().toBuffer(), left: 62, top: 64 }])
    .png({ compressionLevel: 9 }).toFile('public/og/flow-og.png');
  console.log('wrote public/og/flow-og.png');
}
