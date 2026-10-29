#!/usr/bin/env node
// Finara · tools/cek.mjs — pemeriksa konsistensi sebelum rilis.
// Jalankan dari folder proyek:  node tools/cek.mjs
// Butuh Node 18+ (hanya untuk pemeriksaan ini; aplikasinya sendiri tidak butuh Node).
// Juga berjalan otomatis di GitHub lewat .github/workflows/cek.yml setiap berkas diunggah.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const baca = (p) => readFileSync(join(root, p), 'utf8');
const ada = (p) => existsSync(join(root, p));
const gagal = [];
const peringatan = [];
let ok = 0;
const cek = (kondisi, pesan) => { if (kondisi) ok++; else gagal.push(pesan); };

// 1. versi.js: nomor, tanggal, riwayat
let V = {};
try {
  const kotak = {};
  vm.createContext(kotak);
  vm.runInContext(baca('versi.js') + '\n;this.__v={VER,TGL,RIWAYAT}', kotak);
  V = kotak.__v;
} catch (e) { gagal.push('versi.js tidak bisa dibaca: ' + e.message); }

if (V.VER) {
  cek(/^\d+\.\d+\.\d+$/.test(V.VER), `versi.js: VER "${V.VER}" harus berbentuk angka.angka.angka (contoh 1.4.3)`);
  cek(/^\d{4}-\d{2}-\d{2}$/.test(V.TGL), `versi.js: TGL "${V.TGL}" harus berbentuk TTTT-BB-HH (contoh 2026-10-29)`);
  cek(Array.isArray(V.RIWAYAT) && V.RIWAYAT.length > 0, 'versi.js: RIWAYAT kosong');
  const atas = V.RIWAYAT[0] || {};
  cek(atas.v === V.VER, `versi.js: entri RIWAYAT paling atas bernomor "${atas.v}", tetapi VER "${V.VER}". Tambahkan entri baru PALING ATAS.`);
  cek(atas.t === V.TGL, `versi.js: tanggal entri teratas "${atas.t}" berbeda dari TGL "${V.TGL}"`);
  cek(Array.isArray(atas.u) && atas.u.length > 0, 'versi.js: entri teratas belum berisi daftar perubahan (u)');
  const nomor = V.RIWAYAT.map((r) => r.v);
  cek(new Set(nomor).size === nomor.length, 'versi.js: ada nomor versi ganda di RIWAYAT');
  const cl = ada('CHANGELOG.md') ? baca('CHANGELOG.md') : '';
  cek(cl.includes(`## [${V.VER}]`), `CHANGELOG.md: belum ada bagian "## [${V.VER}]". Tambahkan catatan untuk pengembang.`);
}

// 2. index.html: berkas yang dirujuk ada; js/ lengkap dan berurutan
const html = baca('index.html');
const skrip = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
const css = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
for (const f of [...skrip, ...css]) cek(ada(f), `index.html merujuk "${f}" tetapi berkas itu tidak ada`);
const jsAda = readdirSync(join(root, 'js')).filter((f) => f.endsWith('.js')).sort();
for (const f of jsAda) cek(skrip.includes('js/' + f), `js/${f} ada di folder tetapi belum dimuat di index.html`);
const jsDimuat = skrip.filter((s) => s.startsWith('js/'));
cek(JSON.stringify(jsDimuat) === JSON.stringify([...jsDimuat].sort()), 'index.html: urutan <script> js/ tidak sesuai urutan angka pada nama berkas');
cek(skrip.indexOf('versi.js') !== -1 && skrip.indexOf('versi.js') < skrip.findIndex((s) => s.startsWith('js/')), 'index.html: versi.js dan config.js harus dimuat SEBELUM berkas js/');

// 3. sw.js: daftar cache lengkap dan semua berkasnya ada
const sw = baca('sw.js');
const inti = [...(sw.match(/const INTI = \[([\s\S]*?)\];/) || [, ''])[1].matchAll(/'\.\/([^']*)'/g)].map((m) => m[1]);
cek(inti.length > 0, 'sw.js: daftar INTI tidak terbaca');
for (const f of inti) if (f) cek(ada(f), `sw.js: INTI memuat "${f}" yang tidak ada (addAll akan gagal dan aplikasi tidak bisa offline)`);
for (const f of [...skrip, ...css, 'manifest.webmanifest']) cek(inti.includes(f), `sw.js: "${f}" dipakai aplikasi tetapi belum ada di daftar INTI (tidak akan tersedia offline)`);
cek(/importScripts\('versi\.js'\)/.test(sw) && /'finara-v'\s*\+\s*VER/.test(sw), 'sw.js: nama cache harus berasal dari versi.js (importScripts + VER)');

// 4. sintaks setiap berkas JS
for (const f of ['config.js', 'versi.js', 'sw.js', ...jsAda.map((x) => 'js/' + x)]) {
  try { new vm.Script(baca(f), { filename: f }); ok++; } catch (e) { gagal.push(`${f}: kesalahan sintaks: ${e.message}`); }
}

// 5. manifest
try {
  const m = JSON.parse(baca('manifest.webmanifest'));
  for (const i of m.icons || []) cek(ada(i.src), `manifest: ikon "${i.src}" tidak ada`);
  cek(ada(m.start_url.replace(/^\.\//, '')), `manifest: start_url "${m.start_url}" tidak ada`);
} catch (e) { gagal.push('manifest.webmanifest tidak valid: ' + e.message); }

// 6. privasi: tidak ada alamat internet yang dipanggil aplikasi
const periksaPrivasi = ['index.html', 'styles.css', 'config.js', 'versi.js', 'sw.js', ...jsAda.map((x) => 'js/' + x)];
const diizinkan = [/^http:\/\/www\.w3\.org\/2000\/svg$/];
for (const f of periksaPrivasi) {
  let isi = baca(f).replace(/<meta property="og:[^>]*>/g, ''); // tag pratinjau tautan boleh berisi alamat
  isi = isi.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const m of isi.matchAll(/https?:\/\/[^\s"'`)<>]+/g)) {
    if (f === 'config.js') continue; // FEEDBACK_URL memang alamat yang Anda isi sendiri
    if (!diizinkan.some((r) => r.test(m[0]))) gagal.push(`${f}: ada alamat internet "${m[0]}". Finara berjanji tidak menghubungi server mana pun.`);
  }
}
if (/FEEDBACK_URL\s*=\s*''/.test(baca('config.js'))) peringatan.push('config.js: FEEDBACK_URL masih kosong (menu "Kirim masukan" tidak tampil). Abaikan jika memang tidak dipakai.');
if (/USERNAME/.test(html)) peringatan.push('index.html: og:image masih memuat USERNAME (pratinjau tautan belum aktif). Abaikan jika tidak perlu.');

// Hasil
for (const p of peringatan) console.log('⚠  ' + p);
if (gagal.length) {
  console.log(`\n✗ ${gagal.length} masalah ditemukan:\n`);
  for (const g of gagal) console.log('  - ' + g);
  console.log(`\n(${ok} pemeriksaan lolos)`);
  process.exit(1);
}
console.log(`\n✓ Semua pemeriksaan lolos (${ok}). Finara v${V.VER} · ${V.TGL}`);
