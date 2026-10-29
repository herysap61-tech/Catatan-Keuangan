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
adjp:{l:'Koreksi saldo (+)',s:1,only:'u'},adjm:{l:'Koreksi saldo (−)',s:-1,only:'u'}};
const TH={income:'Uang masuk dari penghasilan atau penjualan. Saldo rekening bertambah, dan jumlahnya masuk ke pendapatan serta laba. Jurnal: debit rekening, kredit pendapatan.',expense:'Uang keluar untuk biaya. Saldo rekening berkurang, dan jumlahnya masuk ke pengeluaran sehingga mengurangi laba. Jurnal: debit beban, kredit rekening.',transfer:'Memindahkan uang antar rekening Anda sendiri. Total uang tidak berubah, jadi tidak dihitung sebagai pendapatan atau pengeluaran.',capital:'Uang pribadi yang Anda masukkan ke usaha. Saldo usaha bertambah, tetapi ini bukan penjualan sehingga tidak menambah laba. Dicatat sebagai modal pemilik.',draw:'Uang usaha yang Anda ambil untuk diri sendiri. Saldo usaha berkurang, tetapi ini bukan biaya sehingga tidak mengurangi laba.',loan_in:'Uang pinjaman yang masuk. Saldo bertambah dan kewajiban (utang) naik, tetapi ini bukan pendapatan.',loan_prin:'Cicilan pokok pinjaman. Saldo berkurang dan kewajiban turun, tetapi ini bukan beban. Bunganya dicatat terpisah.',loan_int:'Bunga pinjaman adalah biaya. Saldo berkurang dan laba ikut berkurang.',refund:'Uang kembali dari pembelian atau biaya yang dibatalkan. Saldo bertambah dan mengurangi pengeluaran pada kategori itu, bukan dihitung sebagai pendapatan.',adjp:'Menyesuaikan saldo agar sama dengan kenyataan, misalnya setelah menghitung uang tunai. Hanya mengubah saldo, tidak masuk pendapatan atau beban.',adjm:'Menyesuaikan saldo agar sama dengan kenyataan, misalnya ada selisih hitung. Hanya mengubah saldo, tidak masuk pendapatan atau beban.'};
function fresh(){const a=(w,n)=>({id:uid(),w,name:n,open:0n}),c=(w,k,n)=>({id:uid(),w,k,name:n});
return{active:'p',profile:null,payday:1,acc:[a('p','Tunai'),a('p','Bank'),a('u','Kas usaha'),a('u','Bank usaha')],
cat:[c('p','in','Gaji'),c('p','in','Pendapatan lain'),c('p','out','Makan'),c('p','out','Transportasi'),c('p','out','Tagihan'),c('p','out','Belanja'),c('p','out','Lainnya'),
c('u','in','Penjualan'),c('u','in','Pendapatan lain'),c('u','out','Pembelian barang'),c('u','out','Biaya operasional'),c('u','out','Gaji karyawan'),c('u','out','Lainnya')],
tx:[],bud:[],log:[],schema:2,rec:[],pay:[],goal:[]}}
let S,tab='home',R={p:'month',o:0,f:today(),t:today()},Q={q:'',ty:''},FM={},PEND=null;
const SCHEMA=2;
function migrate(s){if(!s||typeof s!=='object'||!Array.isArray(s.acc))return null;const v=s.schema||1;if(v>SCHEMA)return'new';for(const k of['tx','cat','bud','log','rec','pay','goal'])if(!Array.isArray(s[k]))s[k]=[];s.tx=s.tx.filter(x=>x&&T[x.ty]&&typeof x.d==='string');s.rec=s.rec.filter(r=>r&&r.tpl&&T[r.tpl.ty]);if(s.active!=='p'&&s.active!=='u')s.active='p';for(const a of s.acc){a.open=B(a.open);if(Array.isArray(a.src))a.src.forEach(v=>v.amt=B(v.amt))}s.tx.forEach(x=>x.amt=B(x.amt));s.bud.forEach(v=>v.lim=B(v.lim));s.rec.forEach(r=>{if(r.tpl)r.tpl.amt=B(r.tpl.amt)});s.pay.forEach(p=>{p.amt=B(p.amt);if(Array.isArray(p.paid))p.paid.forEach(v=>v.amt=B(v.amt))});s.goal.forEach(g=>{g.t=B(g.t);g.s=B(g.s)});if(!['person','owner','biz'].includes(s.profile))s.profile=null;s.payday=(+s.payday>=1&&+s.payday<=28)?Math.floor(+s.payday):1;s.schema=SCHEMA;return s}
let raw=null;try{raw=localStorage.getItem(K);S=JSON.parse(raw);if(S&&(S.schema||1)<SCHEMA)try{localStorage.setItem(K+'.v'+(S.schema||1),raw)}catch(e){}}catch(e){S=null}
const m0=migrate(S);if(m0==='new'){document.body.innerHTML='<div style="padding:24px;font:16px/1.5 sans-serif"><b>Data berasal dari versi Finara yang lebih baru.</b><p>Perbarui aplikasi agar data tidak rusak. Data Anda tidak diubah.</p></div>';throw new Error('schema baru')}
if(raw&&!m0){try{localStorage.setItem(K+'.rusak',raw)}catch(e){}}
S=m0||fresh();
function save(){try{localStorage.setItem(K,J(S))}catch(e){toast('Penyimpanan peramban tidak tersedia. Buat cadangan manual.')}}
let TT;function toastU(t,fn){const e=$('#toast');e.textContent=t;const b=document.createElement('button');b.textContent='Urungkan';b.style.cssText='margin-left:12px;border:0;background:none;color:#a6ee6b;font:inherit;font-weight:800;text-decoration:underline;cursor:pointer';b.onclick=()=>{fn();e.style.display='none'};e.append(b);e.style.display='block';e.style.pointerEvents='auto';clearTimeout(TT);TT=setTimeout(()=>e.style.display='none',6000)}
function toast(t){try{navigator.vibrate&&navigator.vibrate(8)}catch(x){}const e=$('#toast');e.textContent=t;e.style.display='block';clearTimeout(TT);TT=setTimeout(()=>e.style.display='none',2600)}
