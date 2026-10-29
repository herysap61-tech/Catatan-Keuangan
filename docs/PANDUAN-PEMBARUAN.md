# Panduan Pembaruan Finara

Panduan langkah demi langkah untuk merilis versi baru. Untuk **letak kode** dan **aturan data**, lihat
`PETA-KODE.md`.

## 1. Daftar periksa rilis (salin dan centang)

- [ ] **Ubah kode** di `js/`, `styles.css`, atau `index.html` (lihat `PETA-KODE.md` bagian 2 dan 7).
- [ ] **Uji manual** dengan daftar di `PETA-KODE.md` bagian 8 (minimal bagian yang Anda ubah, plus cadangan-pulihkan).
- [ ] **`versi.js`**: naikkan `VER` dan `TGL`.
- [ ] **`versi.js`**: tambahkan entri baru **paling atas** di `RIWAYAT` (`v` sama dengan `VER`, `t` sama dengan `TGL`,
      `u` = daftar perubahan dalam bahasa pengguna).
- [ ] **`CHANGELOG.md`**: tambahkan bagian `## [versi baru] - tanggal` di atas (untuk pengembang: apa dan kenapa).
- [ ] Menambah/menghapus berkas aplikasi? Perbarui juga `index.html` (urutan `<script>`) dan `sw.js` (daftar `INTI`).
- [ ] **`node tools/cek.mjs`** harus berakhir dengan ✓ (atau lihat hasil otomatis di tab **Actions** GitHub setelah unggah).
- [ ] **Unggah** ke GitHub (bagian 4).
- [ ] **Verifikasi tayang** (bagian 5).

`sw.js` **tidak** perlu diubah untuk rilis biasa: nama cache dibentuk dari `VER` di `versi.js`.

## 2. Penomoran versi (`MAJOR.MINOR.PATCH`)

| Jenis perubahan | Contoh | Naikkan |
|---|---|---|
| Perbaikan bug, teks, tampilan kecil; data tidak berubah | 1.4.3 → 1.4.4 | PATCH |
| Fitur baru yang tetap bisa membaca data lama | 1.4.3 → 1.5.0 | MINOR (PATCH kembali 0) |
| Perubahan besar atau **skema data berubah** sehingga versi lama tak bisa membaca data baru | 1.5.0 → 2.0.0 | MAJOR |

Perubahan skema (`SCHEMA` di `02-data.js` naik) minimal MINOR, dan wajib melalui langkah `PETA-KODE.md` 7.4.
Entri lama di `RIWAYAT` yang bernomor dua angka (`1.3`, `1.2`, `1.1`) dibiarkan; hanya `VER` saat ini yang
harus berbentuk tiga angka.

## 3. Contoh isi

**`versi.js`**: ubah dua konstanta dan sisipkan satu entri paling atas. (Isi di bawah hanya contoh rekaan.)

```js
const VER='1.5.0',TGL='2026-11-15';
const RIWAYAT=[
{v:'1.5.0',t:'2026-11-15',u:['Kunci PIN untuk membuka aplikasi','Perbaikan: saldo rekening kosong tampil Rp0']},
{v:'1.4.3',t:'2026-10-29',u:[ … ]},
```

Tulis `u` seperti memberi tahu pengguna, bukan seperti pesan commit.

**`CHANGELOG.md`**: bagian baru di atas.

```md
## [1.5.0] - 2026-11-15

### Ditambah
- Kunci PIN: aksi `pin*` di `09-aksi.js`, pengecekan saat start di `11-mulai.js`. PIN disimpan sebagai hash, bukan teks.

### Diperbaiki
- Ringkasan periode salah saat tanggal gajian 28: perhitungan di `range()` (`03-hitung.js`). Jelaskan penyebab singkat.

### Catatan
- Tidak ada perubahan skema.
```

## 4. Mengunggah ke GitHub

**Lewat web (tanpa alat tambahan)**

1. Buka repositori, **Add file > Upload files**.
2. Tarik-lepas berkas/folder yang berubah (atau seluruh isi proyek), termasuk folder `js`, `docs`, dan `tools`.
   Folder `.github` tersembunyi di sebagian sistem; bila tidak ikut terunggah, pemeriksaan otomatis di GitHub
   tidak aktif, tetapi aplikasi tetap berjalan normal.
3. Tulis ringkasan pendek (mis. `v1.5.0: kunci PIN`) lalu **Commit changes**.
4. **Penting:** unggahan lewat web **tidak menghapus** berkas lama. Bila Anda menghapus atau mengganti nama
   berkas, hapus yang lama secara manual (buka berkas > ikon tong sampah).

**Lewat git (bila terpasang)**

```
git add -A
git commit -m "v1.5.0: kunci PIN"
git push
```

Saran: satu rilis = satu commit dengan nomor versi di judulnya, supaya riwayat GitHub mudah dibaca dan
mudah dikembalikan.

**Beralih dari struktur lama (satu `app.js`)**: unggah seluruh isi proyek baru, lalu **hapus `app.js` di akar
repositori**. Berkas itu sudah digantikan oleh `js/01…11` dan tidak dipakai lagi.

## 5. Memastikan rilis sudah tayang

1. Tunggu satu sampai dua menit (GitHub Pages membangun ulang). Tab **Actions** menunjukkan proses dan
   hasil pemeriksaan `tools/cek.mjs`; tanda ✗ berarti ada yang perlu dibetulkan (klik untuk melihat alasannya).
2. Buka tautan aplikasi, lalu **Lainnya > Tentang dan keterbatasan**: nomor versi dan tanggal harus yang baru.
3. Di perangkat yang sudah memasang aplikasi, buka seperti biasa. Muncul pesan **Versi baru Finara siap. Muat ulang**;
   ketuk untuk memuat versi baru. (Pesan baru muncul setelah GitHub Pages selesai membangun.)

## 6. Pemecahan masalah

| Gejala | Kemungkinan penyebab | Tindakan |
|---|---|---|
| Aplikasi tidak berubah setelah unggah | GitHub Pages belum selesai, atau `VER` tidak dinaikkan | Tunggu 2 menit; pastikan `VER` di `versi.js` berbeda dari rilis sebelumnya |
| Layar kosong / putih setelah rilis | Berkas `js/` belum terunggah, urutan `<script>` salah, atau kesalahan sintaks | Buka konsol peramban (F12 > Console); jalankan `node tools/cek.mjs`; lihat tab **Actions** |
| "ReferenceError: … is not defined" | Fungsi dipakai di berkas yang dimuat **lebih dulu** daripada definisinya, pada kode level atas | Pindahkan kode itu ke berkas bernomor lebih besar, atau panggil di dalam fungsi/peristiwa |
| Tidak bisa offline | Daftar `INTI` di `sw.js` memuat berkas yang tidak ada, atau berkas baru belum didaftarkan | `node tools/cek.mjs` |
| Versi lama masih tampil di satu perangkat | Service worker lama masih aktif | Tutup semua tab aplikasi dan buka lagi; bila bandel: DevTools > Application > Service Workers > **Unregister**, lalu muat ulang |
| Data hilang setelah "Clear site data" | Itu memang menghapus `localStorage` tempat data disimpan | **Selalu buat cadangan dulu.** Untuk membersihkan cache saja, hapus **Cache Storage**, jangan Local Storage |

## 7. Membatalkan rilis yang bermasalah (rollback)

Cara teraman: **maju, bukan mundur.** Kembalikan kode ke keadaan sebelumnya, lalu rilis dengan nomor
**baru** (mis. 1.5.1, tulis "mengembalikan perubahan 1.5.0 karena …"). Nomor baru membuat semua pengguna
menerima pembaruan lagi. Di GitHub: buka commit yang bermasalah > **Revert**, lalu naikkan `versi.js`.

Jika rilis bermasalah itu **mengubah skema data**, jangan hanya mengembalikan kode: data yang sudah
dimigrasi mungkin tidak terbaca versi lama (aplikasi menolaknya dengan pesan). Perbaiki ke depan dengan
rilis yang bisa membaca skema baru.

## 8. Kebiasaan yang disarankan

- **Satu tujuan per rilis.** Perubahan kecil lebih mudah diuji dan dibatalkan.
- **Uji dengan data contoh dan cadangan nyata Anda** sebelum mengunggah: pulihkan cadangan dari versi sebelumnya
  dan pastikan semuanya benar (terutama saat menyentuh `migrate()`).
- **Jangan menaruh data pribadi, akun, atau alamat repositori** di `versi.js`, `CHANGELOG.md`, atau kode.
- **Catat keputusan** yang tidak jelas dari kodenya (mis. kenapa kunci penyimpanan masih bernama `bukukas`)
  di `CHANGELOG.md` bagian Catatan atau di `PETA-KODE.md`.
- **Pembaruan dokumentasi ikut rilis.** Bila menambah berkas, fungsi kunci, atau aturan baru, perbarui
  `PETA-KODE.md` pada commit yang sama.
- Ide dan utang teknis yang sudah diketahui ada di `RENCANA.md`.
