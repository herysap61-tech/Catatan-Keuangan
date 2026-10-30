# Laporan perbaikan akurasi keuangan — Finara 1.6.2

Tanggal: 2026-10-30  
Baseline: Finara 1.6.1  
Status: implementasi awal selesai; audit menyeluruh masih diperlukan.

## Perubahan

1. **Kekayaan bersih:** saldo pinjaman transaksi dihitung sebagai kewajiban, yaitu total `loan_in` dikurangi `loan_prin` yang sah dan bertanggal sampai hari ini. Nilai kewajiban pinjaman tidak dibuat negatif.
2. **Kekayaan gabungan:** saldo rekening, piutang, utang, dan pinjaman dihitung terpisah untuk ruang kerja `p` dan `u`. Ini menghindari penggunaan saldo ruang aktif untuk rekening ruang kerja lain.
3. **Sisa arus kas:** dihitung dari pemasukan dikurangi pengeluaran dan pembayaran pokok pinjaman pada periode laporan.
4. **Pembayaran cicilan:** label dan penjelasan menyatakan bahwa rasio hanya menggunakan pembayaran pokok dan bunga yang sudah dicatat pada periode tersebut; bukan seluruh kewajiban cicilan terjadwal.
5. **Daya tahan kas:** label dan penjelasan menyatakan bahwa angka membandingkan seluruh saldo rekening dengan rata-rata pengeluaran dari tiga bulan yang tersedia. Angka ini belum memisahkan dana pinjaman, dana terikat, dan rekening tidak likuid.
6. **Jatah harian:** penjelasan menyebut hasil sebagai estimasi alokasi rata-rata dan mengingatkan bahwa saldo tabungan, dana darurat, alokasi lain, serta pinjaman yang masih tersimpan dapat ikut dihitung.

## Pengujian

- `node tools/cek.mjs`: 101 pemeriksaan lolos.
- `node tools/uji-keuangan.mjs`: 4 skenario regresi lolos.
- `node tools/bundel.mjs finara-v1_6_2.html`: build HTML mandiri berhasil.

Skenario regresi:

- Pinjaman Rp1.000 masuk ke kas: saldo kas Rp1.100 dengan saldo awal Rp100; kewajiban Rp1.000; kekayaan bersih Rp100.
- Pembayaran pokok Rp200: kas Rp900; kewajiban tersisa Rp800; kekayaan bersih tetap Rp100.
- Kekayaan gabungan memasukkan saldo Pribadi Rp100 dan Usaha Rp200 menjadi Rp300.
- Pemasukan Rp1.000, pengeluaran Rp200, pembayaran pokok Rp700 menghasilkan sisa arus kas 10%.

## Batasan yang belum terselesaikan

- **Potensi pencatatan pinjaman ganda:** model data belum menghubungkan transaksi `loan_in`/`loan_prin` dengan catatan utang-piutang tertentu. Jika satu kewajiban dicatat melalui kedua jalur, kekayaan bersih dapat mengurangkannya dua kali. Pengguna perlu merekonsiliasi catatan sampai relasi data diperbaiki.
- **Cicilan masa depan:** model utang-piutang tidak selalu memiliki jadwal angsuran berkala dan nilai angsuran yang dapat dihitung. Rasio pembayaran yang tampil hanya berdasarkan transaksi aktual.
- **Rekening terikat/tidak likuid:** belum ada atribut rekening untuk mengecualikan tabungan, dana darurat, atau dana yang tidak boleh digunakan dari estimasi jatah harian.
- **Klasifikasi kebutuhan darurat:** rata-rata pengeluaran historis belum memilah kebutuhan pokok dari pengeluaran opsional. Karena itu, indikator diberi nama daya tahan kas (estimasi), bukan dana darurat terverifikasi.
- **Cakupan uji:** empat uji regresi baru mencakup indikator yang diperbaiki. Belum mewakili seluruh transaksi, impor, pembatalan, transaksi berulang, dan pemulihan cadangan.

## Keputusan teknis berikutnya

Sebelum menyebut seluruh angka Finara akurat, perlu tahap lanjutan untuk merancang relasi utang-piutang dengan transaksi pinjaman, atribut rekening yang dikecualikan dari jatah harian, dan rangkaian stress test seluruh jenis transaksi. Tidak ada perubahan skema data pengguna pada rilis ini.

## Tindak lanjut pada 1.7.0

Perhitungan jatah harian yang sebelumnya hanya mengurangi tagihan kini dilanjutkan pada 1.7.0. Rincian rumus, pengamanan agar tabungan tidak dihitung dua kali, migrasi skema, batasan, dan pengujian terdapat di `docs/PERUBAHAN-JATAH-1.7.0.md`.
