# Catatan Perubahan Finara

Catatan untuk **pengembang** (apa yang berubah di kode dan kenapa). Catatan untuk **pengguna**
ada di `versi.js` (tampil di aplikasi: Lainnya > Tentang > Riwayat versi).
Format: bagian terbaru di atas. Penomoran: lihat `docs/PANDUAN-PEMBARUAN.md`.

## [1.6.0] - 2026-10-30

Rilis tampilan Beranda dan tombol pasang aplikasi. **Tidak ada perubahan perhitungan, skema, atau format data** (`SCHEMA` tetap 2).

### Diubah
- Urutan Beranda Pribadi (`vHomeP`, `js/06b-jatah.js`), atas ke bawah: jatah hari ini, pemasukan/pengeluaran, **Rekening saya** (`strip()`),
  kelompok perhatian (data contoh, utang jatuh tempo, pengingat cadangan, kartu pasang), cara menghitung jatah, anggaran + laju,
  tren saldo, kesehatan keuangan, lalu **Transaksi terbaru di paling bawah** (kini dengan tautan "Lihat semua" ke tab Transaksi).
  Sebelumnya: transaksi terbaru berada tepat di bawah pemasukan/pengeluaran dan rekening di paling bawah.
- Beranda Usaha (`vHomeU`, `js/06-layar.js`): isi dan urutan tidak berubah; hanya ditambah tautan "Lihat semua" dan kelas tata letak baru.
- Tata letak layar lebar (>= 1024 px): Rekening dan Transaksi terbaru selebar penuh, kelompok kartu tengah dibagi dua kolom (`div.dcol`: kiri perhatian + cara hitung, kanan anggaran + tren + kesehatan; Usaha: kiri kartu bisnis, kanan tren + anggaran). Di HP tetap satu kolom dengan urutan yang sama.
  Kelas baru `d-w` (`styles.css`, bagian akhir). `strip()` ikut memakai `d-w`.

### Ditambah
- Tombol **Pasang Finara di perangkat ini** dikembalikan. Sebelumnya hanya muncul di Lainnya dan hanya bila peramban mengirim
  `beforeinstallprompt`, sehingga di iPhone, di Chrome yang sudah menolak pernah, atau bila peristiwa itu terlambat, tombol "hilang".
  Sekarang: kartu `installCard()` di Beranda (`06b-jatah.js`) dan tombol selalu ada di Lainnya selama aplikasi belum dibuka sebagai
  aplikasi (`STANDALONE()`). `act.install` (`09-aksi.js`) memakai prompt bawaan bila ada; bila tidak, menampilkan petunjuk
  iPhone/Android/komputer, atau penjelasan bila dibuka lewat `file://`.
- `act.instno` ("Nanti saja") menyimpan kunci `finara.pasang` = 1 agar kartu tidak muncul lagi. Kunci yang sama dipasang saat
  peristiwa `appinstalled`.

### Catatan
- `beforeinstallprompt` kini juga memicu `render()` bila sedang di Beranda, supaya tombol langsung memakai prompt bawaan.
- Tidak ada berkas baru, jadi `index.html` dan `sw.js` tidak perlu diubah.

## [1.5.1] - 2026-10-30

Perbaikan istilah dan penjelasan; **tidak ada perubahan perhitungan, skema, atau format data**.

### Diubah
- Label "uang bebas" diganti "sisa setelah tagihan" di `06b-jatah.js`, `09b-aksi-jatah.js`, dan `06-layar.js`. Alasannya: angka ini
  hanya mengurangi tagihan berulang dan utang jatuh tempo; tabungan, dana darurat, dan anggaran belum dikurangkan,
  sehingga kata "bebas" menyesatkan. Nama variabel internal `fr` tidak diubah.
- Kartu "Cara menghitung jatah Anda" kini menyebut bahwa rekening tabungan tetap masuk total saldo, dan cara menahannya
  (tagihan tetap). Catatan: tagihan tetap tercatat sebagai pengeluaran.

### Catatan
- Belum ada penahan khusus (dana ditahan, pengecualian rekening, target tabungan yang ikut menahan). Lihat `docs/RENCANA.md`.

## [1.5.0] - 2026-10-30

Rilis fokus **mode Pribadi**: satu janji utama (jatah harian sampai gajian), alur pertama yang pendek, dan umpan balik
setelah mencatat. **Tidak ada perubahan skema atau format data** (`SCHEMA` tetap 2). Mode Usaha tidak diubah.

### Ditambah
- `js/06b-jatah.js` (berkas baru): `jatah()` (uang bebas, jatah hari ini, sisa jatah, jatah besok), `heroJ()`/`vHomeP()`
  (Beranda Pribadi), `vWelcome()` (layar pertama berisi janji, contoh hitungan, tiga pertanyaan), `fbMsg()` (teks umpan balik
  setelah mencatat), `imp()` + `simTx()` (pratinjau dampak di formulir: transaksi rekaan ditambahkan sementara ke `S.tx`, dihitung, lalu dibuang),
  `addBill()` (tagihan tetap = aturan berulang bulanan), `LJ()`/`tyOK()`/`hasAdv()` (mode sederhana vs fitur lanjutan).
- `js/09b-aksi-jatah.js` (berkas baru): aksi `onb*` (alur tiga pertanyaan: uang sekarang, tanggal gajian, tagihan tetap, lalu hasil),
  `billnew`/`billsave`, `lanjut`. Ditambahkan ke `act` lewat `Object.assign`, tidak menimpa aksi lama.
- Kunci penyimpanan baru `finara.lanjut` (1 = fitur lanjutan Pribadi tampil).

### Diubah
- Beranda Pribadi: kartu utama kini jatah harian (bukan total saldo). Urutan: jatah, pemasukan/pengeluaran, transaksi terbaru,
  kartu cara hitung, kesehatan keuangan, tren, anggaran, rekening. Pengguna tanpa uang tercatat melihat layar sambutan.
  Beranda Usaha dipindah ke `vHomeU()` tanpa perubahan isi; `vHome()` hanya memilih.
- `plancard()` dan `health()` dipindah ke `06b-jatah.js`. `plancard` kini "Cara menghitung jatah Anda" (rincian, tombol tambah tagihan).
  `health` menambah baris "Langkah:" per indikator (dana darurat, tingkat tabungan, beban cicilan, kekayaan bersih).
- Formulir transaksi (Pribadi, mode sederhana): kolom Jenis disembunyikan untuk transaksi baru (cukup tiga tombol cepat); daftar jenis
  dibatasi ke Pemasukan/Pengeluaran/Transfer (jenis lain muncul bila fitur lanjutan aktif atau transaksi itu sudah memakainya).
  Filter jenis di tab Transaksi ikut dibatasi.
- `saveInti`: toast setelah simpan memakai `fbMsg()` (Pribadi) dan tampil lebih lama (5 dtk). `toast(t, ms)` menerima durasi.
- Menu Lainnya (Pribadi): grup baru "Jatah harian" (tanggal gajian, tagihan tetap); Utang-piutang dan Simulasi tabungan masuk fitur lanjutan.
- `act.payday`, `act.rec`, `act.help`, teks `TH` Pribadi (pemasukan, pengeluaran, transfer) menjelaskan dampak ke jatah harian.
- Pengguna baru otomatis berprofil `person` (`11-mulai.js`) dan pemilih profil tidak lagi muncul sendiri. `wipe2` juga mengatur profil `person`.

### Diperbaiki
- `act.rtog` dan `act.rdel`: Beranda di belakang jendela tidak ikut diperbarui; kini `render()` dipanggil.

### Catatan
- Definisi jatah: uang bebas = total saldo − tagihan berulang − utang jatuh tempo sebelum gajian berikutnya. Jatah hari ini =
  (uang bebas + pengeluaran harian hari ini) ÷ jumlah hari sampai gajian (hari ini ikut). Pengeluaran harian tidak memuat transaksi
  hasil aturan berulang (`rec`) dan pembayaran utang (`pay`) karena keduanya sudah dihitung lewat tagihan.
- Tagihan yang tanggalnya sudah lewat atau hari ini saat dibuat dianggap sudah dibayar bulan itu (jatuh tempo berikutnya bulan depan).
- Gajian tanggal 1 berarti bulan kalender (perilaku lama); pendapatan tidak tetap disarankan memakai tanggal 1.
- Belum diuji dengan pengguna nyata. Lihat `docs/RENCANA.md` untuk pengujian 3–5 orang.

## [1.4.6] - 2026-10-30

Rilis perapian tampilan dan bantuan. **Tidak ada perubahan skema atau format data.**

### Diubah
- `vMore()` (`js/06-layar.js`): daftar datar ±17 tombol diganti daftar `G` berisi grup (Catatan keuangan, Akuntansi [Usaha],
  Data dan cadangan, Tampilan dan profil, Bantuan, Hapus data). Isi dan urutan tombol dalam tiap grup mengikuti kondisi lama
  (Pribadi/Usaha, `ADV`, `DEFERRED`, `FEEDBACK_URL`). Gaya baru di akhir `styles.css` (`h3.mh`, `.list-btn.danger`).
- `ask(pesan, aksi, param, label)` (`js/07-render-formulir.js`): parameter keempat opsional mengganti label tombol
  "Ya, lanjutkan". Aksi yang menghapus atau membatalkan kini memakai "Ya, hapus", "Ya, batalkan", "Ya, pulihkan", "Ya, tambahkan".
- `act.wipe` (`js/09-aksi.js`): tidak lagi lewat `ask()`; sheet sendiri dengan tombol **Unduh cadangan dulu** (`bkdl`) di atas
  "Ya, hapus semua".

### Diperbaiki
- `act.help`: bagian "Cadangan rutin" dan "Memulihkan data" menyebut tombol Salin dan Periksa dan pulihkan yang sudah tidak
  ada. Teks kini sesuai layar Cadangan (Unduh cadangan lengkap, Pilih file cadangan, konfirmasi Ya, pulihkan).

### Catatan
- `act.copy` dan `box()` (`js/08-data-lanjutan.js`) tidak lagi dipakai dari layar mana pun; dibiarkan untuk saat ini.

## [1.4.5] - 2026-10-30

Rilis perbaikan. **Tidak ada perubahan skema atau format data** (`SCHEMA` tetap 2).

### Diperbaiki
- `act.accdet` (`js/09-aksi.js`): daftar transaksi tampil dua kali di rincian rekening. Sejak 1.4.4 pembungkus `accdet`
  menambahkan "10 transaksi terakhir" padahal `accdetInti` sudah memuat daftar yang sama. Pembungkus dihapus dan
  `accdetInti` dikembalikan menjadi `accdet`. Pola pembungkus kini hanya tersisa di `save` (lihat `docs/PETA-KODE.md` bagian 6).
- Siklus gajian: input `#pd` memakai `inputmode="numeric"` sehingga ikut diformat sebagai rupiah dan menampilkan terbilang
  ("Satu rupiah"). Input itu kini bertanda `data-plain`, dan `fmtInit()` serta pendengar `input` (`js/10-peristiwa.js`)
  melewati input bertanda itu. **Aturan:** input angka yang bukan nominal uang wajib diberi `data-plain`.
- `act.simgo`: target dengan tabungan per bulan sangat kecil menghasilkan tanggal tidak valid ("undefined NaN").
  Kini di atas 1200 bulan tampil "Lebih dari 100 tahun lagi"; tanggal dihitung dari tanggal 1 agar tidak melompat bulan.
- `act.voidq`: membatalkan modal/penarikan pemilik di Usaha tidak membatalkan pasangannya di Pribadi (`pair`), sehingga
  saldo dua ruang tidak cocok. Pasangan berstatus `ok` kini ikut dibatalkan, dan ikut dipulihkan saat diurungkan.
  Mengubah modal/penarikan (`saveInti`) juga menyamakan nominal dan tanggal pasangannya.

### Keamanan
- `index.html`: ditambah Content-Security-Policy (`connect-src 'none'`, `script-src 'self'`, tanpa skrip inline).
  Janji "tidak ada permintaan ke internet" kini ditegakkan oleh peramban, bukan hanya oleh `tools/cek.mjs`.
- `migrate()` (`js/02-data.js`): file cadangan bisa dimodifikasi dan checksum `hash()` bukan tanda tangan, sehingga
  `id` atau tanggal berisi HTML lolos dan masuk ke templat. Sekarang `id` yang tidak berbentuk `[A-Za-z0-9_-]{1,40}`
  diganti `uid()` baru (rujukan ikut dipetakan), tanggal transaksi/berulang harus `TTTT-BB-HH`, dan `opt()` memakai `esc()`.

### Catatan
- Belum diperbaiki (lihat `docs/RENCANA.md`): teks Petunjuk penggunaan masih menyebut tombol Salin / Periksa dan pulihkan,
  menu Lainnya belum dikelompokkan, dan label konfirmasi masih seragam "Ya, lanjutkan".

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
