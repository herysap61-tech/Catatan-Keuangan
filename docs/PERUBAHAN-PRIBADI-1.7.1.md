# Penguatan Mode Pribadi — Finara 1.7.1

Tanggal: 2026-10-30

## Ruang lingkup

Rilis ini fokus pada Mode Pribadi. Kode, tampilan, dan rumus Mode Usaha tidak diubah. Skema data tetap 3; tidak diperlukan migrasi struktural. Normalisasi konfigurasi jatah saat data dimuat tetap dilakukan untuk menolak nominal tabungan/cadangan negatif dari file cadangan yang tidak valid.

## Perubahan perhitungan jatah

- Saldo rekening dihitung dari saldo awal ditambah transaksi sah sampai hari ini.
- Tagihan berulang dan utang jatuh tempo sebelum gajian tetap ditahan. Pembayaran utang yang ditautkan ke transaksi masa depan hanya mengurangi kewajiban pada tanggal pembayaran tersebut; pembayaran setelah gajian tidak dianggap sudah dibayar.
- Pengeluaran satu kali yang dijadwalkan sebelum gajian kini juga ditahan dalam jatah meskipun belum mengubah saldo rekening.
- Transaksi masa depan setelah gajian tidak mengurangi jatah siklus sekarang. Pemasukan masa depan tidak dimasukkan sebelum benar-benar diterima.
- Pada tanggal transaksi tiba, biaya tidak lagi ditahan sebagai transaksi masa depan; saldo rekening kemudian sudah mencerminkan pengeluaran tersebut.
- Sisa pinjaman transaksi yang belum dijadwalkan tidak otomatis dikurangkan dari jatah karena tanggal kewajiban tidak diketahui. Kartu cara hitung kini memberi peringatan agar pengguna menambahkan jadwal cicilan atau kewajiban sebelum gajian.

Rumus dasar: `uang tersedia = saldo saat ini − kewajiban terjadwal sebelum gajian − tabungan diamankan − cadangan`. Pengeluaran hari ini ditambahkan kembali hanya untuk menghitung alokasi harian awal, lalu dikurangkan untuk memperoleh sisa hari ini.

## Tabungan dan perubahan tanggal gajian

Nominal yang sudah disisihkan dipertahankan ketika tanggal gajian diubah karena uang yang diamankan mungkin masih ada. Pengguna dapat mengubahnya menjadi nol atau nilai lain bila tidak lagi berlaku pada siklus baru. Total saldo tetap harus mencakup seluruh rekening, termasuk tabungan dan cadangan.

## Kesehatan keuangan

- Daya tahan kas kini memakai rata-rata pengeluaran **ditambah pembayaran pokok pinjaman** dari tiga bulan yang tersedia.
- Sisa pinjaman tercatat dikurangkan dari saldo rekening untuk menghitung kas non-pinjaman.
- Utang-piutang yang dicatat terpisah belum otomatis dikurangkan dari metrik daya tahan kas karena dapat mencatat pinjaman yang sama; net worth tetap memberi peringatan kemungkinan hitung ganda.
- Rasio dihitung dengan BigInt dan dibulatkan satu angka desimal agar nominal besar tidak kehilangan presisi karena konversi Number.

## Asumsi tagihan berulang

Aturan tagihan tetap mencatat pengeluaran otomatis saat jatuh tempo; ini mengasumsikan tagihan dibayar pada tanggal tersebut. Bila belum dibayar, aturan perlu dijeda dan kewajiban dicatat terpisah. Saat membuat aturan dengan tanggal bulan ini yang sudah lewat atau sama dengan hari ini, aplikasi mulai menghitung pada bulan berikutnya.

## Pengujian

- `uji-jatah.mjs`: 20 skenario, termasuk saldo aktual setelah pengeluaran, transaksi masa depan, transfer, utang, tagihan berulang, persentase/nominal cadangan, periode tabungan, defisit, dan nominal BigInt besar.
- `uji-kesehatan-pribadi.mjs`: 5 pemeriksaan, termasuk pinjaman diterima, pembayaran pokok dan bunga, rasio arus kas, serta tampilan nominal besar tanpa notasi ilmiah.
- `uji-keuangan.mjs`: 4 regresi indikator lama.
- `uji-migrasi-pribadi.mjs`: 6 pemeriksaan migrasi skema dan konfigurasi jatah.
- `uji-pratinjau-pribadi.mjs`: 7 pemeriksaan pratinjau dan umpan balik transaksi masa depan.
- `cek.mjs`: integritas versi, urutan skrip, cache offline, sintaks, manifest, dan pemeriksaan privasi.

Tes otomatis tidak menggantikan pengujian antarmuka nyata, pemulihan cadangan, atau validasi terhadap catatan bank dan tagihan pengguna.
