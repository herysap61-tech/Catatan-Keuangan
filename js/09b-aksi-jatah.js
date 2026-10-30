/* ============================================================
   FINARA · js/09b-aksi-jatah.js   (baru di 1.5.0)
   AKSI JATAH HARIAN: alur tiga pertanyaan (onb*), tagihan tetap (bill*),
   penanda fitur lanjutan (lanjut). Menambah aksi ke objek `act` dari
   09-aksi.js lewat Object.assign; tidak menimpa aksi yang sudah ada.
   Logika hitungan ada di 06b-jatah.js.
   ============================================================ */
// Jawaban sementara selama alur tiga pertanyaan (disimpan sebagai teks angka).
let ONB={s:1,cash:'',bank:'',pd:'',bills:[]};
const onbHead=n=>`<div class="stp" role="img" aria-label="Langkah ${n} dari 3">${[1,2,3].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}<small>Langkah ${n} dari 3</small></div>`;
const brow=(n,a,d)=>{const id=uid();return`<div class="brow" id="b${id}"><input class="bnm" maxlength="40" placeholder="Nama tagihan, mis. Kos" aria-label="Nama tagihan" value="${esc(n)}"><div><input class="ba" inputmode="numeric" placeholder="0" aria-label="Nominal tagihan" value="${esc(a)}"></div><input class="bdy" inputmode="numeric" data-plain maxlength="2" placeholder="Tgl" aria-label="Tanggal jatuh tempo, 1 sampai 28" value="${esc(d)}"><button class="sx" data-a="onbrowdel:${id}" aria-label="Hapus tagihan">×</button></div>`};
const readBills=()=>[...document.querySelectorAll('#bls .brow')].map(r=>({n:r.querySelector('.bnm').value.trim(),a:r.querySelector('.ba').value.replace(/\D/g,''),d:r.querySelector('.bdy').value.trim()}));
Object.assign(act,{
onb(){ONB={s:1,cash:'',bank:'',pd:'',bills:[]};act.onbs(1)},
onbs(n){n=+n;ONB.s=n;
if(n===1)sheet(onbHead(1)+`<h2>Uang Anda sekarang berapa?</h2><small class="hint">Jumlahkan uang yang bisa Anda pakai hari ini. Perkiraan juga boleh, nanti bisa diubah di tab Rekening.</small><label>Uang tunai (Rp)<input id="ob1" inputmode="numeric" placeholder="0" value="${ONB.cash}"></label><label>Saldo bank dan e-wallet (Rp)<input id="ob2" inputmode="numeric" placeholder="0" value="${ONB.bank}"></label><p id="err" class="neg"></p><div class="row"><button class="btn" data-a="onbnext">Lanjut</button><button class="btn ghost" data-a="close">Nanti saja</button></div>`);
else if(n===2)sheet(onbHead(2)+`<h2>Gajian tanggal berapa?</h2><small class="hint">Dipakai untuk menghitung berapa hari uang Anda harus cukup. Tidak punya gaji tetap? Pilih tanggal 1 (awal bulan). Gajian tanggal 29–31? Isi 28.</small><div class="row chips" role="group" aria-label="Pilihan cepat tanggal gajian">${[1,5,10,15,20,25,28].map(v=>`<button type="button" class="chip" data-a="onbpd:${v}">${v}</button>`).join('')}</div><label>Tanggal gajian (1–28)<input id="ob3" inputmode="numeric" data-plain maxlength="2" placeholder="25" value="${esc(ONB.pd)}"></label><p id="err" class="neg"></p><div class="row"><button class="btn" data-a="onbnext">Lanjut</button><button class="btn ghost" data-a="onbback">Kembali</button></div>`);
else sheet(onbHead(3)+`<h2>Tagihan tetap tiap bulan?</h2><small class="hint">Contoh: kos atau sewa, cicilan, listrik, internet. Finara menyisihkannya lebih dulu supaya tidak terpakai untuk jajan. Isi tanggal jatuh tempo berikutnya; tagihan yang sudah Anda bayar bulan ini tidak ikut dihitung. Boleh dikosongkan.</small><div class="row chips" role="group" aria-label="Contoh tagihan">${['Kos atau sewa','Cicilan','Listrik','Internet dan pulsa'].map(v=>`<button type="button" class="chip" data-a="onbbill:${v}">+ ${v}</button>`).join('')}</div><div id="bls">${(ONB.bills.length?ONB.bills:[{n:'',a:'',d:''}]).map(b=>brow(b.n,b.a,b.d)).join('')}</div><div class="row"><button class="btn ghost" data-a="onbrow">Tambah baris</button></div><p id="err" class="neg"></p><div class="row"><button class="btn" data-a="onbnext">Hitung jatah</button><button class="btn ghost" data-a="onbback">Kembali</button></div>`)},
onbpd(v){const e=$('#ob3');if(e)e.value=v},
onbrow(){const b=$('#bls');if(!b||b.children.length>=8)return;b.insertAdjacentHTML('beforeend',brow('','',''));fmtInit();b.lastElementChild.querySelector('.bnm').focus()},
onbrowdel(id){const e=document.getElementById('b'+id);if(e)e.remove()},
onbbill(n){const b=$('#bls');if(!b)return;let r=[...b.children].find(r=>!r.querySelector('.bnm').value.trim());if(!r){if(b.children.length>=8)return;act.onbrow();r=b.lastElementChild}r.querySelector('.bnm').value=n;r.querySelector('.ba').focus()},
onbback(){if(ONB.s===2)ONB.pd=($('#ob3').value||'').trim();if(ONB.s===3)ONB.bills=readBills();act.onbs(Math.max(1,ONB.s-1))},
onbnext(){const err=t=>{$('#err').textContent=t};
if(ONB.s===1){const c=NB($('#ob1').value.replace(/\D/g,'')),b=NB($('#ob2').value.replace(/\D/g,''));
if(c<0n||b<0n){err('Nominal terlalu besar.');return}if(c+b<=0n){err('Isi uang Anda sekarang. Perkiraan juga boleh.');return}
ONB.cash=c?String(c):'';ONB.bank=b?String(b):'';act.onbs(2)}
else if(ONB.s===2){const v=parseInt($('#ob3').value,10);if(!(v>=1&&v<=28)){err('Isi angka 1 sampai 28.');return}ONB.pd=String(v);act.onbs(3)}
else{const o=[];for(const r of readBills()){if(!r.n&&!r.a&&!r.d)continue;const a=NB(r.a),d=parseInt(r.d,10),n=r.n||'Tagihan';
if(a<0n){err('Nominal terlalu besar untuk "'+n+'".');return}if(a===0n){err('Isi nominal untuk "'+n+'".');return}if(!(d>=1&&d<=28)){err('Isi tanggal jatuh tempo 1 sampai 28 untuk "'+n+'".');return}o.push({n,a:String(a),d:String(d)})}
ONB.bills=o;act.onbdone()}},
// Terapkan jawaban: saldo awal, tanggal gajian, tagihan tetap. Hanya dipanggil saat belum ada uang tercatat.
onbdone(){S.active='p';const P=S.acc.filter(a=>a.w==='p');if(!P.length){const a={id:uid(),w:'p',name:'Tunai',open:0n};S.acc.push(a);P.push(a)}
const c=BigInt(ONB.cash||'0'),b=BigInt(ONB.bank||'0');if(P[1]){P[0].open=c;P[1].open=b}else P[0].open=c+b;
S.payday=+ONB.pd;const pa=P[1]&&b>c?P[1]:P[0];let n=0;for(const v of ONB.bills)if(addBill(v.n,BigInt(v.a),+v.d,pa.id))n++;
if(!S.profile)S.profile='person';logA('','jatah harian','saldo '+rp(c+b)+', gajian tanggal '+S.payday+', '+n+' tagihan');save();render();act.onbres()},
onbres(){const J=jatah(),ok=J.fr>0n;sheet(`<div class="stp"><i class="on"></i><i class="on"></i><i class="on"></i><small>Selesai</small></div><h2>${ok?'Jatah harian Anda':'Uang belum cukup sampai gajian'}</h2><div class="c res"><small>${ok?'Boleh dipakai per hari':'Kekurangan'}</small><b class="big ${ok?'pos':'neg'}">${ok?rp(J.per):rp(-J.fr)}</b><small>${ok?'selama '+J.days+' hari, sampai gajian '+tglId(J.np):'dibanding tagihan sampai gajian '+tglId(J.np)}</small></div>
<div class="c"><table><tr><td>Uang Anda sekarang</td><td>${rp(J.tot)}</td></tr><tr><td>Tagihan tetap sebelum gajian<small>${J.B.length} tagihan</small></td><td>−${rp(J.bt)}</td></tr><tr><td>Uang bebas</td><td>${rp(J.fr)}</td></tr><tr><td>Dibagi jumlah hari</td><td>${J.days} hari</td></tr></table></div>${ok?'':'<small class="hint">Coba tunda pengeluaran yang tidak wajib, atau periksa lagi saldo dan tagihannya. Saldo ada di tab Rekening, tagihan di Lainnya › Tagihan tetap dan transaksi berulang.</small>'}<h3>Cara memakainya</h3><p>Setiap kali Anda belanja, ketuk Catat. Beranda langsung menunjukkan sisa jatah hari ini, dan sebelum menyimpan Anda sudah melihat dampaknya.</p><div class="row"><button class="btn" data-a="onbgo">Catat pengeluaran</button><button class="btn ghost" data-a="close">Lihat Beranda</button></div>`)},
onbgo(){act.add('expense')},
billnew(){sheet(`<h2>Tambah tagihan tetap</h2><small class="hint">Tagihan yang muncul tiap bulan, misalnya kos, cicilan, listrik, atau internet. Finara menyisihkannya dari uang bebas sebelum menghitung jatah harian, dan mencatatnya otomatis pada tanggalnya.</small><label>Nama tagihan<input id="bln" maxlength="40" placeholder="Contoh: Kos"></label><label>Nominal (Rp)<input id="bla" inputmode="numeric" placeholder="0"></label><label>Tanggal jatuh tempo tiap bulan (1–28)<input id="bld" inputmode="numeric" data-plain maxlength="2" placeholder="5"></label><label>Dibayar dari rekening<select id="blk">${accs().map(a=>opt(a.id,a.name,LAST.a)).join('')}</select></label><p id="err" class="neg"></p><div class="row"><button class="btn" data-a="billsave">Simpan tagihan</button><button class="btn ghost" data-a="close">Batal</button></div>`)},
billsave(){const n=$('#bln').value.trim(),a=NB($('#bla').value.replace(/\D/g,'')),d=parseInt($('#bld').value,10),k=$('#blk').value;
const m=!n?'Isi nama tagihan.':a<0n?'Nominal terlalu besar.':!a?'Isi nominal tagihan.':!(d>=1&&d<=28)?'Isi tanggal 1 sampai 28.':!k?'Pilih rekening.':'';if(m){$('#err').textContent=m;return}
const f0=jatah().fr;addBill(n,a,d,k);save();render();const f1=jatah().fr;act.rec();
toast(f1!==f0?'Tagihan disimpan. Uang bebas sampai gajian: '+rp(f0)+' → '+rp(f1):'Tagihan disimpan. Dihitung ke jatah saat jatuh temponya masuk periode gajian ini.',4800)},
lanjut(){LANJUT=!LANJUT;try{localStorage.setItem('finara.lanjut',LANJUT?'1':'0')}catch(e){}render();toast(LANJUT?'Fitur lanjutan ditampilkan':'Fitur lanjutan disembunyikan')}
});
