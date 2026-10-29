# Catatan Perubahan Finara

Catatan untuk **pengembang** (apa yang berubah di kode dan kenapa). Catatan untuk **pengguna**
ada di `versi.js` (tampil di aplikasi: Lainnya > Tentang > Riwayat versi).
Format: bagian terbaru di atas. Penomoran: lihat `docs/PANDUAN-PEMBARUAN.md`.

## [1.4.4] - 2026-10-29

Rilis perapian. **Tidak ada perubahan fitur, tampilan, maupun format data.**

### Diubah
- Tiga "patch" di akhir `js/11-mulai.js` digabung ke fungsi aslinya di `js/09-aksi.js`:
  - `act.save`: kini pembungkus (menawarkan pencatatan pasangan modal/penarikan pemilik) di atas `act.saveInti` (logika penyimpanan lama).
  - `act.accdet`: kini pembungkus (menambah 10 transaksi terakhir) di atas `act.accdetInti` (rincian rekening lama).
  - `act.adv`: definisi ganda dihapus; yang tersisa adalah versi yang selama ini berlaku (memakai `ADVP`).
- `11-mulai.js` kini hanya berisi proses start; tidak ada lagi kode yang menimpa fungsi di berkas lain.
- Cara menguji: perilaku dibandingkan langkah demi langkah dengan 1.4.2 di Chromium (rincian rekening, fitur lanjutan,
  jurnal, alur pasangan modal/penarikan, simpan gagal validasi, simpan biasa). Hasil identik selain nomor versi.

## [1.4.3] - 2026-10-29

Rilis perapian struktur. **Tidak ada perubahan fitur, tampilan, maupun format data.**

### Diubah
- Kode yang tadinya satu berkas (`app.js`, 447 baris) dipecah menjadi 11 berkas berurutan di `js/`
  (`01-dasar.js` … `11-mulai.js`). Isinya identik; hanya dipindah. Peta lengkap: `docs/PETA-KODE.md`.
- Nomor versi, tanggal, dan riwayat dipusatkan di `versi.js`. Sebelumnya tersebar di tiga tempat
  (komentar, meta, konstanta). `sw.js` kini membaca nomor versi dari `versi.js`, jadi tidak perlu
  diubah lagi tiap rilis.
- `FEEDBACK_URL` dipindah ke `config.js`.
- `sw.js`: saat memasang versi baru, semua berkas diambil langsung dari server (`cache: 'reload'`)
  agar tidak tercampur berkas lama dari cache peramban.
- `sw.js`: pengecualian untuk Google Fonts dihapus karena font eksternal sudah tidak dipakai sejak 1.4.2.

### Ditambah
- `tools/cek.mjs`: pemeriksa otomatis (versi cocok, berkas terdaftar di `index.html` dan `sw.js`,
  sintaks, manifest, tidak ada alamat internet).
- `.github/workflows/cek.yml`: menjalankan pemeriksa itu di GitHub setiap ada unggahan.
- `docs/PETA-KODE.md`, `docs/PANDUAN-PEMBARUAN.md`, dan `CHANGELOG.md` ini.

### Catatan
- Tagline "Tegas mencatat. Jujur melaporkan." tidak ada di tampilan sejak 1.4.x (gaya `.tag` di
  `styles.css` masih ada). Pulihkan dengan menambah `<span class="tag">…</span>` di `index.html` bila diinginkan.

## [1.4.2] - 2026-10-29

### Diubah
- Google Fonts dihapus; aplikasi memakai font bawaan perangkat dan tidak menghubungi server mana pun.

## [1.4.1] - 2026-10-29

### Ditambah
- Penanda versi dan tanggal pembaruan di dalam aplikasi.
- Layar **Riwayat versi** di menu Tentang.

## [1.4.0] - tanggal tidak tercatat

### Ditambah
- Penanda mode Pribadi atau Usaha (pil di pojok kanan atas, khusus profil "Perorangan dengan usaha").
- Hapus data per ruang kerja (transaksi, anggaran, utang-piutang, berulang, target; rekening dan kategori tetap).
- Pasangan otomatis modal dan penarikan pemilik: setelah mencatat di Usaha, muncul tawaran mencatat di Pribadi.
- Kekayaan gabungan (Pribadi + Usaha, piutang dan utang ikut dihitung) di kartu Kesehatan keuangan.
- Kartu "Rencana sampai gajian" (Pribadi): uang bebas dipakai, tagihan, pengeluaran di atas kebiasaan.
- Simulasi tabungan (menu Lainnya).
- Kartu bisnis (Usaha): arus kas 30 hari, umur piutang dan utang.
- Siklus gajian lebih terlihat di Beranda ("periode", rentang tanggal, hitungan hari).

### Diubah
- Jenis transaksi Refund/retur, Koreksi saldo (+) dan (−) hanya tersedia di ruang Usaha.

## [1.3] - tanggal tidak tercatat
- Pilihan profil: Perorangan, Perorangan dengan usaha, Bisnis.
- Kartu Kesehatan keuangan.
- Siklus gajian.

## [1.2] - tanggal tidak tercatat
- Penyempurnaan tampilan (rincian tidak tercatat).

## [1.1] - tanggal tidak tercatat
- Pembaruan tampilan dan kenyamanan pakai (rincian tidak tercatat).
