# Audit Alur Transaksi Mode Pribadi — Finara 1.7.2

Tanggal: 2026-10-30  
Ruang lingkup: pencatatan transaksi, saldo rekening, laporan periode, pembatalan, perubahan transaksi, transfer, utang-piutang, jurnal, pemulihan cadangan, dan rekonsiliasi saldo.

## Keputusan dan perbaikan

1. **Validasi cadangan JSON.** Setiap transaksi diperiksa terhadap jenis transaksi, tanggal, nominal, rekening asal, rekening tujuan, kategori, dan batas ruang kerja. Referensi yang tidak cocok membuat transaksi berstatus batal dengan alasan; transaksi tidak dihapus diam-diam dan tidak memengaruhi saldo/laporan.
2. **Normalisasi ID.** ID tidak valid atau ganda dibuat unik. Referensi terkait dipetakan ulang berdasarkan jenis data bila memungkinkan.
3. **Rekonsiliasi saldo.** Pengguna dapat membandingkan saldo Finara dengan saldo nyata per rekening. Selisih dicatat sebagai `adjp` atau `adjm` pada tanggal hari ini. Koreksi tidak memengaruhi pendapatan/pengeluaran dan tidak mengubah saldo awal historis.
4. **Saldo awal.** Formulir menjelaskan bahwa mengubah saldo awal mengubah laporan historis; untuk saldo saat ini gunakan rekonsiliasi.

## Dasar perhitungan yang diaudit

- Saldo rekening = saldo awal + transaksi sah sampai tanggal hari ini; transfer mengurangi rekening asal dan menambah rekening tujuan dengan nilai sama.
- Laporan periode menghitung saldo awal periode dan arus bersih transaksi sah dalam rentang tanggal. Refund mengurangi beban, bukan menambah pendapatan.
- Transaksi batal tidak dihitung pada saldo, laporan, atau jurnal. Perubahan transaksi memperbarui catatan yang sama, bukan membuat transaksi duplikat.
- Jurnal dibentuk dari transaksi sah; setiap transaksi memiliki debit dan kredit dengan nominal yang sama.
- Pembayaran utang/piutang yang tertaut hanya diakui bila transaksi bukti aktif, berada di ruang kerja yang sama, memiliki tautan ke catatan utang/piutang yang tepat, dan jenis transaksi sesuai (expense untuk utang, income untuk piutang). Bukti pembayaran yang sama juga tidak dihitung dua kali. Jika transaksi dibatalkan atau relasinya salah, jumlah itu kembali menjadi sisa kewajiban/piutang.
- Transaksi masa depan tidak mengubah saldo/jurnal saat ini. Untuk jatah harian, biaya terjadwal sebelum gajian ditahan secara terpisah.
- Rekonsiliasi memakai akun koreksi, bukan akun pendapatan atau beban.

## Hasil pengujian otomatis

| Suite | Pemeriksaan | Hasil |
|---|---:|---|
| Integritas proyek | 101 | Lolos |
| Regresi indikator keuangan | 4 | Lolos |
| Jatah harian | 20 | Lolos |
| Kesehatan keuangan Pribadi | 5 | Lolos |
| Migrasi dan relasi data | 10 | Lolos |
| Pratinjau transaksi | 7 | Lolos |
| Alur transaksi Pribadi | 15 | Lolos |
| Rekonsiliasi saldo Pribadi | 5 | Lolos |

Total 167 pemeriksaan otomatis (101 pemeriksaan integritas + 66 pemeriksaan skenario).

## Batas audit

- Pengujian otomatis memanggil fungsi perhitungan aktual dengan data terkontrol. Ini bukan pengganti rekonsiliasi terhadap rekening bank nyata.
- Impor CSV hanya mencakup rekening, kategori, anggaran, dan transaksi; utang-piutang, aturan berulang, target, serta konfigurasi lengkap ada pada JSON.
- Cadangan JSON tidak dienkripsi. File harus disimpan secara pribadi. Hash di dalam file membantu mendeteksi kerusakan tidak disengaja, bukan pengganti tanda tangan kriptografis terhadap pihak yang sengaja mengubah file.
- Data transaksi historis yang rusak dipertahankan sebagai batal dan perlu ditinjau manual; Finara tidak dapat menebak nilai atau rekening yang benar.
- Pengujian browser manual lintas perangkat belum menggantikan uji penerimaan oleh pemilik produk.

## Mode Usaha

Mode Usaha ditahan. Tidak ada perubahan pada rumus laporan usaha, grafik, atau alur fitur usaha. Penambahan rekonsiliasi menggunakan jenis koreksi saldo yang sudah tersedia pada mesin jurnal, dengan akses baru untuk kebutuhan Mode Pribadi.
