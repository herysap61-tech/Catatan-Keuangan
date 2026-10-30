# Perubahan jatah harian — Finara 1.7.0

Tanggal: 2026-10-30

## Rumus

1. Total saldo = seluruh saldo rekening aktif pada ruang kerja Pribadi.
2. Sisa setelah tagihan = total saldo dikurangi tagihan berulang dan utang yang jatuh tempo sebelum gajian berikutnya.
3. Tabungan yang diamankan = nilai terbesar antara target tabungan periode gajian dan jumlah yang sudah disisihkan pada periode tersebut.
4. Dasar cadangan = sisa setelah tagihan dikurangi tabungan yang diamankan.
5. Cadangan = salah satu dari:
   - Persentase: dasar cadangan × persentase / 100 (nilai awal 10%).
   - Nominal: nominal tetap yang diisi pengguna.
6. Uang tersedia = dasar cadangan dikurangi cadangan.
7. Rata-rata harian = uang tersedia dibagi jumlah hari sampai gajian. Pengeluaran hari ini ditambahkan kembali untuk menghitung alokasi hari ini, lalu dikurangi agar sisa hari ini tampil.

## Pencegahan penghitungan ganda tabungan

Total saldo yang digunakan Finara mencakup semua rekening. Karena itu rekening tabungan/cadangan juga harus tetap dimasukkan ke Finara. Target tabungan dikurangi satu kali dari total saldo, terlepas apakah uangnya sudah dipindahkan ke rekening tabungan atau masih diamankan di rekening biasa.

Kolom "Sudah disisihkan pada periode ini" adalah informasi jumlah yang sudah diamankan, bukan pengurang kedua. Kolom ini membantu memisahkan target yang sudah diamankan dan sisa target yang masih perlu diamankan. Nilai yang lebih besar antara target dan jumlah aktual yang sudah diamankan menjadi total uang yang dilindungi. Dengan demikian, jika target Rp200.000 dan sudah diamankan Rp200.000, pengurang tetap Rp200.000, bukan Rp400.000. Jika sudah diamankan Rp250.000, yang dilindungi Rp250.000.

Periode mengikuti tanggal gajian yang tersimpan. Saat periode berganti, jumlah "sudah disisihkan" periode sebelumnya tidak otomatis dipakai untuk periode baru. Jika tanggal gajian diubah, nilai sudah disisihkan direset agar tidak terbawa ke periode yang berbeda.

## Cadangan tak terduga

Kedua metode saling eksklusif. Metode persentase adalah pilihan awal 10% dan dihitung dari sisa setelah tagihan dan tabungan. Metode nominal memakai jumlah rupiah yang diisi pengguna. Nilai persentase dibatasi 0–100%. Metode yang tidak dipilih tidak ikut dihitung.

## Migrasi dan penyimpanan

Skema data naik dari 2 ke 3. Migrasi menambahkan konfigurasi jatah dengan nilai bawaan, mempertahankan transaksi/rekening/tagihan lama, dan menyimpan salinan JSON data lama sebelum migrasi melalui mekanisme versi yang sudah ada. Konfigurasi ikut dalam cadangan lengkap JSON. CSV tetap merupakan ekspor parsial dan tidak dimaksudkan sebagai cadangan lengkap.

## Batasan yang harus dipahami

- Hasil bergantung pada kelengkapan saldo, tagihan, dan jumlah tabungan yang dimasukkan pengguna.
- Finara tidak dapat mengetahui secara otomatis apakah uang telah dipindahkan ke rekening lain atau disimpan di luar aplikasi. Karena itu seluruh rekening harus dicatat, dan nilai "sudah disisihkan" perlu diisi secara jujur.
- Tagihan berulang yang tidak dimasukkan tidak dapat dikurangkan.
- Pinjaman yang masih tersimpan dalam saldo tetap perlu ditangani sesuai pencatatan kewajiban; pengaturan jatah ini bukan pengganti rekonsiliasi utang.
- Cadangan nominal yang lebih besar daripada uang setelah tabungan dapat membuat uang tersedia negatif. Ini disengaja agar kekurangan terlihat, bukan diam-diam dipotong.

## Pengujian

`node tools/uji-jatah.mjs` menguji sembilan skenario: contoh Rp2 juta, setoran tabungan sudah dilakukan, setoran melebihi target, pemilihan nominal tetap, dan pergantian periode. Hasil yang diharapkan diverifikasi dengan aritmetika independen.
