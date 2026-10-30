// Uji alur rekonsiliasi rekening Pribadi dan konfirmasi sebelum koreksi.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const calc=read('js/03-hitung.js'),actions=read('js/09-aksi.js');
const S={active:'p',acc:[{id:'cash',w:'p',name:'Tunai',open:1000n}],cat:[],tx:[{id:'e',w:'p',st:'ok',d:'2026-10-01',ty:'expense',a:'cash',c:'',amt:200n}],pay:[],rec:[],bud:[],goal:[],log:[]};
const T={expense:{s:-1},adjp:{s:1},adjm:{s:-1}};
const sandbox={S,T,MAXD:36,FM:{},today:()=> '2026-10-30',accs:()=>S.acc.filter(a=>a.w===S.active),txs:()=>S.tx.filter(x=>x.w===S.active),
 eff:x=>BigInt(T[x.ty].s)*x.amt,rp:x=>(x<0n?'−':'')+'Rp'+(x<0n?-x:x),uid:()=>`recon_${S.tx.length}`,logA:(...x)=>S.log.push(x),save:()=>{},close:()=>{},render:()=>{},toast:()=>{},
 sheet:x=>sandbox.lastSheet=x,ask:(...x)=>sandbox.lastAsk=x,accdet:id=>sandbox.lastAccount=id,$:sel=>sandbox.fields[sel],fields:{'#realsaldo':{value:'750'},'#err':{textContent:''}}};
vm.createContext(sandbox);
const extract=(src,a,b)=>src.slice(src.indexOf(a),src.indexOf(b));
vm.runInContext(extract(calc,'function bal(a){','function range('),sandbox);
const methods=extract(actions,'reconcile(id){','accdet(id){');
vm.runInContext('const act={'+methods+'accdet(id){lastAccount=id}}; this.__act=act;',sandbox);
const act=sandbox.__act;
assert.equal(sandbox.bal(S.acc[0]),800n);
act.reconcile('cash');assert.match(sandbox.lastSheet,/Saldo menurut Finara/);
act.reconcilesave();assert.equal(S.tx.length,1,'belum ada koreksi sebelum konfirmasi');assert.ok(sandbox.lastAsk[0].includes('−Rp50'));
act.reconcileapply();assert.equal(sandbox.bal(S.acc[0]),750n);assert.equal(S.tx.length,2);
assert.equal(S.tx[1].ty,'adjm');assert.equal(S.tx[1].amt,50n);
assert.equal(sandbox.lastAccount,'cash');
// Koreksi tidak mengubah transaksi pengeluaran historis.
assert.equal(S.tx.filter(x=>x.ty==='expense').reduce((v,x)=>v+x.amt,0n),200n);
// Saldo yang sudah cocok tidak membuat transaksi baru.
sandbox.fields['#realsaldo'].value='750';act.reconcile('cash');act.reconcilesave();assert.equal(S.tx.length,2);
// Titik ribuan diterima dan diproses sebagai pemisah, bukan desimal.
sandbox.fields['#realsaldo'].value='1.000';act.reconcile('cash');act.reconcilesave();assert.equal(S.tx.length,2);assert.equal(sandbox.lastAsk[0].includes('Rp1000'),true);
// Input nonangka dan format titik yang tidak valid ditolak.
sandbox.fields['#realsaldo'].value='tujuh ratus';act.reconcile('cash');act.reconcilesave();assert.equal(S.tx.length,2);assert.match(sandbox.fields['#err'].textContent,/angka rupiah/);sandbox.fields['#realsaldo'].value='1.2';act.reconcile('cash');act.reconcilesave();assert.equal(S.tx.length,2);
console.log('✓ 5 pemeriksaan rekonsiliasi saldo Pribadi lolos (pratinjau, konfirmasi, koreksi, saldo cocok, input invalid).');
