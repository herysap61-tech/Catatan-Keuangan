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
const VER='1.7.2',TGL='2026-10-30';
const RIWAYAT=[
{v:'1.7.2',t:'2026-10-30',u:['Validasi pemulihan cadangan memastikan transaksi hanya memakai rekening dan kategori yang benar serta berada di ruang kerja yang sama','Transaksi dari cadangan yang relasinya rusak tetap disimpan sebagai batal agar riwayat tidak hilang, tetapi tidak mengubah saldo atau laporan','ID data ganda atau tidak valid dinormalisasi dan referensi lama dipetakan agar data sah tetap terhubung','Rekonsiliasi saldo rekening Pribadi kini membuat transaksi koreksi terpisah tanpa mengubah pendapatan, pengeluaran, atau saldo awal','Penjelasan saldo awal diperjelas agar pengguna tidak mengubah saldo historis ketika hanya ingin mencocokkan saldo rekening sekarang','Pengujian alur transaksi diperluas ke saldo, laporan, transfer, jurnal, pembatalan, perubahan transaksi, pembayaran utang, dan koreksi saldo']},
{v:'1.7.1',t:'2026-10-30',u:['Biaya satu kali yang dijadwalkan sebelum gajian kini ikut ditahan dalam perhitungan jatah, meski saldo baru berubah pada tanggal transaksi','Pratinjau transaksi masa depan menjelaskan apakah biaya ikut mengurangi uang tersedia sebelum gajian','Saldo awal pada panduan pertama kini meminta seluruh rekening dihitung, termasuk tabungan dan cadangan','Daya tahan kas memperhitungkan pembayaran pokok pinjaman dan mengurangi sisa pinjaman tercatat; rasio memakai perhitungan presisi BigInt','Jika pinjaman masih tercatat tanpa jadwal cicilan, kartu jatah memberi peringatan agar tidak dianggap uang bebas','Pembayaran utang yang baru dijadwalkan setelah gajian tidak lagi dianggap sudah lunas sebelum tanggal pembayarannya','Pengujian Mode Pribadi diperluas dengan saldo aktual, biaya terjadwal, utang, transfer, dan nominal besar']},
{v:'1.7.0',t:'2026-10-30',u:['Jatah harian kini menghitung total saldo dikurangi tagihan, tabungan yang diamankan, dan cadangan tak terduga sebelum dibagi sampai gajian','Pengaturan tabungan mencatat target per periode gajian dan nominal yang sudah disisihkan agar tidak dihitung dua kali','Cadangan tak terduga memiliki dua metode: persentase (awal 10%) atau nominal tetap; hanya metode yang dipilih yang dihitung','Pengaturan baru dimigrasikan dengan aman dan disertakan dalam cadangan lengkap; data lama tetap dipertahankan']},
{v:'1.6.2',t:'2026-10-30',u:['Perbaikan akurasi: kekayaan bersih kini memperhitungkan sisa pinjaman dari transaksi Pinjaman diterima dikurangi pembayaran pokok','Perbaikan: perhitungan kekayaan gabungan menghitung saldo Pribadi dan Usaha di ruang kerja masing-masing','Perbaikan indikator: sisa arus kas kini memperhitungkan pembayaran pokok pinjaman; pembayaran cicilan diberi label sesuai data yang benar-benar tercatat','Pencegahan salah tafsir: jatah harian dan daya tahan kas kini dijelaskan sebagai estimasi, bukan jaminan uang aman dibelanjakan atau dana darurat terverifikasi']},
{v:'1.6.1',t:'2026-10-30',u:['Perbaikan: saat Finara dipasang di HP, jam, baterai, dan sinyal tidak lagi tertutup karena aplikasi tidak lagi dibuka dalam mode layar penuh']},
{v:'1.6.0',t:'2026-10-30',u:['Beranda ditata ulang agar lebih rapi: jatah hari ini, pemasukan dan pengeluaran, lalu Rekening saya, diikuti kartu penjelasan, anggaran, tren, dan kesehatan keuangan. Rincian transaksi terbaru kini di paling bawah, dengan tombol Lihat semua','Pada layar lebar, kartu-kartu di Beranda tersusun dua kolom','Tombol Pasang Finara di perangkat ini kembali: muncul sebagai kartu di Beranda dan di Lainnya, lengkap dengan petunjuk untuk iPhone dan peramban yang tidak punya tombol pasang otomatis. Hilang sendiri setelah Finara terpasang, atau bila Anda pilih Nanti saja']},
{v:'1.5.1',t:'2026-10-30',u:['Istilah uang bebas diganti sisa setelah tagihan, agar jelas bahwa angka ini baru dikurangi tagihan dan utang, belum tabungan atau dana darurat','Kartu cara hitung kini menjelaskan bahwa uang di rekening tabungan tetap terhitung, dan cara menahannya lewat tagihan tetap']},
{v:'1.5.0',t:'2026-10-30',u:['Beranda kini menjawab satu pertanyaan: berapa uang yang aman dipakai hari ini sampai gajian (jatah harian)','Pengguna baru cukup menjawab tiga pertanyaan, lalu jatah harian langsung tampil sebelum mencatat apa pun','Setiap kali mencatat, Finara menunjukkan dampaknya ke saldo dan jatah, sebelum dan sesudah disimpan','Tampilan lebih sederhana: pinjaman dan utang-piutang dipindah ke fitur lanjutan di Lainnya (bila Anda sudah punya datanya, tetap tampil). Mode Usaha tidak berubah','Kartu Kesehatan keuangan kini disertai langkah yang disarankan. Perbaikan kecil: Beranda ikut diperbarui setelah transaksi berulang dijeda atau dihapus']},
{v:'1.4.6',t:'2026-10-30',u:['Menu Lainnya dikelompokkan (Catatan keuangan, Data dan cadangan, Tampilan dan profil, Bantuan), dan hapus data dipisahkan di bagian bawah','Tombol konfirmasi menyesuaikan aksi, mis. "Ya, hapus" atau "Ya, pulihkan"','Hapus semua data kini menawarkan unduh cadangan lebih dulu','Petunjuk penggunaan untuk cadangan dan pemulihan disesuaikan dengan tombol yang ada di layar']},
{v:'1.4.5',t:'2026-10-30',u:['Perbaikan: rincian rekening tidak lagi menampilkan daftar transaksi dua kali','Perbaikan: kolom tanggal gajian tidak lagi menampilkan keterangan nominal ("1 rupiah")','Perbaikan: membatalkan modal atau penarikan pemilik di Usaha kini ikut membatalkan pasangannya di Pribadi, dan mengubahnya ikut menyesuaikan pasangannya','Perbaikan: simulasi tabungan tidak lagi menampilkan "undefined NaN" untuk waktu yang sangat lama','Keamanan: file cadangan yang diubah pihak lain tidak bisa lagi menjalankan kode, dan aplikasi dibatasi agar tidak terhubung ke internet']},
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
