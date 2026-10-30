// Uji regresi logika indikator keuangan Finara 1.6.2.
// Menjalankan fungsi health aktual dengan lingkungan data minimal terkontrol.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const src=readFileSync(new URL('../js/06b-jatah.js',import.meta.url),'utf8');
const fn=src.slice(src.indexOf('function health(f,t,r){'));
const today='2026-10-30';
const sandbox={
  S:{active:'p',acc:[],tx:[],pay:[],cat:[]},
  T:{income:{s:1},expense:{s:-1},loan_in:{s:1},loan_prin:{s:-1},loan_int:{s:-1},transfer:{s:0}},
  today:()=>today, mon:()=>[{f:'2026-07-01',t:'2026-07-31'},{f:'2026-08-01',t:'2026-08-31'},{f:'2026-09-01',t:'2026-09-30'},{f:'2026-10-01',t:'2026-10-31'}],
  sum:()=>({exp:0n,lpr:0n}), txs:()=>sandbox.S.tx.filter(x=>x.w===sandbox.S.active),
  sisa:p=>p.amt-(p.paid||[]).reduce((a,v)=>a+v.amt,0n),
  accs:()=>sandbox.S.acc.filter(a=>a.w===sandbox.S.active),
  bal:a=>a.open, CYC:()=>false, PF:()=> 'owner', nm:()=>'-',
  rp:v=>'Rp'+v.toString(), esc:v=>String(v)
};
vm.createContext(sandbox); vm.runInContext(fn,sandbox);
const tx=(w,ty,amt,a='a',d=today)=>({w,ty,amt:BigInt(amt),a,st:'ok',d});
const render=()=>sandbox.health('2026-10-01','2026-10-31',{inc:1000n,exp:200n,lpr:700n,cat:{}});
// Pinjaman 1.000 menambah kas, tetapi bukan kekayaan bersih.
sandbox.S.acc=[{id:'a',w:'p',open:100n}]; sandbox.S.tx=[tx('p','loan_in',1000)];
let html=render(); assert.match(html,/Rp100/,'pinjaman harus dikurangkan dari kekayaan bersih');
// Pembayaran pokok 200 menurunkan kas dan kewajiban dengan nilai sama.
sandbox.S.acc=[{id:'a',w:'p',open:100n}]; sandbox.S.tx=[tx('p','loan_in',1000),tx('p','loan_prin',200)];
html=render(); assert.match(html,/Rp100/,'pembayaran pokok harus mengurangi kas dan kewajiban');
// Saldo gabungan harus membaca kedua ruang kerja, bukan hanya ruang aktif.
sandbox.S.acc=[{id:'a',w:'p',open:100n},{id:'b',w:'u',open:200n}]; sandbox.S.tx=[];
html=render(); assert.match(html,/Rp300/,'kekayaan gabungan harus memasukkan saldo Pribadi dan Usaha');
// Sisa arus kas: (1000 pemasukan - 200 beban - 700 pokok) / 1000 = 10%.
sandbox.S.acc=[{id:'a',w:'p',open:100n}]; sandbox.S.tx=[];
html=render(); assert.match(html,/10\.0%/,'sisa arus kas harus memperhitungkan pembayaran pokok');
console.log('✓ 4 skenario regresi indikator keuangan lolos.');
