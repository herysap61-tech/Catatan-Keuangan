// Service worker Finara: halaman = jaringan dulu (cadangan: cache); aset = cache dulu lalu diperbarui di latar.
// Nomor versi dibaca dari versi.js (satu-satunya sumber). Tidak perlu mengubah berkas ini saat rilis biasa.
// Ubah berkas ini HANYA jika menambah/menghapus berkas aplikasi: perbarui daftar INTI di bawah.
importScripts('versi.js');
const VERSI = 'finara-v' + VER;

// Semua berkas yang harus tersedia offline. Urutan bebas. tools/cek.mjs memastikan daftar ini lengkap.
const INTI = [
  './', './index.html', './styles.css', './config.js', './versi.js',
  './js/01-dasar.js', './js/02-data.js', './js/03-hitung.js', './js/04-komponen.js',
  './js/05-grafik.js', './js/06-layar.js', './js/06b-jatah.js', './js/07-render-formulir.js', './js/08-data-lanjutan.js',
  './js/09-aksi.js', './js/09b-aksi-jatah.js', './js/10-peristiwa.js', './js/11-mulai.js',
  './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  // cache:'reload' = selalu ambil dari server, bukan cache peramban, agar semua berkas sama-sama versi baru
  e.waitUntil(caches.open(VERSI)
    .then(c => c.addAll(INTI.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n !== VERSI).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (new URL(r.url).origin !== location.origin) return; // tidak pernah menyentuh server lain (privasi)
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r)
      .then(res => { const cp = res.clone(); caches.open(VERSI).then(c => c.put('./index.html', cp)); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit => {
    const net = fetch(r)
      .then(res => { if (res && res.ok) { const cp = res.clone(); caches.open(VERSI).then(c => c.put(r, cp)); } return res; })
      .catch(() => hit);
    return hit || net;
  }));
});
