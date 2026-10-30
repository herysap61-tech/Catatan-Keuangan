// Audit alur transaksi Pribadi: saldo, laporan, jurnal, transfer, batal,
// perubahan transaksi, serta relasi pembayaran utang/piutang.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const data=read('js/02-data.js');
const calc=read('js/03-hitung.js');
const advanced=read('js/08-data-lanjutan.js');
const today='2026-10-30';
const T={
 income:{l:'Pendapatan',s:1,cat:'in'},expense:{l:'Pengeluaran',s:-1,cat:'out'},transfer:{l:'Transfer',s:0},
 loan_in:{l:'Pinjaman diterima',s:1},loan_prin:{l:'Bayar pokok',s:-1},loan_int:{l:'Bunga',s:-1,cat:'out'},
 refund:{l:'Refund',s:1,cat:'out'},adjp:{l:'Koreksi +',s:1},adjm:{l:'Koreksi -',s:-1}
};
const S={active:'p',acc:[{id:'cash',w:'p',name:'Tunai',open:1000n},{id:'bank',w:'p',name:'Bank',open:0n}],cat:[{id:'inc',w:'p',k:'in',name:'Gaji'},{id:'out',w:'p',k:'out',name:'Belanja'}],tx:[],pay:[],rec:[],bud:[],goal:[],log:[],schema:3};
const sandbox={S,T,SCHEMA:3,MAXD:36,B:v=>typeof v==='bigint'?v:BigInt(v||0),uid:(()=>{let i=0;return()=>`id_${++i}`})(),today:()=>today,
 accs:()=>S.acc.filter(a=>a.w===S.active),txs:()=>S.tx.filter(x=>x.w===S.active),nm:(a,id)=>(a.find(x=>x.id===id)||{}).name||'—',
 rp:v=>'Rp'+v.toString(),esc:String,ymd:d=>d.toISOString().slice(0,10),pad:n=>String(n).padStart(2,'0'),
};
sandbox.eff=x=>x.ty==='transfer'?0n:BigInt(T[x.ty].s)*x.amt;
vm.createContext(sandbox);
const extract=(src,a,b)=>src.slice(src.indexOf(a),src.indexOf(b));
vm.runInContext(extract(calc,'function bal(a){','function range(')+'\n'+extract(calc,'function sum(f,t){','const U='),sandbox);
vm.runInContext(extract(advanced,'const logA=','function csv(')+ '\n'+extract(advanced,'const pa=','function nudge()')+'\n'+extract(advanced,'function jr(x){','let HINT='),sandbox);
const add=(id,ty,amt,extra={})=>S.tx.push({id,w:'p',st:'ok',d:'2026-10-10',ty,a:'cash',to:'',c:'',amt:BigInt(amt),...extra});
// Alur gabungan: pendapatan, biaya, transfer, pinjaman, pokok, bunga, refund, koreksi.
add('i','income',500,{c:'inc'});add('e','expense',100,{c:'out'});
add('tr','transfer',200,{to:'bank'});add('li','loan_in',300);add('lp','loan_prin',50);add('lt','loan_int',10,{c:'out'});
add('rf','refund',20,{c:'out'});add('ap','adjp',5);add('am','adjm',2);
assert.equal(sandbox.bal(S.acc[0]),1463n,'saldo rekening sumber');
assert.equal(sandbox.bal(S.acc[1]),200n,'saldo rekening tujuan transfer');
let r=sandbox.sum('2026-10-01','2026-10-31');
assert.equal(r.start,1000n);assert.equal(r.end,1663n,'saldo akhir laporan harus sama dengan total saldo rekening');
assert.equal(S.acc.reduce((n,a)=>n+sandbox.bal(a),0n),r.end,'rekonsiliasi saldo rekening dengan laporan');
let L=sandbox.ledger(),D=0n,C=0n;
for(const [d,c] of Object.values(L)){D+=d;C+=c}
assert.equal(D,C,'jurnal debit dan kredit harus seimbang');
// Pembatalan tidak menghapus jejak, tetapi harus membalik dampaknya pada saldo/laporan/jurnal.
const before=sandbox.bal(S.acc[0]);const e=S.tx.find(x=>x.id==='e');e.st='void';
assert.equal(sandbox.bal(S.acc[0]),before+100n);assert.equal(sandbox.sum('2026-10-01','2026-10-31').exp, -10n,'refund dikurangi hanya dari biaya yang masih sah');
L=sandbox.ledger();D=0n;C=0n;for(const [d,c] of Object.values(L)){D+=d;C+=c}assert.equal(D,C);
// Edit transaksi mengubah saldo dan laporan satu kali, bukan membuat duplikasi.
e.st='ok';e.amt=150n;e.d='2026-10-20';assert.equal(sandbox.bal(S.acc[0]),before-50n);
assert.equal(S.tx.filter(x=>x.id==='e').length,1);
// Pembayaran utang yang tertaut mengikuti status dan nominal transaksi rekening.
const debt={id:'debt',w:'p',dir:'pay',who:'Kawan',amt:200n,due:'2026-11-02',st:'ok',paid:[{d:today,amt:50n,tx:'debtpay'}]};
S.pay=[debt];add('debtpay','expense',50,{pay:'debt',c:'out'});
assert.equal(vm.runInContext('sisa(S.pay[0])',sandbox),150n);
const debtTx=S.tx.find(x=>x.id==='debtpay');debtTx.pay='other';assert.equal(vm.runInContext('sisa(S.pay[0])',sandbox),200n,'transaksi yang tertaut ke utang lain tidak boleh melunasi utang ini');debtTx.pay='debt';debtTx.w='u';assert.equal(vm.runInContext('sisa(S.pay[0])',sandbox),200n,'transaksi ruang Usaha tidak boleh melunasi utang Pribadi');debtTx.w='p';debtTx.ty='income';assert.equal(vm.runInContext('sisa(S.pay[0])',sandbox),200n,'transaksi masuk tidak boleh dianggap pembayaran utang');debtTx.ty='expense';
S.tx.find(x=>x.id==='debtpay').st='void';assert.equal(vm.runInContext('sisa(S.pay[0])',sandbox),200n,'pembatalan pembayaran mengembalikan sisa utang');
S.tx.find(x=>x.id==='debtpay').st='ok';S.tx.find(x=>x.id==='debtpay').amt=75n;assert.equal(vm.runInContext('sisa(S.pay[0])',sandbox),125n,'perubahan nominal pembayaran memperbarui sisa utang');debt.paid.push({...debt.paid[0]});assert.equal(vm.runInContext('sisa(S.pay[0])',sandbox),125n,'bukti transaksi pembayaran yang sama tidak boleh dihitung dua kali');
// Rekonsiliasi memakai transaksi koreksi: saldo cocok, tetapi pendapatan/pengeluaran tidak berubah.
const beforeIncome=sandbox.sum('2026-10-01','2026-10-31').inc,beforeAdj=sandbox.sum('2026-10-01','2026-10-31').adj;
add('recon','adjp',25);const reconciled=sandbox.sum('2026-10-01','2026-10-31');
assert.equal(reconciled.inc,beforeIncome);
assert.equal(reconciled.adj,beforeAdj+25n,'koreksi saldo dicatat terpisah dari pendapatan dan beban');
// Future transaction tidak masuk saldo/jurnal saat ini, tetapi tetap bisa masuk laporan rentang mendatang.
const fut={id:'future',w:'p',st:'ok',d:'2026-11-02',ty:'expense',a:'cash',c:'out',amt:40n};const beforeFuture=sandbox.bal(S.acc[0]);S.tx.push(fut);
assert.equal(sandbox.bal(S.acc[0]),beforeFuture,'transaksi masa depan tidak boleh mengubah saldo sekarang');
const futureReport=sandbox.sum('2026-11-01','2026-11-30');assert.equal(futureReport.start,S.acc.reduce((n,a)=>n+sandbox.bal(a),0n));assert.equal(futureReport.end,futureReport.start-40n,'laporan tanggal mendatang memasukkan transaksi sesuai tanggalnya');
L=sandbox.ledger();assert.ok(!Object.keys(L).includes('B:out')||L['B:out'][0]>=0n,'jurnal saat ini tidak memasukkan transaksi masa depan');
console.log('✓ 15 pemeriksaan alur transaksi Pribadi lolos: saldo, laporan, transfer, jurnal, pembatalan, edit, utang tertaut, dan transaksi masa depan.');
