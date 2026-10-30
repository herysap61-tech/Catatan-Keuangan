/* ============================================================
   FINARA · versi.js
   SATU-SATUNYA tempat nomor versi dan catatan pembaruan dicatat.
   Dibaca oleh: aplikasi (layar Tentang & Riwayat versi), sw.js
   (nama cache), dan tools/cek.mjs (pemeriksaan otomatis).

   CARA MEMPERBARUI (tiap rilis, 3 langkah):
     1. Ubah VER dan TGL di bawah.
     2. Tambahkan entri baru PALING ATAS pada RIWAYAT (v harus sama
        dengan VER, t harus sama dengan TGL, u = daftar perubahan
        dalam bahasa yang dipahami pengguna).
     3. Tambahkan bagian baru di CHANGELOG.md (untuk pengembang).
   Aturan penomoran dan daftar periksa lengkap: docs/PANDUAN-PEMBARUAN.md

   Privasi: berkas ini tidak memuat data pribadi, akun, atau alamat
   repositori. Jangan menuliskannya di catatan versi.
   ============================================================ */
const VER='1.5.0',TGL='2026-10-30';
const RIWAYAT=[
{v:'1.5.0',t:'2026-10-30',u:['Beranda Pribadi kini menjawab satu pertanyaan: berapa uang yang aman dipakai hari ini sampai gajian (jatah harian)','Pengguna baru cukup menjawab tiga pertanyaan (uang sekarang, tanggal gajian, tagihan tetap), lalu jatah harian langsung tampil sebelum mencatat apa pun','Setelah mencatat, Finara menunjukkan dampaknya: sisa jatah hari ini, atau jatah besok bila melebihi jatah','Formulir Catat menampilkan pratinjau dampak ke saldo dan jatah sebelum disimpan','Mode sederhana: hanya Pemasukan, Pengeluaran, dan Transfer. Jenis lain (pinjaman, utang-piutang) ada di Lainnya, fitur lanjutan','Kartu Kesehatan keuangan kini disertai langkah yang disarankan','Tagihan tetap bulanan bisa ditambah langsung dari Beranda; kartu Rencana sampai gajian diganti Cara menghitung jatah Anda','Pengguna baru tidak lagi diminta memilih profil lebih dulu (otomatis Perorangan, bisa diganti di Lainnya)','Perbaikan: Beranda ikut diperbarui setelah transaksi berulang dijeda atau dihapus','Mode Usaha tidak berubah']},
{v:'1.4.6',t:'2026-10-30',u:['Menu Lainnya dikelompokkan (Catatan keuangan, Data dan cadangan, Tampilan dan profil, Bantuan), dan hapus data dipisahkan di bagian bawah','Tombol konfirmasi menyesuaikan aksi, mis. "Ya, hapus" atau "Ya, pulihkan"','Hapus semua data kini menawarkan unduh cadangan lebih dulu','Petunjuk penggunaan untuk cadangan dan pemulihan disesuaikan dengan tombol yang ada di layar']},
{v:'1.4.5',t:'2026-10-30',u:['Perbaikan: rincian rekening tidak lagi menampilkan daftar transaksi dua kali','Perbaikan: kolom tanggal gajian tidak lagi menampilkan keterangan nominal ("1 rupiah")','Perbaikan: membatalkan modal atau penarikan pemilik di Usaha kini ikut membatalkan pasangannya di Pribadi, dan mengubahnya ikut menyesuaikan pasangannya','Perbaikan: simulasi tabungan tidak lagi menampilkan "undefined NaN" untuk waktu yang sangat lama','Keamanan: file cadangan yang dimodifikasi tidak bisa lagi menjalankan kode, dan aplikasi diblokir menghubungi internet oleh peramban']},
{v:'1.4.4',t:'2026-10-29',u:['Perapian internal kode; tampilan dan fitur tidak berubah']},
{v:'1.4.3',t:'2026-10-29',u:['Struktur kode dirapikan agar mudah dirawat dan dikembangkan; tampilan dan fitur tidak berubah','Pemasangan versi baru lebih andal: semua berkas diunduh ulang agar tidak tercampur versi lama']},
{v:'1.4.2',t:'2026-10-29',u:['Font dari Google Fonts dihapus, memakai font bawaan perangkat','Aplikasi tidak lagi menghubungi server mana pun']},
{v:'1.4.1',t:'2026-10-29',u:['Penanda versi dan tanggal pembaruan di dalam aplikasi','Layar Riwayat versi di menu Tentang']},
{v:'1.4.0',t:'',u:['Penanda mode Pribadi atau Usaha','Hapus data per ruang kerja','Pasangan otomatis modal dan penarikan pemilik','Kekayaan gabungan','Rencana sampai gajian: uang bebas dipakai, tagihan, pengeluaran tak biasa','Simulasi tabungan','Arus kas 30 hari serta umur piutang dan utang untuk usaha']},
{v:'1.3',t:'',u:['Pilihan profil: Perorangan, Perorangan dengan usaha, Bisnis','Kartu Kesehatan keuangan','Siklus gajian']},
{v:'1.2',t:'',u:['Penyempurnaan tampilan (rincian tidak tercatat)']},
{v:'1.1',t:'',u:['Pembaruan tampilan dan kenyamanan pakai (rincian tidak tercatat)']}
];

// Menempelkan penanda versi ke <head> (hanya di halaman, bukan di service worker).
if(typeof document!=='undefined'){[['finara-version',VER],['finara-updated',TGL]].forEach(function(p){var m=document.createElement('meta');m.name=p[0];m.content=p[1];document.head.appendChild(m)})}
