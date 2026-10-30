/* ============================================================
   FINARA · js/02-data.js
   DATA: jenis transaksi, bentuk data awal, muat/simpan, migrasi skema, toast
   Dimuat berurutan (angka di nama berkas = urutan). Semua berkas
   berbagi satu lingkup global; lihat docs/PETA-KODE.md.
   ============================================================ */
// Jenis transaksi: s = pengaruh ke total saldo; cat = jenis kategori; only = khusus workspace
const T={income:{l:'Pendapatan',s:1,cat:'in'},expense:{l:'Pengeluaran',s:-1,cat:'out'},transfer:{l:'Transfer',s:0},
capital:{l:'Modal pemilik',s:1,only:'u'},draw:{l:'Penarikan pemilik',s:-1,only:'u'},loan_in:{l:'Pinjaman diterima',s:1},
loan_prin:{l:'Bayar pokok pinjaman',s:-1},loan_int:{l:'Bayar bunga pinjaman',s:-1,cat:'out'},refund:{l:'Refund/retur',s:1,cat:'out',only:'u'},
adjp:{l:'Koreksi saldo (+)',s:1},adjm:{l:'Koreksi saldo (−)',s:-1}};
const TH={income:'Uang masuk dari penghasilan atau penjualan. Saldo rekening bertambah, dan jumlahnya masuk ke pendapatan serta laba. Jurnal: debit rekening, kredit pendapatan.',expense:'Uang keluar untuk biaya. Saldo rekening berkurang, dan jumlahnya masuk ke pengeluaran sehingga mengurangi laba. Jurnal: debit beban, kredit rekening.',transfer:'Memindahkan uang antar rekening Anda sendiri. Total uang tidak berubah, jadi tidak dihitung sebagai pendapatan atau pengeluaran.',capital:'Uang pribadi yang Anda masukkan ke usaha. Saldo usaha bertambah, tetapi ini bukan penjualan sehingga tidak menambah laba. Dicatat sebagai modal pemilik.',draw:'Uang usaha yang Anda ambil untuk diri sendiri. Saldo usaha berkurang, tetapi ini bukan biaya sehingga tidak mengurangi laba.',loan_in:'Uang pinjaman yang masuk. Saldo bertambah dan kewajiban (utang) naik, tetapi ini bukan pendapatan.',loan_prin:'Cicilan pokok pinjaman. Saldo berkurang dan kewajiban turun, tetapi ini bukan beban. Bunganya dicatat terpisah.',loan_int:'Bunga pinjaman adalah biaya. Saldo berkurang dan laba ikut berkurang.',refund:'Uang kembali dari pembelian atau biaya yang dibatalkan. Saldo bertambah dan mengurangi pengeluaran pada kategori itu, bukan dihitung sebagai pendapatan.',adjp:'Menyesuaikan saldo agar sama dengan kenyataan, misalnya setelah menghitung uang tunai. Hanya mengubah saldo, tidak masuk pendapatan atau beban.',adjm:'Menyesuaikan saldo agar sama dengan kenyataan, misalnya ada selisih hitung. Hanya mengubah saldo, tidak masuk pendapatan atau beban.'};
function fresh(){const a=(w,n)=>({id:uid(),w,name:n,open:0n}),c=(w,k,n)=>({id:uid(),w,k,name:n});
return{active:'p',profile:null,payday:1,acc:[a('p','Tunai'),a('p','Bank'),a('u','Kas usaha'),a('u','Bank usaha')],
cat:[c('p','in','Gaji'),c('p','in','Pendapatan lain'),c('p','out','Makan'),c('p','out','Transportasi'),c('p','out','Tagihan'),c('p','out','Belanja'),c('p','out','Lainnya'),
c('u','in','Penjualan'),c('u','in','Pendapatan lain'),c('u','out','Pembelian barang'),c('u','out','Biaya operasional'),c('u','out','Gaji karyawan'),c('u','out','Lainnya')],
tx:[],bud:[],log:[],schema:3,rec:[],pay:[],goal:[],jatahCfg:{tabungan:0n,disisihkan:0n,periode:'',cadanganMode:'persen',cadanganPersen:10,cadanganNominal:0n}}}
let S,tab='home',R={p:'month',o:0,f:today(),t:today()},Q={q:'',ty:''},FM={},PEND=null;
const SCHEMA=3;
function migrate(s){
if(!s||typeof s!=='object'||!Array.isArray(s.acc))return null;
const v=s.schema||1;if(v>SCHEMA)return'new';
const DT=/^\d{4}-\d{2}-\d{2}$/;
for(const k of['tx','cat','bud','log','rec','pay','goal'])if(!Array.isArray(s[k]))s[k]=[];
// Normalisasi ruang kerja dan ID. ID ganda di dalam satu jenis data
// diperbaiki agar satu transaksi tidak diterapkan ke dua rekening.
const OKID=/^[A-Za-z0-9_-]{1,40}$/;
const idMaps={acc:new Map(),cat:new Map(),tx:new Map(),pay:new Map(),rec:new Map(),goal:new Map()};
for(const k of['acc','cat','tx','pay','rec','goal']){
 const seen=new Set();
 s[k]=s[k].filter(e=>e&&typeof e==='object');
 for(const e of s[k]){
  if(e.w!=='p'&&e.w!=='u')e.w='p';
  const old=String(e.id??'');let id=old;
  if(!OKID.test(id)||seen.has(id)){let n;do{n=uid()}while(seen.has(n));e.id=n;id=n}
  if(!idMaps[k].has(old))idMaps[k].set(old,id);
  seen.add(id);
 }
}
// Konversi nominal prima dilakukan sebelum validasi relasi.
for(const a of s.acc){a.open=B(a.open);if(Array.isArray(a.src))a.src=a.src.filter(x=>x&&typeof x==='object').map(x=>({...x,amt:B(x.amt)}))}
for(const x of s.tx)x.amt=B(x.amt);
for(const b of s.bud)b.lim=B(b.lim);
for(const r of s.rec)if(r.tpl)r.tpl.amt=B(r.tpl.amt);
for(const p of s.pay){p.amt=B(p.amt);if(!Array.isArray(p.paid))p.paid=[];p.paid=p.paid.filter(x=>x&&typeof x==='object').map(x=>({...x,amt:B(x.amt)}))}
for(const g of s.goal){g.t=B(g.t);g.s=B(g.s)}
if(!['person','owner','biz'].includes(s.profile))s.profile=null;
if(s.active!=='p'&&s.active!=='u')s.active='p';
// Perbaiki referensi setelah ID tidak valid/ganda dinormalisasi.
const remap=(m,v)=>typeof v==='string'&&m.has(v)?m.get(v):v;
for(const x of s.tx){x.a=remap(idMaps.acc,x.a);x.to=remap(idMaps.acc,x.to);x.c=remap(idMaps.cat,x.c);if(x.pair!==undefined)x.pair=remap(idMaps.tx,x.pair);if(x.pay!==undefined)x.pay=remap(idMaps.pay,x.pay);if(x.rec!==undefined)x.rec=remap(idMaps.rec,x.rec)}
for(const r of s.rec)if(r.tpl){r.tpl.a=remap(idMaps.acc,r.tpl.a);r.tpl.to=remap(idMaps.acc,r.tpl.to);r.tpl.c=remap(idMaps.cat,r.tpl.c)}
for(const b of s.bud)b.c=remap(idMaps.cat,b.c);
for(const p of s.pay)for(const v of p.paid||[])if(v.tx!==undefined)v.tx=remap(idMaps.tx,v.tx);
s.payday=(+s.payday>=1&&+s.payday<=28)?Math.floor(+s.payday):1;
const jc=s.jatahCfg&&typeof s.jatahCfg==='object'?s.jatahCfg:{},NN=x=>{const n=B(x);return n>0n&&n.toString().length<=MAXD?n:0n};
s.jatahCfg={tabungan:NN(jc.tabungan),disisihkan:NN(jc.disisihkan),periode:typeof jc.periode==='string'&&DT.test(jc.periode)?jc.periode:'',cadanganMode:jc.cadanganMode==='nominal'?'nominal':'persen',cadanganPersen:Number.isInteger(+jc.cadanganPersen)&&+jc.cadanganPersen>=0&&+jc.cadanganPersen<=100?+jc.cadanganPersen:10,cadanganNominal:NN(jc.cadanganNominal)};
// Peta referensi bertipe mencegah transaksi menunjuk rekening/kategori
// yang hilang atau berasal dari ruang kerja berbeda.
const accById=new Map(s.acc.map(a=>[a.id,a]));
const catById=new Map(s.cat.map(c=>[c.id,c]));
const payById=new Map(s.pay.map(p=>[p.id,p]));
const validDate=d=>typeof d==='string'&&DT.test(d)&&(()=>{const z=new Date(d+'T00:00:00Z');return Number.isFinite(z.getTime())&&z.toISOString().slice(0,10)===d})();
const validAmount=n=>n>0n&&n.toString().length<=MAXD;
// Jangan membuang transaksi rusak diam-diam: pertahankan sebagai batal
// sehingga riwayat masih dapat diperiksa, tetapi jangan biarkan memengaruhi angka.
for(const x of s.tx){
 const a=accById.get(x.a),to=x.ty==='transfer'?accById.get(x.to):null,c=T[x.ty]?.cat?catById.get(x.c):null;
 const invalid=!T[x.ty]||!validDate(x.d)||!validAmount(x.amt)||!a||a.w!==x.w||
  (T[x.ty]?.only&&T[x.ty].only!==x.w)||
  (x.ty==='transfer'&&(!to||to.w!==x.w||to.id===a.id))||
  (T[x.ty]?.cat&&(!c||c.w!==x.w||c.k!==T[x.ty].cat));
 if(invalid||!['ok','void'].includes(x.st)){x.st='void';x.invalidReason='Data transaksi tidak lengkap atau referensinya tidak cocok; tidak dihitung.'}
 else x.st=x.st==='void'?'void':'ok';
 x.to=typeof x.to==='string'?x.to:'';x.c=typeof x.c==='string'?x.c:'';
 for(const f of['pair','pay','rec'])if(x[f]!==undefined&&typeof x[f]!=='string')delete x[f];
}
// Aturan berulang yang referensinya rusak dinonaktifkan, bukan dijalankan.
s.rec=s.rec.filter(r=>r&&r.tpl&&T[r.tpl.ty]&&['week','month','year'].includes(r.freq)&&validDate(r.next));
for(const r of s.rec){r.on=r.on===true;const a=accById.get(r.tpl.a),to=r.tpl.ty==='transfer'?accById.get(r.tpl.to):null,c=T[r.tpl.ty]?.cat?catById.get(r.tpl.c):null;
 if(!validAmount(r.tpl.amt)||!a||a.w!==r.w||(T[r.tpl.ty]?.only&&T[r.tpl.ty].only!==r.w)||(r.tpl.ty==='transfer'&&(!to||to.w!==r.w||to.id===a.id))||(T[r.tpl.ty]?.cat&&(!c||c.w!==r.w||c.k!==T[r.tpl.ty].cat)))r.on=false;
}
// Catatan utang/piutang dinormalisasi tanpa menghapus pembayaran yang sudah ada.
s.pay=s.pay.filter(p=>p&&typeof p.who==='string'&&['pay','recv'].includes(p.dir)&&validAmount(p.amt));
for(const p of s.pay){p.st=p.st==='ok'||p.st==='void'?p.st:'void';if(!validDate(p.due))p.due=today();p.paid=p.paid.filter(v=>validAmount(v.amt)&&(!v.d||validDate(v.d)));for(const v of p.paid)if(v.tx!==undefined&&typeof v.tx!=='string')delete v.tx}
// Referensi antarobjek yang tidak ditemukan dibuang agar tidak menunjuk data lain.
const ids=new Set(s.tx.map(x=>x.id));
// Referensi pembayaran yang hilang sengaja dipertahankan: pa() akan menilainya 0,
// sehingga Finara tidak menganggap utang sudah dibayar bila transaksi buktinya hilang.
const validPayIds=new Set(s.pay.map(p=>p.id));
for(const x of s.tx){if(x.pay&&!validPayIds.has(x.pay))delete x.pay;if(x.rec&&!s.rec.some(r=>r.id===x.rec))delete x.rec;if(x.pair&&!ids.has(x.pair))delete x.pair}
for(const b of s.bud){if(typeof b.w!=='string'||!['p','u'].includes(b.w))b.w='p';if(!catById.has(b.c)||catById.get(b.c).w!==b.w||catById.get(b.c).k!=='out')b.lim=0n}
s.bud=s.bud.filter(b=>b.lim>0n);
s.goal=s.goal.filter(g=>typeof g.n==='string'&&validAmount(g.t)&&g.s>=0n);
s.schema=SCHEMA;return s
}
let raw=null;try{raw=localStorage.getItem(K);S=JSON.parse(raw);if(S&&(S.schema||1)<SCHEMA)try{localStorage.setItem(K+'.v'+(S.schema||1),raw)}catch(e){}}catch(e){S=null}
const m0=migrate(S);if(m0==='new'){document.body.innerHTML='<div style="padding:24px;font:16px/1.5 sans-serif"><b>Data berasal dari versi Finara yang lebih baru.</b><p>Perbarui aplikasi agar data tidak rusak. Data Anda tidak diubah.</p></div>';throw new Error('schema baru')}
if(raw&&!m0){try{localStorage.setItem(K+'.rusak',raw)}catch(e){}}
S=m0||fresh();
function save(){try{localStorage.setItem(K,J(S))}catch(e){toast('Penyimpanan peramban tidak tersedia. Buat cadangan manual.')}}
let TT;function toastU(t,fn){const e=$('#toast');e.textContent=t;const b=document.createElement('button');b.textContent='Urungkan';b.style.cssText='margin-left:12px;border:0;background:none;color:#a6ee6b;font:inherit;font-weight:800;text-decoration:underline;cursor:pointer';b.onclick=()=>{fn();e.style.display='none'};e.append(b);e.style.display='block';e.style.pointerEvents='auto';clearTimeout(TT);TT=setTimeout(()=>e.style.display='none',6000)}
function toast(t,ms){try{navigator.vibrate&&navigator.vibrate(8)}catch(x){}const e=$('#toast');e.textContent=t;e.style.display='block';clearTimeout(TT);TT=setTimeout(()=>e.style.display='none',ms||2600)}
