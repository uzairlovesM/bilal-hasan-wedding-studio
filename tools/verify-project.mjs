import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredAssets = [
  'public/assets/envelope-still-life.webp',
  'public/assets/mehndi-scene.webp',
  'public/assets/barat-scene.webp',
  'public/assets/walima-scene.webp',
  'public/assets/mehndi-detail.webp',
  'public/assets/barat-detail.webp',
  'public/assets/walima-detail.webp',
  'public/assets/landing-impact.wav',
  'public/assets/paper-rustle.wav',
  'public/assets/seal-crack.wav',
  'public/models/envelope-prop.glb',
  'public/hdri/wedding-studio.hdr',
  'public/manifest.webmanifest',
  'Open-Offline.html'
];
const missing = requiredAssets.filter(file => !existsSync(path.join(root, file)));
if (missing.length) throw new Error(`Missing files: ${missing.join(', ')}`);
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const expected = ['three', 'pixi.js', 'gsap', 'animejs', 'motion', 'lenis', 'react', 'react-dom', 'zustand', 'zod', 'matter-js', 'cannon-es', '@dimforge/rapier3d-compat', 'tone', 'howler', 'lottie-web', '@rive-app/canvas', '@babylonjs/core'];
const missingDeps = expected.filter(name => !pkg.dependencies?.[name]);
if (missingDeps.length) throw new Error(`Missing dependencies: ${missingDeps.join(', ')}`);
const html = await readFile(path.join(root, 'Open-Offline.html'), 'utf8');
const app = await readFile(path.join(root, 'src/App.tsx'), 'utf8');
const all = html + app;
for (const phrase of ['بلال حسن', 'ظفر اقبال', 'مہندی', 'بارات', 'ولیمہ']) if (!all.includes(phrase)) throw new Error(`Invitation content missing: ${phrase}`);
if (/whatsapp/i.test(all)) throw new Error('A WhatsApp integration was found in the project.');
const htmlAssets = [...html.matchAll(/(?:src|href|url\()=["']?(public\/[^\s"')]+)|url\(['"]?(public\/[^\s"')]+)/g)].map(match => match[1] || match[2]).filter(Boolean);
const missingHtmlAssets = [...new Set(htmlAssets)].filter(file => !existsSync(path.join(root, file)));
if (missingHtmlAssets.length) throw new Error(`Offline asset references missing: ${missingHtmlAssets.join(', ')}`);
const glb = await readFile(path.join(root, 'public/models/envelope-prop.glb'));
if (glb.toString('utf8', 0, 4) !== 'glTF') throw new Error('Envelope GLB header is invalid.');
const hdr = await readFile(path.join(root, 'public/hdri/wedding-studio.hdr'));
if (!hdr.toString('ascii', 0, 10).startsWith('#?RADIANCE')) throw new Error('HDRI header is invalid.');
const names = await readdir(root);
if (names.some(name => /^readme(\.|$)/i.test(name))) throw new Error('A README file is present.');
const srcCount = await countSourceFiles(path.join(root, 'src'));
console.log(`Project verification passed. ${requiredAssets.length} required asset files found. ${expected.length} required runtime dependencies declared. ${srcCount} source files scanned.`);

async function countSourceFiles(directory) {
  let total = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) total += await countSourceFiles(target);
    else if (/\.(ts|tsx|css)$/.test(entry.name)) total += 1;
  }
  return total;
}
