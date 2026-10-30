// Uji indikator kesehatan keuangan Pribadi: pinjaman, arus kas, dan presisi rasio.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const src=readFileSync(new URL('../js/06b-jatah.js',import.meta.url),'utf8');
const fn=src.slice(src.indexOf('function health(f,t,r){'));
const today='2026-10-30';
const months=[
  {f:'2026-08-01',t:'2026-08-31'},
  {f:'2026-09-01',t:'2026-09-30'},
  {f:'2026-10-01',t:'2026-10-31'},
  {f:'2026-07-01',t:'2026-07-31'},
  {f:'2026-06-01',t:'2026-06-30'},
  {f:'2026-05-01',t:'2026-05-31'}
];
let monthlyBurn=300n;
const sandbox={
  S:{active:'p',profile:'person',acc:[{id:'a',w:'p',open:1000n}],tx:[],pay:[]},
  T:{income:{s:1},expense:{s:-1},transfer:{s:0},loan_in:{s:1},loan_prin:{s:-1},loan_int:{s:-1}},
  today:()=>today,mon:()=>months,txs:()=>sandbox.S.tx.filter(x=>x.w==='p'),
  sum:()=>({exp:monthlyBurn,lpr:0n,cat:{}}),
  sisa:p=>p.amt-(p.paid||[]).reduce((s,x)=>s+x.amt,0n),
  PF:()=> 'person',CYC:()=>false,rp:v=>'Rp'+v.toString(),nm:()=>'-',esc:v=>String(v)
};
vm.createContext(sandbox);vm.runInContext(fn,sandbox);
const loanTx=[
  {w:'p',st:'ok',d:'2026-10-01',ty:'loan_in',amt:500n,a:'a'},
  {w:'p',st:'ok',d:'2026-10-15',ty:'loan_prin',amt:200n,a:'a'},
  {w:'p',st:'ok',d:'2026-10-20',ty:'loan_int',amt:100n,a:'a'}
];
sandbox.S.tx=loanTx;
let html=sandbox.health('2026-10-01','2026-10-31',{inc:1000n,exp:200n,lpr:200n,cat:{}});
// Kas = 1.000 + 500 pinjaman - 200 pokok - 100 bunga = 1.200.
// Sisa pinjaman = 300; kas non-pinjaman = 900. Burn rata-rata = 200 + 100 = 300.
assert.match(html,/Daya tahan kas non-pinjaman/);
assert.match(html,/3\.0 bulan/,'pokok pinjaman harus masuk rata-rata arus kas keluar');
assert.match(html,/60\.0%/,'sisa arus kas harus dihitung setelah pokok pinjaman');
assert.match(html,/30\.0%/,'beban cicilan harus menghitung pokok dan bunga');
assert.ok(html.includes('saldo + piutang − utang − pinjaman tercatat'));

// Rasio nominal sangat besar harus tetap menjadi digit biasa, bukan notasi ilmiah.
sandbox.S.acc=[{id:'a',w:'p',open:10n**30n}];sandbox.S.tx=[];monthlyBurn=1n;
html=sandbox.health('2026-10-01','2026-10-31',{inc:0n,exp:1n,lpr:0n,cat:{}});
assert.match(html,/1000000000000000000000000000000\.0 bulan/);
console.log('✓ 5 pemeriksaan kesehatan keuangan Pribadi lolos (pinjaman, pokok cicilan, rasio, dan nominal besar).');
