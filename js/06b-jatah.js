/* ============================================================
   FINARA · js/06b-jatah.js   (baru di 1.5.0)
   JATAH HARIAN (mode Pribadi): hitungan jatah(), Beranda perorangan,
   layar sambutan, kartu cara hitung, kartu kesehatan bersaran,
   umpan balik setelah mencatat, pratinjau dampak di formulir,
   penanda "fitur lanjutan".
   Dimuat setelah 06-layar.js dan sebelum 07; fungsi di sini dipanggil
   saat aplikasi berjalan, jadi boleh memakai fungsi dari berkas bernomor
   lebih besar (addP, sisa, dst.). Lihat docs/PETA-KODE.md.
   ============================================================ */

/* ---------- Fitur lanjutan (Pribadi) ----------
   Mode sederhana hanya menampilkan Pemasukan, Pengeluaran, Transfer.
   Jenis lain (pinjaman, cicilan) dan utang-piutang muncul bila fitur lanjutan
   dinyalakan, atau otomatis bila pengguna sudah punya datanya. */
let LANJUT=false;try{LANJUT=localStorage.getItem('finara.lanjut')==='1'}catch(e){}
const BASIC=['income','expense','transfer'];
const hasAdv=()=>S.tx.some(x=>x.w==='p'&&!BASIC.includes(x.ty))||S.pay.some(p=>p.w==='p'&&p.st!=='void');
const LJ=()=>U()||LANJUT||hasAdv();
const tyOK=(k,cur)=>(!T[k].only||U()||k===cur)&&(LJ()||BASIC.includes(k)||k===cur);

/* ---------- Hitungan jatah harian ----------
   Sisa setelah tagihan = total saldo − tagihan berulang dan utang yang jatuh tempo sebelum gajian berikutnya.
   Jatah hari ini (A) = (sisa setelah tagihan + pengeluaran harian hari ini) ÷ jumlah hari sampai gajian (hari ini ikut dihitung).
   Sisa jatah (rem)  = A − pengeluaran harian hari ini.
   Pengeluaran harian = jenis "expense" yang bukan hasil transaksi berulang dan bukan pembayaran utang
   (keduanya sudah dihitung lewat tagihan). next = jatah per hari mulai besok bila hari ini tidak belanja lagi. */
function jatah(){
const[f,t]=range('month'),np=dAdd(t,1),td=today(),days=Math.max(1,dd(td,np)),tot=accs().reduce((s,a)=>s+bal(a),0n),B=[];
for(const q of S.rec){if(q.w!==S.active||!q.on||!['expense','loan_prin','loan_int'].includes(q.tpl.ty))continue;let d=q.next,g=0;while(d<np&&g++<12){if(d>=td)B.push({d,a:q.tpl.amt,n:q.tpl.n||'Tagihan berulang'});d=addP(d,q.freq,q.dom)}}
for(const p of S.pay)if(p.w===S.active&&p.st==='ok'&&p.dir!=='recv'&&sisa(p)>0n&&p.due<np)B.push({d:p.due,a:sisa(p),n:'Utang: '+p.who});
B.sort((a,b)=>a.d<b.d?-1:1);
const bt=B.reduce((s,b)=>s+b.a,0n),fr=tot-bt;let out=0n;
for(const x of txs())if(x.st==='ok'&&x.d===td&&x.ty==='expense'&&!x.rec&&!x.pay)out+=x.amt;
const A=(fr+out)/BigInt(days);
return{f,t,np,days,tot,B,bt,fr,out,A,rem:A-out,per:fr>0n?fr/BigInt(days):0n,next:days>1&&fr>0n?fr/BigInt(days-1):0n}}
// Jalankan fn dengan satu transaksi rekaan ditambahkan sementara (untuk pratinjau dampak).
function simTx(o,fn){const t={id:'_sim',w:S.active,st:'ok',at:Date.now(),c:'',to:'',n:'',...o};S.tx.push(t);try{return fn()}finally{const i=S.tx.indexOf(t);if(i>=0)S.tx.splice(i,1)}}
// Belum ada uang yang tercatat sama sekali: jatah belum bisa dihitung.
const needSetup=()=>!accs().some(a=>a.open>0n)&&!txs().some(x=>x.st==='ok'&&T[x.ty].s>0);
// Tambah tagihan tetap bulanan (aturan berulang). Tagihan yang tanggalnya sudah lewat/hari ini dianggap sudah dibayar bulan ini.
function addBill(n,amt,dom,acc){const cs=cats('out'),c=cs.find(v=>/tagihan/i.test(v.name))||cs[0];if(!c||!acc)return false;const td=today();let nx=td.slice(0,7)+'-'+pad(dom);if(nx<=td)nx=addP(nx,'month',dom);
S.rec.push({id:uid(),w:S.active,tpl:{ty:'expense',a:acc,to:'',c:c.id,amt,n},freq:'month',dom,next:nx,on:true});logA('','tagihan tetap',n+' '+rp(amt));return true}

/* ---------- Umpan balik setelah mencatat (toast) ---------- */
function fbMsg(ty,d){const td=today();if(d>td)return'Tersimpan. Dihitung ke saldo dan jatah mulai '+tglId(d)+'.';
if(needSetup())return'Tersimpan. Isi saldo awal lewat Beranda (Hitung jatah harian saya) agar jatah harian bisa dihitung.';
const J=jatah();if(ty==='transfer')return'Tersimpan. Total uang tidak berubah, jatah harian aman.';
if(J.fr<0n)return'Tersimpan. Uang belum cukup untuk tagihan sampai gajian (kurang '+rp(-J.fr)+').';
if(ty==='expense'&&d===td)return J.rem<0n?'Tersimpan. Melebihi jatah hari ini '+rp(-J.rem)+(J.days>1?'. Jatah besok jadi '+rp(J.next)+'.':'.'):'Tersimpan. Sisa jatah hari ini '+rp(J.rem)+'.';
if(ty==='income')return'Tersimpan. Sisa setelah tagihan sampai gajian jadi '+rp(J.fr)+', jatah hari ini '+rp(J.A)+'.';
return'Tersimpan. Sisa setelah tagihan sampai gajian: '+rp(J.fr)+'.'}

/* ---------- Pratinjau dampak di formulir transaksi baru ---------- */
function imp(){const el=$('#imp');if(!el)return;el.innerHTML='';if(FM.id||U())return;
const ty=$('#fty').value,ds=$('#fa').value.replace(/\D/g,''),a=$('#fac').value,to=$('#fto').value,d=$('#fd').value;
if(!ds||ds.length>MAXD||!a||!/^\d{4}-\d{2}-\d{2}$/.test(d)||BigInt(ds)<=0n)return;
const amt=BigInt(ds),ac=S.acc.find(v=>v.id===a);if(!ac)return;const td=today(),L=[];
const ln=(l,x,y)=>L.push(`<div><span>${l}</span><span>${rp(x)} → <span class="${y<0n?'neg':''}">${rp(y)}</span></span></div>`);
if(d>td){el.innerHTML='<b>Dampak jika disimpan</b><p>Tanggalnya di masa depan, jadi baru dihitung ke saldo dan jatah saat tanggalnya tiba.</p>';return}
const toa=ty==='transfer'?S.acc.find(v=>v.id===to):null,b0=bal(ac),b20=toa?bal(toa):0n,J0=jatah();
const n=simTx({d,ty,a,to:toa?to:'',amt},()=>({j:jatah(),b:bal(ac),b2:toa?bal(toa):0n}));let p='';
ln('Saldo '+esc(ac.name),b0,n.b);if(toa)ln('Saldo '+esc(toa.name),b20,n.b2);
if(ty==='transfer')p='Total uang tidak berubah, jadi jatah harian tidak terpengaruh.';
else if(needSetup())p='Saldo awal belum diisi, jadi hitungan jatah belum bisa ditampilkan. Isi lewat Beranda (Hitung jatah harian saya).';
else{ln('Sisa setelah tagihan',J0.fr,n.j.fr);
if(ty==='expense'&&d===td){ln('Sisa jatah hari ini',J0.rem,n.j.rem);if(n.j.rem<0n)p='Melebihi jatah hari ini, sehingga jatah hari-hari berikutnya ikut menyusut.'}
else if(ty!=='expense')ln('Jatah hari ini',J0.A,n.j.A)}
el.innerHTML='<b>Dampak jika disimpan</b>'+L.join('')+(p?'<p>'+p+'</p>':'')}

/* ---------- Beranda perorangan ---------- */
function heroJ(J){const ng=J.fr<0n,ov=!ng&&J.rem<0n,pc0=J.A>0n?Math.min(100,Math.max(0,Number(J.out*100n/J.A))):(J.out>0n?100:0);
const lab=ng?'Uang belum cukup sampai gajian':ov?'Melebihi jatah hari ini':'Boleh dipakai hari ini',big=ng?'Kurang '+rp(-J.fr):rp(J.rem);
const sub=ng?'Saldo '+rp(J.tot)+', tagihan sebelum gajian '+rp(J.bt)+'. Tunda pengeluaran yang tidak wajib, atau periksa lagi saldo dan tagihannya.'
:ov?(J.days>1?'Jatah hari-hari berikutnya menyusut jadi '+rp(J.next)+' per hari.':'Besok sudah gajian.')
:S.tx.length?'Dari jatah '+rp(J.A)+' hari ini, terpakai '+rp(J.out)+'.':'Catat pengeluaran pertama Anda, dan angka ini langsung berubah.';
return`<div class="hero hj${ng||ov?' bad':''}"><small>${lab}</small><b>${big}</b>${ng?'':`<div class="hbar" role="img" aria-label="Jatah hari ini terpakai ${pc0}%"><i style="width:${pc0}%"></i></div>`}<small class="hsub">${sub}</small>
<div class="hmini"><span><em>Total saldo</em><strong>${rp(J.tot)}</strong></span><span><em>Tagihan</em><strong>−${rp(J.bt)}</strong></span><span><em>Sisa setelah tagihan</em><strong>${rp(J.fr)}</strong></span></div>
<small>Dibagi ${J.days} hari sampai gajian ${tglId(J.np)}. <button class="lk" data-a="payday">Ubah tanggal gajian</button></small>
<div class="qa"><button class="btn" data-a="add:expense"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Catat</button><button class="btn ghost" data-a="add:transfer"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h13M16 3l4 4-4 4M17 17H4M8 13l-4 4 4 4"/></svg>Transfer</button></div></div>`}
// Layar pertama untuk pengguna yang belum punya uang tercatat: janji, contoh hitungan, tiga pertanyaan.
function vWelcome(){return`<div class="dash"><div class="hero hj prom"><small>Selamat datang di Finara</small><b>Tahu berapa uang yang aman dipakai per hari sampai gajian.</b><small>Jawab 3 pertanyaan singkat. Hasilnya langsung tampil, sebelum Anda mencatat apa pun.</small><div class="qa"><button class="btn" data-a="onb">Hitung jatah harian saya</button></div></div>
<div class="d-a"><div class="c"><b>Begini cara menghitungnya</b><table><tr><td>Uang Anda sekarang</td><td>Rp2.000.000</td></tr><tr><td>Tagihan tetap sebelum gajian</td><td>−Rp600.000</td></tr><tr><td>Sisa setelah tagihan</td><td>Rp1.400.000</td></tr><tr><td>Gajian 10 hari lagi</td><td class="pos">Rp140.000 per hari</td></tr></table><small>Hanya contoh. Angka Anda dihitung dari jawaban Anda sendiri.</small></div>
<div class="c"><b>Tiga pertanyaan yang akan diajukan</b><ol class="qs"><li>Uang Anda sekarang berapa?</li><li>Gajian tanggal berapa?</li><li>Tagihan tetap tiap bulan apa saja? (boleh dilewati)</li></ol><small>Setelah itu, setiap Anda mencatat pengeluaran, Beranda langsung menunjukkan sisa jatah hari ini. Data hanya tersimpan di perangkat Anda.</small><div class="row"><button class="btn ghost" data-a="demo">Coba dulu dengan data contoh</button></div></div></div></div>`}
// 1.6.0: urutan Beranda Pribadi (atas ke bawah):
//  1 jatah hari ini · 2 pemasukan/pengeluaran · 3 rekening · 4 perhatian (utang jatuh tempo, cadangan, pasang aplikasi)
//  5 cara hitung · 6 anggaran · 7 tren · 8 kesehatan keuangan · 9 transaksi terbaru (paling bawah)
//  Layar lebar: kelompok 4-8 jadi dua kolom (kiri: 4-5, kanan: 6-8) lewat dua <div class="dcol">; di HP tetap satu kolom berurutan.
function vHomeP(){if(needSetup())return vWelcome();
const[f,t]=range('month'),r=sum(f,t),J=jatah(),cy=CYC()?'periode':'bulan',demo=S.tx.some(x=>x.demo);
return`<div class="dash">${heroJ(J)}<div class="c g2 stats"><div><small>Pemasukan ${cy} ini</small><b class="pos">${rp(r.inc)}</b></div><div><small>Pengeluaran ${cy} ini</small><b class="neg">${rp(r.exp)}</b></div></div>
${strip()}<div class="d-a d-w"><div class="dcol">${demo?'<div class="c demo-b"><b>Ini data contoh</b><small>Angka di atas berasal dari data contoh, bukan uang Anda.</small><div class="row"><button class="btn ghost" data-a="democlear">Hapus data contoh dan mulai dari nol</button></div></div>':''}${due()}${nudge()}${installCard()}${plancard(J,r)}</div><div class="dcol">${S.bud.some(v=>v.w===S.active)?bud()+budPace():''}${S.tx.length?trendBal():''}${health(f,t,r)}</div></div>
<section class="d-b d-w"><div class="shd"><h3>Transaksi terbaru</h3><button class="lk" data-a="tab:tx">Lihat semua</button></div>${list(txs().sort(cmp).slice(0,5))}</section></div>`}

/* ---------- Pasang Finara di perangkat (dikembalikan di 1.6.0) ----------
   Kartu di Beranda + tombol di Lainnya. Chrome/Edge/Android memakai prompt bawaan (DEFERRED dari 06-layar.js);
   iPhone dan peramban lain mendapat petunjuk manual. Disembunyikan bila sudah dibuka sebagai aplikasi. */
const STANDALONE=()=>{try{return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}catch(e){return false}};
const ISIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
let PBH=false;try{PBH=localStorage.getItem('finara.pasang')==='1'}catch(e){}
function installCard(){if(STANDALONE()||PBH||!/^https?:$/.test(location.protocol))return'';
return`<div class="c inst"><b>Pasang Finara di perangkat ini</b><small>Buka dari layar utama seperti aplikasi biasa, tampil layar penuh, dan tetap jalan tanpa internet.</small><div class="row"><button class="btn" data-a="install">Pasang sekarang</button><button class="btn ghost" data-a="instno">Nanti saja</button></div></div>`}
addEventListener('appinstalled',()=>{DEFERRED=null;PBH=true;try{localStorage.setItem('finara.pasang','1')}catch(e){}if(tab==='home'||tab==='more')render();toast('Finara terpasang')});

/* ---------- Kartu cara hitung ---------- */
function plancard(J,r){const ms=mon(6).slice(2,5),
an=Object.entries(r.cat).map(([c,v])=>[c,v,ms.reduce((s,m)=>s+(sum(m.f,m.t).cat[c]||0n),0n)/3n]).filter(([c,v,av])=>av>0n&&v>av*3n/2n).sort((a,b)=>Number((b[1]-b[2])-(a[1]-a[2]))).slice(0,3);
const hr=(a,b,c,k)=>`<div class="hr"><div><b>${a}</b></div><div><b class="${k||''}">${b}</b><small>${c}</small></div></div>`,
li=J.B.slice(0,5).map(b=>`<div class="hr"><div><small>${fd(b.d)} · ${esc(b.n)}</small></div><div><small>${rp(b.a)}</small></div></div>`).join('')+(J.B.length>5?`<small>dan ${J.B.length-5} tagihan lainnya</small>`:'');
return`<div class="c health"><h3>Cara menghitung jatah Anda</h3>`+hr('Total saldo',rp(J.tot),'semua rekening')
+hr('Tagihan sebelum gajian','−'+rp(J.bt),J.B.length+' tagihan atau utang')+li
+(J.B.length?'':'<small>Belum ada tagihan tetap atau utang jatuh tempo sebelum gajian. Tambahkan tagihan tetap (kos, cicilan, listrik) agar jatah lebih akurat.</small>')
+hr('Sisa setelah tagihan',rp(J.fr),J.fr>0n?rp(J.per)+' per hari ('+J.days+' hari)':'belum cukup untuk tagihan',J.fr<0n?'neg':'pos')
+an.map(([c,v,av])=>hr('Perlu diperhatikan',rp(v),esc(nm(S.cat,c))+' di atas biasanya ('+rp(av)+')','neg')).join('')
+`<div class="row"><button class="btn ghost" data-a="billnew">Tambah tagihan tetap</button><button class="btn ghost" data-a="rec">Lihat semua tagihan</button></div><small class="hint">Sisa setelah tagihan = total saldo dikurangi tagihan berulang dan utang yang jatuh tempo sebelum gajian berikutnya. Jatah per hari = sisa setelah tagihan dibagi jumlah hari sampai gajian, hari ini ikut dihitung. Uang di rekening tabungan atau dana darurat tetap ikut terhitung di total saldo. Bila tidak ingin memakainya, tambahkan setoran tabungan sebagai tagihan tetap (mis. Tabungan) agar ikut ditahan; ia akan tercatat sebagai pengeluaran.</small></div>`}

/* ---------- Kartu kesehatan keuangan, kini dengan saran langkah ---------- */
function health(f,t,r){const tot=accs().reduce((s,a)=>s+bal(a),0n),pp=S.pay.filter(p=>p.w===S.active&&p.st==='ok'),rc=pp.filter(p=>p.dir==='recv').reduce((s,p)=>s+sisa(p),0n),db=pp.filter(p=>p.dir!=='recv').reduce((s,p)=>s+sisa(p),0n),nw=tot+rc-db;
const ms=mon(6).slice(2,5).map(m=>sum(m.f,m.t).exp).filter(v=>v>0n),av=ms.length?ms.reduce((s,v)=>s+v,0n)/BigInt(ms.length):0n,em=av>0n?Number(tot*10n/av)/10:null;
const ins=txs().filter(x=>x.st==='ok'&&x.d>=f&&x.d<=t&&(x.ty==='loan_prin'||x.ty==='loan_int')).reduce((s,x)=>s+x.amt,0n),dr=r.inc>0n?Math.round(Number(ins*1000n/r.inc))/10:null,sv=r.inc>0n?Math.round(Number((r.inc-r.exp)*1000n/r.inc))/10:null;
const al=S.acc.reduce((s,a)=>s+bal(a),0n)+S.pay.filter(p=>p.st==='ok').reduce((s,p)=>s+(p.dir==='recv'?sisa(p):-sisa(p)),0n);
const top=Object.entries(r.cat).filter(v=>v[1]>0n).sort((a,b)=>b[1]>a[1]?1:-1)[0],cy=CYC()?'periode':'bulan';
const need=av*3n-tot;
const gNw=nw<0n?'Utang lebih besar daripada saldo dan piutang. Lunasi bertahap, mulai dari yang bunganya paling tinggi.':'',
gEm=em===null?'Catat pengeluaran selama beberapa hari agar dana darurat bisa dihitung.':em<3&&need>0n?'Tambah '+rp(need)+' lagi untuk mencapai 3 bulan. Menyisihkan '+rp(need/6n)+' per bulan, tercapai dalam 6 bulan. Catat targetnya di Lainnya › Target tabungan.':'',
gSv=sv===null?'':sv<10?'Coba sisihkan '+rp(r.inc/10n)+' (10% pemasukan) per '+cy+(top?', mulai dari kategori terbesar: '+esc(nm(S.cat,top[0]))+' ('+rp(top[1])+').':'.'):sv<20?'Naikkan ke 20% (sekitar '+rp(r.inc/5n)+' per '+cy+') agar lebih aman.':'',
gDr=dr!==null&&dr>30?'Cicilan dan bunga '+dr+'% dari pemasukan. Tunda cicilan baru sampai di bawah 30%.':'';
const row=(l,v,s,c,h,g)=>`<div class="hr"><div><b>${l}</b><small>${h}</small>${g?`<small class="sg">Langkah: ${g}</small>`:''}</div><div><b class="${c}">${v}</b><small>${s}</small></div></div>`;
return`<div class="c health"><h3>Kesehatan keuangan</h3><small>Setiap angka disertai langkah yang bisa Anda lakukan bila perlu.</small>`+row('Kekayaan bersih',rp(nw),'saldo + piutang − utang',nw<0n?'neg':'pos','Seluruh yang Anda miliki dikurangi yang Anda tanggung.',gNw)
+(PF()==='owner'?row('Kekayaan gabungan',rp(al),'Pribadi + Usaha',al<0n?'neg':'pos','Seluruh saldo dan piutang dikurangi utang di kedua ruang. Modal dan penarikan pemilik tidak terhitung ganda.',''):'')+row('Dana darurat',em===null?'–':em+' bulan',em===null?'butuh data pengeluaran':em<3?'kurang':em<=6?'cukup':'sangat baik',em===null?'':em<3?'neg':'pos','Total saldo dibanding rata-rata pengeluaran bulanan. Patokan umum: 3–6 bulan.',gEm)
+row('Tingkat tabungan',sv===null?'–':sv+'%',sv===null?'belum ada pemasukan':sv>=20?'baik':sv>=10?'cukup':'rendah',sv===null?'':sv>=10?'pos':'neg','Bagian pemasukan periode ini yang tersisa. Patokan umum: 20% atau lebih.',gSv)
+row('Beban cicilan',dr===null?'–':dr+'%',dr===null?'belum ada pemasukan':dr<=30?'sehat':dr<=40?'waspada':'tinggi',dr===null?'':dr<=30?'pos':'neg','Cicilan dan bunga dibanding pemasukan. Patokan umum: maksimal 30–35%.',gDr)
+`<small class="hint">Perhitungan otomatis dari catatan Anda memakai patokan umum, bukan nasihat keuangan resmi.</small></div>`}
