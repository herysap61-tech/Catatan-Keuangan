// Uji regresi jatah harian Pribadi dengan saldo rekening yang benar-benar
// berubah mengikuti transaksi sah bertanggal hari ini/masa lalu.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src=readFileSync(new URL('../js/06b-jatah.js',import.meta.url),'utf8');
const fn=src.slice(src.indexOf('function jatah(){'),src.indexOf('// Jalankan fn'));
const TODAY='2026-10-30', NEXT_PAYDAY='2026-11-09';
const iso=d=>d.toISOString().slice(0,10);
const plus=(s,n)=>{const d=new Date(s+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return iso(d)};
const addP=(s,f,dom)=>{if(f==='week')return plus(s,7);const d=new Date(s+'T00:00:00Z');if(f==='year')d.setUTCFullYear(d.getUTCFullYear()+1);else d.setUTCMonth(d.getUTCMonth()+1,1);const y=d.getUTCFullYear(),m=d.getUTCMonth();return y+'-'+String(m+1).padStart(2,'0')+'-'+String(Math.min(dom,new Date(Date.UTC(y,m+1,0)).getUTCDate())).padStart(2,'0')};
const sandbox={
  S:{active:'p',acc:[{id:'a',w:'p',open:2000000n},{id:'b',w:'p',open:0n}],tx:[],rec:[{id:'r1',w:'p',on:true,tpl:{ty:'expense',amt:600000n,n:'Tagihan contoh'},next:'2026-10-31',freq:'month',dom:31}],pay:[],jatahCfg:{}},
  T:{income:{s:1,l:'Pemasukan'},expense:{s:-1,l:'Pengeluaran'},transfer:{s:0,l:'Transfer'},loan_prin:{s:-1,l:'Bayar pokok'},loan_int:{s:-1,l:'Bunga'}},
  range:()=>['2026-10-09','2026-11-08'],dAdd:(d,n)=>plus(d,n),addP,today:()=>TODAY,
  dd:(a,b)=>Math.round((new Date(b+'T00:00:00Z')-new Date(a+'T00:00:00Z'))/86400000),
  accs:()=>sandbox.S.acc.filter(a=>a.w===sandbox.S.active),
  txs:()=>sandbox.S.tx.filter(x=>x.w===sandbox.S.active),
  bal:a=>{let b=a.open;for(const x of sandbox.S.tx){if(x.w!==a.w||x.st!=='ok'||x.d>TODAY)continue;if(x.ty==='transfer'){if(x.a===a.id)b-=x.amt;if(x.to===a.id)b+=x.amt}else if(x.a===a.id)b+=BigInt(sandbox.T[x.ty].s)*x.amt}return b},
  sisa:p=>{const n=p.amt-(p.paid||[]).reduce((v,x)=>v+x.amt,0n);return n>0n?n:0n},
  BigInt
};
vm.createContext(sandbox);vm.runInContext(fn,sandbox);
const recurringBase=[{id:'r1',w:'p',on:true,tpl:{ty:'expense',amt:600000n,n:'Tagihan contoh'},next:'2026-10-31',freq:'month',dom:31}];
const baseCfg=()=>({tabungan:200000n,disisihkan:0n,periode:'2026-10-09',cadanganMode:'persen',cadanganPersen:10,cadanganNominal:0n});
const tx=(ty,amt,d=TODAY,extra={})=>({id:'t'+(sandbox.S.tx.length+1),w:'p',ty,amt:BigInt(amt),d,st:'ok',a:'a',to:'',...extra});
const run=(cfg=baseCfg(),{transactions=[],recurring=recurringBase,payables=[] ,accounts=null}={})=>{
  sandbox.S.active='p';sandbox.S.tx=transactions;sandbox.S.rec=recurring;sandbox.S.pay=payables;sandbox.S.jatahCfg=cfg;
  sandbox.S.acc=accounts||[{id:'a',w:'p',open:2000000n},{id:'b',w:'p',open:0n}];
  return sandbox.jatah();
};
let j=run();
assert.equal(j.days,10,'hari sampai gajian harus inklusif hari ini, tidak termasuk hari gajian');
assert.equal(j.tot,2000000n);assert.equal(j.bt,600000n);assert.equal(j.afterBills,1400000n);
assert.equal(j.savingsHold,200000n);assert.equal(j.reserve,120000n);assert.equal(j.fr,1080000n);assert.equal(j.per,108000n);

// Setoran yang sudah diamankan tidak dipotong dua kali; jika melebihi target,
// nilai aktual yang lebih besar tetap dilindungi.
j=run({...baseCfg(),disisihkan:200000n});assert.equal(j.savingsHold,200000n);assert.equal(j.fr,1080000n);
j=run({...baseCfg(),disisihkan:250000n});assert.equal(j.savingsHold,250000n);assert.equal(j.reserve,115000n);assert.equal(j.fr,1035000n);

// Periode tabungan lama tidak ikut dianggap sebagai setoran periode baru.
j=run({...baseCfg(),periode:'2026-09-09',disisihkan:200000n,cadanganMode:'nominal',cadanganNominal:0n});
assert.equal(j.saved,0n);assert.equal(j.savingsHold,200000n);assert.equal(j.fr,1200000n);

// Metode nominal menggantikan persentase; persentase 0 dan 100 memiliki batas yang benar.
j=run({...baseCfg(),cadanganMode:'nominal',cadanganNominal:150000n});assert.equal(j.reserve,150000n);assert.equal(j.fr,1050000n);
j=run({...baseCfg(),tabungan:0n,cadanganPersen:100});assert.equal(j.reserve,1400000n);assert.equal(j.fr,0n);
j=run({...baseCfg(),tabungan:0n,cadanganPersen:0});assert.equal(j.reserve,0n);assert.equal(j.fr,1400000n);

// Saldo dihitung dari transaksi nyata: pengeluaran hari ini menurunkan saldo,
// sedangkan jumlahnya ditambahkan kembali hanya untuk menghitung jatah hari ini.
j=run(baseCfg(),{transactions:[tx('expense',50000n)]});
assert.equal(j.tot,1950000n);assert.equal(j.out,50000n);assert.equal(j.bt,600000n);
assert.equal(j.reserve,115000n);assert.equal(j.fr,1035000n);assert.equal(j.A,108500n);assert.equal(j.rem,58500n);

// Transaksi batal, transaksi ruang Usaha, dan transaksi masa depan yang bukan
// biaya tidak boleh mengubah saldo/jatah Pribadi.
j=run(baseCfg(),{transactions:[tx('expense',90000n,TODAY,{st:'void'}),tx('expense',70000n,TODAY,{w:'u'}),tx('income',500000n,'2026-11-01')]});
assert.equal(j.tot,2000000n);assert.equal(j.fr,1080000n);assert.equal(j.out,0n);

// Biaya satu kali yang dijadwalkan sebelum gajian ditahan sejak sekarang.
j=run(baseCfg(),{transactions:[tx('expense',100000n,'2026-11-01')]});
assert.equal(j.tot,2000000n,'saldo belum berubah sebelum tanggal transaksi');assert.equal(j.bt,700000n);assert.equal(j.fr,990000n);
// Biaya setelah hari gajian tidak ditahan pada siklus ini.
j=run(baseCfg(),{transactions:[tx('expense',100000n,NEXT_PAYDAY)]});assert.equal(j.bt,600000n);assert.equal(j.fr,1080000n);
// Pinjaman pokok dan bunga masa depan juga merupakan arus kas keluar terjadwal.
j=run({...baseCfg(),cadanganMode:'nominal',cadanganNominal:0n},{transactions:[tx('loan_prin',80000n,'2026-11-02'),tx('loan_int',20000n,'2026-11-03')]});
assert.equal(j.bt,700000n);assert.equal(j.fr,1100000n);

// Transfer hari ini tidak mengubah total saldo; transaksi antar-workspace diabaikan.
j=run({...baseCfg(),tabungan:0n,cadanganPersen:0},{transactions:[tx('transfer',300000n,TODAY,{to:'b'})]});
assert.equal(j.tot,2000000n);assert.equal(j.fr,1400000n);

// Utang jatuh tempo sebelum gajian dikurangkan; pembayaran terkait yang sudah
// tercatat mengurangi sisa utang sehingga tidak ditahan dua kali.
const p={id:'p1',w:'p',dir:'pay',who:'Kawan',amt:200000n,due:'2026-11-02',st:'ok',paid:[]};
j=run({...baseCfg(),cadanganMode:'nominal',cadanganNominal:0n},{payables:[p]});assert.equal(j.bt,800000n);assert.equal(j.fr,1000000n);
const p2={...p,paid:[{amt:50000n}]};j=run({...baseCfg(),cadanganMode:'nominal',cadanganNominal:0n},{payables:[p2]});assert.equal(j.bt,750000n);assert.equal(j.fr,1050000n);
// Pembayaran utang yang dijadwalkan setelah gajian belum boleh dianggap lunas.
const futurePay={...p,paid:[{amt:200000n,tx:'future-payment'}]};j=run({...baseCfg(),cadanganMode:'nominal',cadanganNominal:0n},{payables:[futurePay],transactions:[tx('expense',200000n,'2026-11-10',{id:'future-payment',pay:'p1'})]});assert.equal(j.bt,800000n);
// Jika pembayaran terjadwal sebelum gajian, kewajiban tersisa dan transaksi masa depan bersama-sama ditahan tepat sekali.
const partialFuture={...p,paid:[{amt:50000n,tx:'future-partial'}]};j=run({...baseCfg(),cadanganMode:'nominal',cadanganNominal:0n},{payables:[partialFuture],transactions:[tx('expense',50000n,'2026-11-02',{id:'future-partial',pay:'p1'})]});assert.equal(j.bt,800000n);

// Beberapa kejadian berulang mingguan di dalam rentang sampai gajian semuanya ditahan.
const weekly={id:'rw',w:'p',on:true,tpl:{ty:'expense',amt:25000n,n:'Mingguan'},next:'2026-11-01',freq:'week',dom:1};
j=run({...baseCfg(),cadanganMode:'nominal',cadanganNominal:0n},{recurring:[weekly]});assert.equal(j.bt,50000n);assert.equal(j.fr,1750000n);

// Cadangan nominal yang lebih besar daripada dana tetap memperlihatkan defisit.
j=run({...baseCfg(),tabungan:0n,cadanganMode:'nominal',cadanganNominal:2500000n});assert.equal(j.fr,-1100000n);

// Nominal sangat besar tetap presisi BigInt.
const huge=10n**30n;j=run({...baseCfg(),tabungan:0n,cadanganPersen:0},{recurring:[],accounts:[{id:'a',w:'p',open:huge}]});assert.equal(j.tot,huge);assert.equal(j.fr,huge);

console.log('✓ 20 skenario jatah harian Pribadi lolos (saldo aktual, biaya terjadwal, transfer, utang, recurring, dan presisi BigInt).');
