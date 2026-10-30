# Peta Kode Finara

Dokumen ini menjawab: **"Kalau saya mau mengubah X, buka berkas mana?"** dan **"Aturan apa yang
tidak boleh dilanggar?"**. Baca bagian 1 dan 5 dulu; sisanya untuk dicari saat dibutuhkan.

> Gaya kode di `js/` sengaja padat (banyak pernyataan per baris). Jangan diformat ulang
> otomatis; cari fungsi berdasarkan **nama** (Ctrl+F), bukan nomor baris. Nomor baris tidak
> dicantumkan di sini karena cepat usang.

## 1. Cara kerja dalam lima kalimat

1. Tidak ada proses build. Peramban memuat `index.html`, yang memuat `config.js`, `versi.js`, lalu
   `js/01…11` **berurutan**. Semua berkas berbagi **satu lingkup global** (seperti satu berkas panjang).
2. Seluruh data ada di satu objek, `S`, yang disimpan ke `localStorage` oleh `save()`.
3. `render()` menggambar ulang layar aktif dari `S` (HTML dibuat lewat template string).
4. Tombol di HTML memakai `data-a="nama:parameter"`. Satu pendengar klik (`10-peristiwa.js`) memanggil
   `act.nama('parameter')`. Jadi **perilaku tombol = fungsi di objek `act`** (`09-aksi.js`).
5. Setelah mengubah `S`, pola umumnya: `save(); render();` (dan `toast('…')` untuk umpan balik).

## 2. Peta berkas

| Berkas | Isi | Fungsi/benda kunci | Sentuh bila… |
|---|---|---|---|
| `index.html` | Kerangka halaman, daftar `<script>` | — | menambah berkas js, mengubah kerangka/meta |
| `styles.css` | Seluruh tampilan, lapisan per rilis | variabel `:root`, `/* ===== vX ===== */` | mengubah tampilan |
| `config.js` | Pengaturan | `FEEDBACK_URL` | mengaktifkan menu masukan |
| `versi.js` | Versi & riwayat | `VER`, `TGL`, `RIWAYAT` | **setiap rilis** |
| `js/01-dasar.js` | Pemformat dasar | `$`, `rp()` (rupiah), `esc()` (aman HTML), `NB()` (teks→BigInt), `ymd()`, `today()`, `fd()`, `uid()`, `tglId()` | menambah pembantu umum |
| `js/02-data.js` | Model & penyimpanan | `T` (jenis transaksi), `TH` (teks bantuan jenis), `fresh()`, `migrate()`, `SCHEMA`, `save()`, `toast()` | mengubah struktur data, jenis transaksi |
| `js/03-hitung.js` | Perhitungan inti | `accs()`, `cats()`, `txs()`, `bal()` (saldo), `range()` (periode), `sum()` (ringkasan periode), `U()`, `PF()` | mengubah cara menghitung |
| `js/04-komponen.js` | Komponen tampilan kecil | `IC` (ikon), `cic()`, `list()`/`listRows()` (daftar transaksi), `bud()` | mengubah baris transaksi/ikon |
| `js/05-grafik.js` | Grafik SVG & tren | `area()`, `lineChart()`, `expTrend()`, `weekCard()`, `flowCard()`, `budPace()`, `trendBal()` | mengubah/menambah grafik |
| `js/06-layar.js` | Layar & kartu | `vHome`, `vTx`, `vRep`, `vAcc`, `vMore` (menu Lainnya), `applyProfile()`, `applyTheme()`, `health()`, `plancard()`, `bizcard()`, `strip()` | mengubah isi layar, menambah kartu/menu |
| `js/06b-jatah.js` | **Jatah harian (Pribadi)**, baru di 1.5.0 | `jatah()`, `vHomeP`, `vWelcome`, `heroJ`, `plancard`, `health`, `fbMsg()` (umpan balik setelah catat), `imp()` + `simTx()` (pratinjau dampak), `addBill()`, `LJ()`/`tyOK()` (mode sederhana vs lanjutan) | mengubah Beranda Pribadi, rumus jatah, saran kesehatan |
| `js/07-render-formulir.js` | Kerangka render & formulir | `render()`, `sheet()` (jendela bawah), `ask()` (konfirmasi), `txForm()` | mengubah navigasi, formulir transaksi |
| `js/08-data-lanjutan.js` | Data pendukung | `csv()`, `fullcsv()`, `pcsv()`, `dl()`, `runRec()` (berulang), `due()`, `nudge()`, `jr()`/`ledger()` (jurnal), `addP()` | mengubah ekspor/impor, berulang, jurnal |
| `js/09-aksi.js` | Semua perilaku tombol | objek `act` (`save`→`saveInti`, lihat bagian 6) | menambah/mengubah aksi tombol, formulir |
| `js/09b-aksi-jatah.js` | Aksi jatah harian | `onb*` (alur 3 pertanyaan), `billnew`/`billsave`, `lanjut` (ditambah ke `act` lewat `Object.assign`) | mengubah alur pertama atau tagihan tetap |
| `js/10-peristiwa.js` | Pendengar global & format | pendengar klik `data-a`, geser-untuk-batal, `tb()` (terbilang), `fmtNum()`, `fit()` | mengubah gestur, format ketikan nominal |
| `js/11-mulai.js` | Proses start | splash, pendengar tombol Enter/Spasi, `render()` pertama, pendaftaran service worker | mengubah urutan start (hati-hati) |
| `sw.js` | Cache offline | `INTI`, `VERSI` | menambah/menghapus berkas aplikasi |

## 3. Aliran data

```
tombol  data-a="aksi:param"
   │  (pendengar klik, 10-peristiwa.js)
   ▼
act.aksi(param)      ── mengubah S ──►  save()  ──► localStorage
   │                                    │
   └────────────────►  render()  ◄──────┘
                         │
                         ├─ applyProfile(), runRec()        (transaksi berulang jatuh tempo dibuat)
                         ├─ #seg (Pribadi/Usaha), #nav (tab)
                         └─ #m ← vHome | vTx | vRep | vAcc | vMore   (sesuai variabel tab)
```

Jendela di bawah layar (`sheet(html)`) dipakai untuk formulir dan dialog; `close()` menutupnya;
`ask(pesan, aksi, param, label)` membuat dialog konfirmasi yang memanggil `act.aksi(param)` bila disetujui. Beri `label`
yang sesuai untuk aksi yang menghapus/membatalkan ("Ya, hapus", "Ya, batalkan"); bila kosong tombolnya "Ya, lanjutkan".

## 4. Model data (`S`)

Dibuat oleh `fresh()` (`02-data.js`), dirapikan dan dimigrasi oleh `migrate()`.

| Bidang | Isi |
|---|---|
| `S.active` | ruang kerja aktif: `'p'` (Pribadi) atau `'u'` (Usaha) |
| `S.profile` | `'person'`, `'owner'` (default), `'biz'`, atau `null` (belum dipilih) |
| `S.payday` | tanggal gajian 1–28 (1 = bulan kalender) |
| `S.acc[]` | rekening: `{id, w, name, open, src?}` — `open` = saldo awal (BigInt) |
| `S.cat[]` | kategori: `{id, w, k:'in'\|'out', name}` |
| `S.tx[]` | transaksi: `{id, w, st:'ok'\|'void', at, d, ty, a, to, c, amt, n, demo?, pay?}` |
| `S.bud[]` | anggaran: `{w, c, lim}` (per kategori, per ruang) |
| `S.rec[]` | transaksi berulang: `{id, w, tpl:{ty,a,to,c,amt,n}, freq, dom, next, on}` |
| `S.pay[]` | utang-piutang: `{id, w, dir:'recv'\|…, who, amt, due, n, paid:[{amt, tx?}], st, at}` — `dir:'recv'` = piutang, selain itu utang |
| `S.goal[]` | target tabungan: `{id, w, n, t, s}` — target dan terkumpul |
| `S.log[]` | riwayat perubahan (maks. 500): `{t, id, act, b}` |
| `S.schema` | nomor skema data (saat ini **2**) |

Arti singkat: `w` = ruang kerja pemilik data, `d` = tanggal `TTTT-BB-HH`, `ty` = kunci di `T`,
`a` = rekening, `to` = rekening tujuan (transfer), `c` = id kategori, `amt` = nominal, `n` = catatan,
`at` = cap waktu pembuatan, `st:'void'` = dibatalkan.

## 5. Aturan yang tidak boleh dilanggar

1. **Uang = `BigInt`**, bukan `Number`. Nominal ditulis `150000n`, diparse dengan `NB(teks)`, diformat
   dengan `rp()`. Jangan `+`-kan BigInt dengan Number. Di JSON, BigInt disimpan sebagai teks oleh `J()`
   dan dikembalikan lewat `B()` di `migrate()`. Bila menambah bidang nominal baru, **tambahkan konversinya
   di `migrate()`** (kalau tidak, nominal kembali sebagai teks setelah dimuat ulang).
2. **Tanggal = teks `TTTT-BB-HH`.** Gunakan `ymd()`, `today()`, `dAdd(tgl, n)`, `fd()`. Jangan menyimpan objek `Date`.
3. **Setiap catatan membawa `w`** dan setiap daftar disaring lewat `accs()` / `cats()` / `txs()` agar
   Pribadi dan Usaha tidak bocor satu sama lain.
4. **Pembatalan bukan penghapusan.** Transaksi dibatalkan dengan `st:'void'` dan `logA(...)`. Saldo dan laporan
   hanya menghitung `st:'ok'`. Saldo selalu dihitung ulang (`bal()`), tidak pernah disimpan.
5. **Teks dari pengguna harus lewat `esc()`** sebelum masuk ke template HTML (pencegahan XSS).
6. **Tidak boleh ada permintaan ke internet.** Tanpa font/skrip/gambar eksternal, tanpa `fetch` ke luar.
   Itu janji privasi aplikasi; `tools/cek.mjs` memeriksanya dan Content-Security-Policy di `index.html`
   (`connect-src 'none'`, `script-src 'self'`) menegakkannya di peramban. Jangan menambah skrip inline atau atribut
   `onclick=` di HTML; pakai `data-a` dan `act`.
7. **Jangan mengganti nama kunci penyimpanan** (tabel di bawah). Itu yang membuat data pengguna lama tetap terbaca.
8. **Input angka yang bukan nominal uang** (tanggal gajian, dsb.) harus diberi atribut `data-plain`; tanpa itu
   `fmtInit()`/`fmtNum()` memformatnya sebagai rupiah dan menampilkan terbilang.
9. **Data impor tidak tepercaya.** File cadangan bisa dimodifikasi (checksum `hash()` bukan tanda tangan). `migrate()`
   membersihkan `id` dan tanggal; bila menambah bidang baru yang masuk ke templat HTML, lewatkan `esc()` atau validasi di `migrate()`.
10. **Urutan berkas `js/` itu penting** (kode di level atas dijalankan saat dimuat). Berkas baru diberi nomor
   yang tepat dan didaftarkan (lihat resep 7.5).

### Kunci penyimpanan peramban

| Kunci | Isi |
|---|---|
| `localStorage` `bukukas.v1` | **seluruh data pengguna** (`S`). Nama lama "bukukas" dipertahankan agar data lama tetap ada |
| `bukukas.v1.rusak`, `bukukas.v1.v<n>` | salinan pengaman saat data rusak / sebelum migrasi skema |
| `finara.theme` | tema: `auto` / `light` / `dark` |
| `finara.adv` | fitur lanjutan (akuntansi) tampil atau tidak |
| `finara.lanjut` | fitur lanjutan Pribadi (pinjaman, utang-piutang) tampil atau tidak |
| `finara.lastbk` | waktu cadangan terakhir (untuk pengingat) |
| `finara.last` | pilihan terakhir formulir (rekening/kategori) |
| `bukukas.hint`, `bukukas.fold` | status bantuan (tampil/lipat) |
| `sessionStorage` `fsp` | splash sudah tampil di sesi ini |

## 6. Pola "pembungkus + inti" di `act`

Hanya satu aksi yang punya perilaku tambahan di sekitar logika aslinya, dan keduanya tinggal bersebelahan di `09-aksi.js`:

| Aksi | Pembungkus (yang dipanggil tombol) | Inti (logika lama) |
|---|---|---|
| `save` | memanggil `saveInti()`, lalu bila yang tersimpan modal/penarikan pemilik di Usaha, menawarkan mencatat pasangannya di Pribadi | `saveInti` = validasi dan penyimpanan transaksi |

Aturan praktis: **ubah logika yang sudah ada di `…Inti`; tambahkan perilaku sesudahnya di pembungkus.**
Tombol dan pendengar tetap memanggil nama pembungkus (`act.save`), jangan memanggil `saveInti` dari luar.
Tidak ada lagi kode yang menimpa fungsi `act` dari berkas lain. (`accdet` dulu dibungkus; pembungkusnya dihapus di 1.4.5
karena menggandakan daftar transaksi.)

Transaksi pasangan modal/penarikan (`pair:<id transaksi Usaha>`) mengikuti induknya: `voidq` membatalkan/memulihkannya
bersama induk, dan `saveInti` menyamakan nominal serta tanggalnya saat induk diubah.

## 7. Resep perubahan umum

### 7.1 Menambah item di menu "Lainnya"
1. `06-layar.js` → fungsi `vMore()`: tambahkan pasangan `['kunciBaru','Label tombol']` di grup yang sesuai pada daftar `G`
   (Catatan keuangan, Akuntansi, Data dan cadangan, Tampilan dan profil, Bantuan, Hapus data; gunakan `...(U()?[]:[…])` bila khusus Pribadi, `...(U()?[…]:[])` bila khusus Usaha).
2. `09-aksi.js` → di objek `act`, tambahkan `kunciBaru(){ sheet('<h2>…</h2>…') }`.
3. Rilis (bagian 9 panduan): `versi.js`, `CHANGELOG.md`.

### 7.2 Menambah kartu di Beranda
Tulis fungsi `kartuBaru()` yang mengembalikan string HTML (contoh: `plancard`, `bizcard` di `06-layar.js`),
lalu panggil di `vHome()` pada bagian `<div class="d-a">…</div>`. Gunakan kelas yang sudah ada
(`c`, `health`, `hr`, `hint`) agar tampilannya serasi; tambah gaya baru di **akhir** `styles.css`.

### 7.3 Menambah jenis transaksi baru
Sentuh semua titik ini (cari kata `capital` sebagai contoh jenis yang sudah lengkap):
1. `02-data.js` → `T`: `{l:'Label', s:1|-1|0, cat:'in'|'out'?, only:'p'|'u'?}` (`s` = pengaruh ke total saldo).
2. `02-data.js` → `TH`: teks bantuan jenis itu.
3. `03-hitung.js` → `sum()`: tambahkan `case` agar masuk ke laporan.
4. `08-data-lanjutan.js` → `jr()`: pasangan debit-kredit untuk jurnal.
5. `09-aksi.js` → `accdet`: daftar urutan `O` dan label di rincian rekening.
6. Periksa `txForm()` (`07-render-formulir.js`) bila ada isian khusus, dan `fullcsv()`/`restcsv()` bila ikut dicadangkan.
7. Uji: catat, batalkan, laporan, rincian rekening, cadangan JSON dan CSV lalu pulihkan.

### 7.4 Mengubah struktur data (skema)
Bila bidang baru **boleh kosong** pada data lama, cukup beri nilai bawaan di `migrate()`.
Bila bentuk data **berubah** (nama/tipe/aturan):
1. Naikkan `SCHEMA` di `02-data.js` (mis. 2 → 3).
2. Tulis konversi di `migrate()` untuk data skema lama (`const v=s.schema||1`).
3. Perbarui `fresh()` (data baru) dan, bila perlu, `fullcsv()`/`restcsv()`/`bkdl()`/`rest()` (cadangan).
4. Uji: **muat data dari versi sebelumnya** (pulihkan cadangan lama) dan pastikan semuanya benar.
5. Catat di `CHANGELOG.md` sebagai perubahan skema (rilis minor atau mayor).
Data dari skema yang lebih baru daripada aplikasi ditolak dengan pesan agar memperbarui aplikasi
(cabang `'new'` di `migrate()`); jangan dihapus.

### 7.5 Menambah berkas JS baru
1. Beri nama dengan nomor yang menunjukkan urutan muat. Untuk menyisipkan di antara dua berkas,
   pakai huruf, mis. `js/08b-laporan-pajak.js` (dimuat setelah `08-…` dan sebelum `09-…`). Urutan harus
   sesuai urutan abjad nama berkas.
2. Daftarkan di `index.html` (tag `<script>` pada urutan yang sama) **dan** di daftar `INTI` pada `sw.js`.
3. Tambahkan baris di tabel bagian 2 dokumen ini.
4. `node tools/cek.mjs` akan memberi tahu bila ada yang terlewat.

### 7.6 Mengubah warna / tampilan
Warna ada di variabel CSS pada `:root` (mode terang) dan blok tema gelap di `styles.css`. Ubah variabel
di kedua tempat (terang dan gelap) agar konsisten. Gaya baru: tambahkan di akhir berkas dengan penanda versi.

### 7.7 Mengubah teks bantuan/petunjuk
Petunjuk penggunaan: `act.help` di `09-aksi.js`. Keterbatasan: `act.info`. Teks bantuan per jenis
transaksi: `TH` di `02-data.js`. Catatan pembaruan untuk pengguna: `versi.js`.

## 8. Daftar uji manual cepat (sebelum rilis)

Buka aplikasi lewat `http://localhost` (lihat README), lalu:

- [ ] Pertama kali dibuka (data kosong): pemilih profil muncul, tidak ada galat di konsol peramban.
- [ ] Lainnya > **Isi dengan data contoh**: semua tab (Beranda, Transaksi, Laporan, Rekening, Lainnya) tampil.
- [ ] Catat pengeluaran, pemasukan, dan transfer; saldo rekening berubah benar.
- [ ] Batalkan satu transaksi (geser ke kiri atau tombol Batalkan), lalu urungkan.
- [ ] Pindah Pribadi ⇄ Usaha: data tidak bercampur.
- [ ] Cadangan JSON: unduh, hapus semua data, pulihkan: hasil sama.
- [ ] Mode gelap dan terang.
- [ ] Matikan jaringan (DevTools > Network > Offline), muat ulang: aplikasi tetap terbuka.
- [ ] Setelah rilis: buka tautan lama di perangkat yang sudah memasang, pesan **Versi baru siap** muncul.

## 9. Utang teknis yang diketahui

- Tidak ada tes otomatis untuk logika (hanya `tools/cek.mjs` untuk konsistensi rilis). Daftar uji manual di atas yang jadi pegangan.
- Kode padat dan berbagi lingkup global; nama pendek (`S`, `T`, `R`, `Q`, `FM`) dipakai lintas berkas.
- `styles.css` berlapis per rilis (v1.1–v1.4); ada kemungkinan aturan yang saling menimpa.
- Catatan rilis 1.0–1.4.0 tidak memiliki tanggal.

## 10. Rumus jatah harian (1.5.0)

`jatah()` di `06b-jatah.js`: sisa setelah tagihan (variabel `fr`, dulu berlabel "uang bebas") = total saldo − tagihan berulang (`S.rec` jenis expense/loan) dan utang yang jatuh tempo
sebelum gajian berikutnya. Jatah hari ini = (sisa setelah tagihan + pengeluaran harian hari ini) ÷ jumlah hari sampai gajian (hari ini ikut).
Sisa jatah = jatah − pengeluaran harian hari ini. Pengeluaran harian tidak memuat transaksi hasil aturan berulang (`rec`) dan
pembayaran utang (`pay`). Pratinjau dampak di formulir memakai `simTx()`: menambah satu transaksi rekaan ke `S.tx`, menghitung, lalu membuangnya.

Versi satu berkas: `node tools/bundel.mjs` (menggabungkan CSS dan JS, membuat CSP berbasis hash).
