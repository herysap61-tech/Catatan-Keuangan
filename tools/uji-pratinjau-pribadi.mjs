// Uji pratinjau dampak transaksi masa depan dan umpan balik Mode Pribadi.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const src=readFileSync(new URL('../js/06b-jatah.js',import.meta.url),'utf8');
const extract=(a,b)=>src.slice(src.indexOf(a),src.indexOf(b));
const jatahSrc=extract('function jatah(){','// Jalankan fn');
const simSrc=extract('function simTx(o,fn){','// Belum ada uang');
const impSrc=extract('function imp(){','/* ---------- Beranda perorangan ---------- */');
const fbSrc=extract('function fbMsg(ty,d){','/* ---------- Pratinjau dampak');
const planSrc=extract('function plancard(J,r){','/* ---------- Kartu kesehatan');
const TODAY='2026-10-30',np='2026-11-09';
const plus=(s,n)=>{const d=new Date(s+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const els={
  '#imp':{innerHTML:''},'#fty':{value:'expense'},'#fa':{value:'100000'},'#fac':{value:'a'},'#fto':{value:''},'#fd':{value:'2026-11-01'}
};
const sandbox={
  S:{active:'p',acc:[{id:'a',w:'p',name:'Tunai',open:2000000n}],tx:[],rec:[{id:'r',w:'p',on:true,tpl:{ty:'expense',amt:600000n,n:'Tagihan bulanan'},next:'2026-10-31',freq:'month',dom:31}],pay:[],jatahCfg:{tabungan:200000n,disisihkan:0n,periode:'2026-10-09',cadanganMode:'persen',cadanganPersen:10,cadanganNominal:0n}},
  T:{income:{s:1,l:'Pemasukan'},loan_in:{s:1,l:'Pinjaman'},expense:{s:-1,l:'Pengeluaran'},transfer:{s:0,l:'Transfer'},loan_prin:{s:-1,l:'Pokok'},loan_int:{s:-1,l:'Bunga'}},
  $:s=>els[s],FM:{id:null},MAXD:36,U:()=>false,CYC:()=>false,today:()=>TODAY,mon:()=>[{f:'2026-08-01',t:'2026-08-31'},{f:'2026-09-01',t:'2026-09-30'},{f:'2026-10-01',t:'2026-10-31'}],sum:()=>({cat:{}}),nm:()=>'-',fd:v=>v,
  range:()=>['2026-10-09','2026-11-08'],dAdd:(d,n)=>plus(d,n),addP:(d,f,dom)=>{const x=new Date(d+'T00:00:00Z');x.setUTCMonth(x.getUTCMonth()+1,1);const y=x.getUTCFullYear(),m=x.getUTCMonth();return y+'-'+String(m+1).padStart(2,'0')+'-'+String(Math.min(dom,new Date(Date.UTC(y,m+1,0)).getUTCDate())).padStart(2,'0')},
  dd:(a,b)=>Math.round((new Date(b+'T00:00:00Z')-new Date(a+'T00:00:00Z'))/86400000),
  accs:()=>sandbox.S.acc.filter(a=>a.w==='p'),txs:()=>sandbox.S.tx.filter(x=>x.w==='p'),
  bal:a=>{let b=a.open;for(const x of sandbox.S.tx){if(x.w!==a.w||x.st!=='ok'||x.d>TODAY)continue;if(x.ty==='transfer'){if(x.a===a.id)b-=x.amt;if(x.to===a.id)b+=x.amt}else if(x.a===a.id)b+=BigInt(sandbox.T[x.ty].s)*x.amt}return b},
  sisa:p=>p.amt, rp:v=>'Rp'+v.toString(),esc:v=>String(v),tglId:v=>v,needSetup:()=>false,
  BigInt,Date,DateNow:()=>0,logA:()=>{},uid:()=> 'sim'
};
vm.createContext(sandbox);vm.runInContext(jatahSrc+'\n'+simSrc+'\n'+impSrc+'\n'+fbSrc+'\n'+planSrc,sandbox);
// Pengeluaran masa depan sebelum gajian menahan jatah saat ini, tetapi belum mengubah saldo.
sandbox.imp();
let html=els['#imp'].innerHTML;
assert.ok(html.includes('Rp2000000 →') && html.includes('Rp2000000'),'saldo rekening belum berubah sebelum tanggal biaya');
assert.ok(html.includes('Rp1080000 →') && html.includes('Rp990000'),'biaya terjadwal mengurangi uang tersedia sebelum gajian');
assert.match(html,/sudah ditahan dari uang tersedia/);

// Pengeluaran setelah gajian tidak mengurangi jatah siklus sekarang.
els['#fd'].value=np;sandbox.imp();html=els['#imp'].innerHTML;
assert.ok(html.includes('Rp1080000 →') && html.includes('Rp1080000'));
assert.match(html,/berada di luar periode sampai gajian/);

// Pemasukan masa depan tidak dihitung sebagai uang yang sudah diterima.
els['#fty'].value='income';els['#fd'].value='2026-11-01';sandbox.imp();html=els['#imp'].innerHTML;
assert.match(html,/Pemasukan masa depan tidak dimasukkan/);

assert.match(sandbox.fbMsg('expense','2026-11-01'),/Biaya sebelum gajian sudah ditahan/);
assert.match(sandbox.fbMsg('income','2026-11-01'),/belum mengubah saldo atau jatah/);

// Pinjaman tanpa jadwal cicilan ditampilkan sebagai peringatan, bukan diam-diam dianggap uang bebas.
sandbox.S.tx=[{id:'loan',w:'p',st:'ok',d:TODAY,ty:'loan_in',amt:500000n,a:'a'}];
const plan=sandbox.plancard(sandbox.jatah(),{cat:{}});
assert.match(plan,/masih ada pinjaman tercatat Rp500000/);
assert.match(plan,/tidak otomatis dikurangkan dari jatah/);
console.log('✓ 7 pemeriksaan pratinjau dan transparansi pinjaman Mode Pribadi lolos.');
