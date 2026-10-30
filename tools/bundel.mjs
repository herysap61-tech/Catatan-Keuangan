#!/usr/bin/env node
// Finara · tools/bundel.mjs — membuat versi SATU BERKAS (mandiri) dari proyek.
// Jalankan dari folder proyek:  node tools/bundel.mjs [berkas-keluaran.html]
// Hasil: HTML dengan CSS dan semua JS di dalamnya, CSP berbasis hash, tanpa permintaan ke internet.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const baca = (p) => readFileSync(join(root, p), 'utf8');
let html = baca('index.html');
const VER = /VER='([^']+)'/.exec(baca('versi.js'))[1];
const svg = 'data:image/svg+xml;base64,' + readFileSync(join(root, 'icon.svg')).toString('base64');
const hashes = [];
html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\n?/, '@@CSP@@\n');
html = html.replace(/<link rel="manifest"[^>]*>/, '').replace(/<link rel="apple-touch-icon"[^>]*>/, '');
html = html.replace(/<link rel="icon" href="icon-192.png"[^>]*>/, '').replace(/<link rel="icon" href="icon.svg"[^>]*>/, `<link rel="icon" href="${svg}" type="image/svg+xml">`);
html = html.replace(/<meta property="og:image"[^>]*>/, '');
html = html.replace(/<img src="icon.svg"/, `<img src="${svg}"`);
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/, (_, f) => `<style>\n${baca(f)}\n</style>`);
html = html.replace(/<script src="([^"]+)"><\/script>\n?/g, (_, f) => {
  const code = '\n' + baca(f).replace(/<\/script/gi, '<\\/script') + '\n';
  hashes.push("'sha256-" + createHash('sha256').update(code).digest('base64') + "'");
  return `<script>${code}</script>\n`;
});
html = html.replace('@@CSP@@', `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${hashes.join(' ')}; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">`);
html = html.replace(/<!--\nFINARA · BACA INI DULU[\s\S]*?-->/, '<!--\nFINARA · versi satu berkas (mandiri)\nSemua CSS dan JavaScript sudah digabung di berkas ini; tidak ada permintaan ke internet.\nFitur offline otomatis (service worker) dan pemasangan ke layar utama hanya aktif pada versi web (https).\nUntuk memperbarui kode, pakai paket lengkap (ZIP), bukan berkas ini.\n-->');
const out = process.argv[2] || join(root, `finara-v${VER.replace(/\./g, '_')}.html`);
writeFileSync(out, html);
console.log('✓ ' + out + ' (' + Math.round(html.length / 1024) + ' KB, ' + hashes.length + ' skrip)');
