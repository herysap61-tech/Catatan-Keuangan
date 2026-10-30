// Uji migrasi data lama ke skema 3 dan konfigurasi jatah Mode Pribadi.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const src=readFileSync(new URL('../js/02-data.js',import.meta.url),'utf8');
const fn=src.slice(src.indexOf('function migrate(s){'),src.indexOf('let raw=null;'));
let id=0;
const sandbox={
  SCHEMA:3,MAXD:36,
  T:{income:{s:1,cat:'in'},expense:{s:-1,cat:'out'},transfer:{s:0},loan_in:{s:1},loan_prin:{s:-1},loan_int:{s:-1,cat:'out'},capital:{s:1,only:'u'}},
  B:v=>typeof v==='bigint'?v:typeof v==='number'&&Number.isFinite(v)?BigInt(Math.round(v)):/^-?\d+$/.test(String(v))?BigInt(v):0n,
  uid:()=>`migrated_${++id}`,
  today:()=> '2026-10-30'
};
vm.createContext(sandbox);vm.runInContext(fn,sandbox);
const old={schema:2,active:'p',profile:'person',payday:10,
  acc:[{id:'cash',w:'p',name:'Tunai',open:'1500000'},{id:'biz',w:'u',name:'Kas usaha',open:'900000'}],
  cat:[{id:'income-cat',w:'p',k:'in',name:'Gaji'}],tx:[{id:'salary',w:'p',st:'ok',d:'2026-10-01',ty:'income',amt:'500000',a:'cash',c:'income-cat'}],
  rec:[],pay:[],bud:[],goal:[],log:[]};
let m=sandbox.migrate(structuredClone(old));
assert.equal(m.schema,3);assert.equal(m.jatahCfg.tabungan,0n);assert.equal(m.jatahCfg.disisihkan,0n);
assert.equal(m.jatahCfg.cadanganMode,'persen');assert.equal(m.jatahCfg.cadanganPersen,10);assert.equal(m.jatahCfg.cadanganNominal,0n);
assert.equal(m.acc[0].open,1500000n);assert.equal(m.acc[1].open,900000n);assert.equal(m.tx[0].amt,500000n);
assert.equal(m.active,'p');assert.equal(m.payday,10);assert.equal(m.tx[0].st,'ok');

// Pengaturan jatah yang sudah ada dipertahankan dan dikonversi ke BigInt.
const withCfg={...structuredClone(old),jatahCfg:{tabungan:'200000',disisihkan:'150000',periode:'2026-10-09',cadanganMode:'nominal',cadanganPersen:25,cadanganNominal:'300000'}};
m=sandbox.migrate(withCfg);
assert.equal(m.jatahCfg.tabungan,200000n);assert.equal(m.jatahCfg.disisihkan,150000n);
assert.equal(m.jatahCfg.periode,'2026-10-09');assert.equal(m.jatahCfg.cadanganMode,'nominal');
assert.equal(m.jatahCfg.cadanganPersen,25);assert.equal(m.jatahCfg.cadanganNominal,300000n);

// Persentase di luar rentang kembali ke default aman; data dari skema lebih baru ditolak.
m=sandbox.migrate({...structuredClone(old),jatahCfg:{cadanganPersen:150,tabungan:'-500',disisihkan:'-1',cadanganNominal:'-900'}});
assert.equal(m.jatahCfg.cadanganPersen,10);assert.equal(m.jatahCfg.tabungan,0n);assert.equal(m.jatahCfg.disisihkan,0n);assert.equal(m.jatahCfg.cadanganNominal,0n);
const newer={...structuredClone(old),schema:4};assert.equal(sandbox.migrate(newer),'new');assert.equal(newer.schema,4);
assert.equal(sandbox.migrate({schema:2,acc:null}),null);
// Relasi rekening lintas ruang, transfer tanpa tujuan, kategori yang salah,
// nominal negatif, dan jenis transaksi khusus Usaha tidak boleh memengaruhi saldo.
const bad={...structuredClone(old),tx:[
 {id:'cross',w:'p',st:'ok',d:'2026-10-01',ty:'income',amt:'100000',a:'biz',c:'income-cat'},
 {id:'bad-transfer',w:'p',st:'ok',d:'2026-10-01',ty:'transfer',amt:'50000',a:'cash',to:'missing'},
 {id:'bad-cat',w:'p',st:'ok',d:'2026-10-01',ty:'income',amt:'70000',a:'cash',c:'missing'},
 {id:'negative',w:'p',st:'ok',d:'2026-10-01',ty:'income',amt:'-90000',a:'cash',c:'income-cat'},
 {id:'biz-only',w:'p',st:'ok',d:'2026-10-01',ty:'capital',amt:'10000',a:'cash'}
]};
m=sandbox.migrate(bad);assert.equal(m.tx.length,5);assert.ok(m.tx.every(x=>x.st==='void'));
// ID rekening ganda diperbaiki sehingga saldo tidak terhitung dua kali.
const dup={...structuredClone(old),acc:[{id:'cash',w:'p',name:'Tunai A',open:'100'},{id:'cash',w:'p',name:'Tunai B',open:'200'}]};
m=sandbox.migrate(dup);assert.notEqual(m.acc[0].id,m.acc[1].id);
// ID lama yang tidak sesuai format diperbaiki sekaligus mempertahankan relasinya.
const legacy={...structuredClone(old),acc:[{id:'cash legacy!',w:'p',name:'Tunai',open:'100'}],cat:[{id:'income legacy!',w:'p',k:'in',name:'Gaji'}],tx:[{id:'salary',w:'p',st:'ok',d:'2026-10-01',ty:'income',amt:'50',a:'cash legacy!',c:'income legacy!'}]};
m=sandbox.migrate(legacy);assert.equal(m.tx[0].st,'ok');assert.equal(m.tx[0].a,m.acc[0].id);assert.equal(m.tx[0].c,m.cat[0].id);
const invalidActive={...structuredClone(old),active:'x'};m=sandbox.migrate(invalidActive);assert.equal(m.active,'p');
// Pembayaran yang kehilangan transaksi bukti tidak boleh berubah menjadi pembayaran manual.
const orphanPay={...structuredClone(old),pay:[{id:'debt',w:'p',dir:'pay',who:'Kawan',amt:'100',due:'2026-11-01',st:'ok',paid:[{amt:'40',d:'2026-10-30',tx:'missing-proof'}]}],tx:[{id:'orphan-tx',w:'p',st:'ok',d:'2026-10-01',ty:'income',amt:'20',a:'cash',c:'income-cat',pay:'missing-debt'}]};
m=sandbox.migrate(orphanPay);assert.equal(m.pay[0].paid[0].tx,'missing-proof');assert.equal(m.tx[0].pay,undefined);
console.log('✓ 10 pemeriksaan migrasi dan konfigurasi Pribadi lolos, termasuk relasi data rusak dan pemetaan ID lama.');
