# Rencana dan Utang Teknis

Daftar **calon** pekerjaan, bukan janji. Urutan = usulan prioritas. Coret (`[x]`) dan pindahkan ke
`CHANGELOG.md` saat selesai dirilis.

## Fitur yang sudah diketahui belum ada
(dari catatan "Belum tersedia" di README dan layar Tentang)

- [ ] Kunci PIN/biometrik untuk membuka aplikasi
- [ ] Enkripsi berkas cadangan (JSON)
- [ ] Notifikasi pengingat (tagihan jatuh tempo, cadangan berkala)

## Perawatan kode

- [ ] Tes otomatis untuk perhitungan inti (`bal`, `sum`, `range`, `migrate`) agar perubahan lebih aman.
- [ ] Pecah `09-aksi.js` (berkas terbesar, ±35 KB) per topik (transaksi, rekening, kategori, utang-piutang, cadangan).
- [ ] Rapikan `styles.css` (gabungkan lapisan v1.1–v1.4 yang saling menimpa).
- [ ] Lengkapi tanggal rilis untuk riwayat 1.0–1.4.0 bila diketahui.

## Keputusan yang sengaja ditunda

- Kunci penyimpanan `bukukas.v1` **tidak diganti** ke nama "finara" karena akan membuat data pengguna lama tidak
  terbaca. Mengganti butuh migrasi yang menyalin data ke kunci baru dan menyimpan kunci lama sebagai cadangan.
- Tagline "Tegas mencatat. Jujur melaporkan." dihapus dari tampilan sejak 1.4.x; gaya `.tag` masih ada di CSS.
