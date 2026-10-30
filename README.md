# Finara

Pencatat keuangan pribadi dan usaha. Satu aplikasi web (PWA), tanpa server, tanpa akun.
Data tersimpan di peramban masing-masing pengguna dan aplikasi bisa dipakai offline.

Made by **Herysap61**. Lisensi MIT.

## Fitur

- Ruang kerja **Pribadi** dan **Usaha** yang terpisah penuh, dengan penanda mode di layar
- Profil: Perorangan, Perorangan dengan usaha, atau Bisnis (menyesuaikan istilah dan fitur)
- Pemasukan, pengeluaran, transfer antar rekening, modal dan penarikan pemilik, pinjaman, refund, koreksi saldo
- Laporan periode, grafik tren, anggaran bulanan beserta laju pemakaiannya
- Transaksi berulang, utang-piutang, target tabungan, simulasi tabungan
- Pribadi: **jatah harian sampai gajian** (angka utama di Beranda), setelah dikurangi tagihan, tabungan yang diamankan, dan cadangan tak terduga (persentase 10% atau nominal tetap); tiga pertanyaan awal, pratinjau dampak saat mencatat, dan tagihan tetap
- Usaha: arus kas 30 hari, umur piutang dan utang, jurnal debit-kredit (fitur lanjutan; pengembangan mode ini ditahan sementara)
- Kekayaan gabungan Pribadi + Usaha
- Cadangan dan pemulihan (JSON dan CSV), ekspor CSV
- Mode terang, gelap, atau otomatis
- Tombol **Pasang Finara di perangkat ini** (kartu di Beranda dan menu Lainnya), dengan petunjuk untuk iPhone
- Data contoh sekali ketuk untuk mencoba

## Privasi

Finara tidak punya server, akun, atau pelacak, dan tidak memuat apa pun dari internet
(tanpa font eksternal, tanpa skrip pihak ketiga). Pencadangan dan pemulihan murni lewat file
yang disimpan pengguna sendiri. `tools/cek.mjs` memeriksa otomatis bahwa tidak ada alamat internet
yang terselip di kode.

## Struktur proyek

```
index.html            Kerangka halaman; urutan <script> = urutan pemuatan
styles.css            Seluruh tampilan
config.js             Pengaturan jarang berubah (mis. FEEDBACK_URL)
versi.js              SATU-SATUNYA tempat nomor versi dan catatan pembaruan
js/                   Logika aplikasi, berkas berurutan (01-dasar … 11-mulai, termasuk 06b dan 09b untuk jatah harian)
sw.js                 Service worker: cache offline & pemasangan versi baru
manifest.webmanifest  Agar bisa dipasang seperti aplikasi
icon*.png, icon.svg   Ikon
CHANGELOG.md          Catatan perubahan untuk pengembang
docs/PETA-KODE.md     Di mana letak apa; model data; resep menambah fitur
docs/PANDUAN-PEMBARUAN.md   Daftar periksa rilis, penomoran versi, pemecahan masalah
tools/cek.mjs         Pemeriksa otomatis sebelum rilis
.github/workflows/    Menjalankan pemeriksa itu di GitHub tiap ada unggahan
```

**Mulai dari sini bila ingin mengubah sesuatu:** buka `docs/PETA-KODE.md` untuk menemukan berkas yang
tepat, lalu ikuti `docs/PANDUAN-PEMBARUAN.md` saat merilis.

## Memperbarui aplikasi (ringkas)

1. Ubah kode di `js/` (atau `styles.css`, `index.html`).
2. Di `versi.js`: naikkan `VER` dan `TGL`, lalu tambahkan entri baru **paling atas** di `RIWAYAT`.
3. Tambahkan bagian baru di `CHANGELOG.md`.
4. (Disarankan) jalankan `node tools/cek.mjs`.
5. Unggah ke GitHub. Pengguna akan melihat pesan **Versi baru siap, Muat ulang**.

`sw.js` tidak perlu diubah pada rilis biasa karena membaca nomor versi dari `versi.js`.
Ubah `sw.js` hanya bila menambah atau menghapus berkas aplikasi.

## Cara meng-hosting di GitHub Pages

1. Buat repositori di GitHub, lalu unggah **semua** isi folder ini (termasuk folder `js`, `docs`, `tools`).
   Lewat web: **Add file > Upload files**, tarik-lepas folder.
2. Buka **Settings > Pages**. Pada **Build and deployment**, pilih **Deploy from a branch**,
   branch `main`, folder `/ (root)`, lalu **Save**.
3. Tunggu satu sampai dua menit. Alamatnya: `https://USERNAME.github.io/NAMA-REPOSITORI/`
4. Bagikan tautan itu.

Opsional: ganti `USERNAME` pada tag `og:image` di `index.html` agar pratinjau tautan muncul.
Opsional: isi `FEEDBACK_URL` di `config.js` dengan `https://github.com/USERNAME/NAMA-REPOSITORI/issues/new`
agar menu **Lainnya > Kirim masukan** muncul (aktifkan **Issues** di repositori).

## Cara memasang di HP

- **Android (Chrome):** buka tautan, menu ⋮, **Instal aplikasi** atau **Tambahkan ke layar utama**.
- **iPhone (Safari):** buka tautan, **Bagikan**, **Tambah ke Layar Utama**.

## Catatan penting untuk penguji

- Data hanya ada di perangkat masing-masing. Menghapus data situs peramban akan menghapus data Finara.
  Gunakan **Lainnya > Cadangan dan pulihkan** secara rutin.
- Jangan pakai tab penyamaran (incognito).
- Mode offline hanya aktif bila aplikasi dibuka lewat tautan web (https). Membuka file HTML langsung
  dari penyimpanan tidak mengaktifkannya.
- Belum tersedia: kunci PIN/biometrik, enkripsi cadangan, notifikasi pengingat. Sengaja belum ada
  karena proyek ini untuk percobaan dan portofolio.

## Pengujian sebelum rilis

Jalankan dari folder proyek dengan Node.js 22 atau lebih baru:

```sh
node tools/cek.mjs
node tools/uji-keuangan.mjs
node tools/uji-jatah.mjs
node tools/uji-kesehatan-pribadi.mjs
node tools/uji-migrasi-pribadi.mjs
node tools/uji-pratinjau-pribadi.mjs
node tools/uji-rekonsiliasi-pribadi.mjs
node tools/uji-alur-pribadi.mjs
```

Pengujian ini memeriksa integritas rilis, rumus indikator, jatah harian dengan saldo yang dihitung dari transaksi aktual, kesehatan keuangan Pribadi, serta migrasi skema. Tetap lakukan pengujian manual pada browser, terutama alur backup dan pemulihan.

## Menjalankan di komputer sendiri

Layanan offline butuh `http://`, bukan `file://`. Dari folder proyek:

```
python3 -m http.server 8000
```

lalu buka `http://localhost:8000`. (Atau alat server statis apa pun.)
