# Finara

Pencatat keuangan pribadi dan usaha. Satu aplikasi web (PWA), tanpa server, tanpa akun.
Data tersimpan di peramban masing-masing pengguna dan aplikasi bisa dipakai offline.

Made by **Herysap61**.

## Fitur

- Ruang kerja **Pribadi** dan **Usaha** yang terpisah penuh
- Pencatatan pemasukan, pengeluaran, transfer antar rekening, modal, pinjaman, dan koreksi saldo
- Laporan periode, grafik tren, anggaran bulanan, transaksi berulang, utang-piutang
- Cadangan dan pemulihan data (JSON), ekspor CSV
- Mode terang, gelap, atau otomatis
- Data contoh sekali ketuk untuk mencoba

## Cara meng-hosting di GitHub Pages

1. Buat repositori baru di GitHub, misalnya `finara`.
2. Unggah semua file di folder ini ke repositori (tarik-lepas lewat **Add file > Upload files**).
3. Buka **Settings > Pages**. Pada **Build and deployment**, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
4. Tunggu satu sampai dua menit. Alamatnya: `https://USERNAME.github.io/finara/`
5. Bagikan tautan itu ke rekan Anda.

## Cara memasang di HP

- **Android (Chrome):** buka tautan, menu ⋮, **Instal aplikasi** atau **Tambahkan ke layar utama**.
- **iPhone (Safari):** buka tautan, **Bagikan**, **Tambah ke Layar Utama**.

## Catatan penting untuk penguji

- Data hanya ada di perangkat masing-masing. Menghapus data situs peramban akan menghapus data Finara. Gunakan **Lainnya > Cadangan dan pulihkan** secara rutin.
- Jangan pakai tab penyamaran (incognito).
- Belum tersedia: kunci PIN, enkripsi cadangan, notifikasi pengingat.

## Memperbarui aplikasi

Setelah mengubah file, naikkan nilai `VERSI` di `sw.js` (mis. `finara-v1.2.0`) dan `VER` di `app.js`, lalu unggah ulang. Pengguna akan melihat pesan **Versi baru siap, Muat ulang**.

## Menerima masukan dari rekan

Aktifkan **Issues** di repositori, lalu isi konstanta `FEEDBACK_URL` di `app.js` dengan `https://github.com/USERNAME/finara/issues/new`. Menu **Lainnya > Kirim masukan** akan muncul otomatis.

## Struktur file

| File | Fungsi |
|---|---|
| `index.html` | Kerangka halaman |
| `styles.css` | Seluruh tampilan |
| `app.js` | Seluruh logika aplikasi |
| `manifest.webmanifest` | Agar bisa dipasang seperti aplikasi |
| `sw.js` | Cache untuk mode offline |
| `icon*.png`, `icon.svg`, `apple-touch-icon.png` | Ikon aplikasi |
| `.nojekyll` | Mencegah GitHub Pages memproses ulang file |
| `LICENSE` | Lisensi MIT |

## Privasi mutlak

Finara tidak punya server, akun, atau pelacak. Tidak ada data yang dikirim ke internet. Pencadangan dan pemulihan murni lewat file yang Anda simpan sendiri (**Lainnya > Cadangan dan pulihkan**): `.json` untuk cadangan lengkap, `.csv` untuk cadangan yang bisa dibuka di spreadsheet dan dipulihkan lagi. PIN dan enkripsi sengaja tidak disediakan karena proyek ini untuk percobaan dan portofolio.

## Sebelum meng-hosting

Ganti `USERNAME` pada tag `og:image` di `index.html` dengan nama akun GitHub Anda agar pratinjau tautan muncul.
