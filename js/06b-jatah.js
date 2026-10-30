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
const hasAdv=()=>S.tx.some(x=>x.w==='p'&&!BASIC.includes(x.ty)&&!['adjp','adjm'].includes(x.ty))||S.pay.some(p=>p.w==='p'&&p.st!=='void');
const LJ=()=>U()||LANJUT||hasAdv();
const tyOK=(k,cur)=>(!T[k].only||U()||k===cur)&&(LJ()||BASIC.includes(k)||k===cur);

/* ---------- Hitungan jatah harian ----------
   Uang tersedia = total saldo − tagihan − tabungan yang diamankan − cadangan tak terduga.
   Jatah hari ini (A) = (sisa setelah tagihan + pengeluaran harian hari ini) ÷ jumlah hari sampai gajian (hari ini ikut dihitung).
   Sisa jatah (rem)  = A − pengeluaran harian hari ini.
   Pengeluaran harian = jenis "expense" yang bukan hasil transaksi berulang dan bukan pembayaran utang
   (keduanya sudah dihitung lewat tagihan). next = jatah per hari mulai besok bila hari ini tidak belanja lagi. */
function jatah(){
const[f,t]=range('month'),np=dAdd(t,1),td=today(),days=Math.max(1,dd(td,np)),tot=accs().reduce((s,a)=>s+bal(a),0n),B=[];
for(const q of S.rec){if(q.w!==S.active||!q.on||!['expense','loan_prin','loan_int'].includes(q.tpl.ty))continue;let d=q.next,g=0;while(d<np&&g++<12){if(d>=td)B.push({d,a:q.tpl.amt,n:q.tpl.n||'Tagihan berulang'});d=addP(d,q.freq,q.dom)}}
const sisaSampai=(p)=>{const seen=new Set(),paid=(p.paid||[]).reduce((v,z)=>{if(z.tx){if(seen.has(z.tx))return v;seen.add(z.tx);const x=S.tx.find(t=>t.id===z.tx);return x&&x.w===p.w&&x.pay===p.id&&x.st==='ok'&&x.d<np&&x.ty===(p.dir==='recv'?'income':'expense')?v+x.amt:v}return(!z.d||z.d<=td)?v+z.amt:v},0n),left=p.amt-paid;return left>0n?left:0n};
for(const p of S.pay)if(p.w===S.active&&p.st==='ok'&&p.dir!=='recv'&&sisaSampai(p)>0n&&p.due<np)B.push({d:p.due,a:sisaSampai(p),n:'Utang: '+p.who});
// Pengeluaran satu kali yang sudah dijadwalkan sebelum gajian juga harus
// ditahan sekarang, meski saldo rekening baru berubah pada tanggal transaksi.
for(const x of txs())if(x.st==='ok'&&x.d>td&&x.d<np&&['expense','loan_prin','loan_int'].includes(x.ty))B.push({d:x.d,a:x.amt,n:x.n||T[x.ty].l});
B.sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0);
const bt=B.reduce((s,b)=>s+b.a,0n),afterBills=tot-bt;
// Target tabungan berlaku untuk satu periode gajian. Jumlah aktual yang sudah
// disisihkan hanya menjadi pembanding; uang yang dilindungi adalah max(target, aktual).
const cfg=S.jatahCfg||{},period=range('month')[0],saved=cfg.periode===period?(cfg.disisihkan||0n):0n;
const savingsTarget=cfg.tabungan||0n,savingsHold=savingsTarget>saved?savingsTarget:saved,savingsLeft=savingsTarget>saved?savingsTarget-saved:0n;
// Total saldo mencakup semua rekening, termasuk rekening tabungan. Karena itu
// target tabungan penuh dikurangi tepat satu kali; 'sudah disisihkan' hanya
// memisahkan target yang sudah diamankan vs yang masih perlu diamankan.
const afterSavings=afterBills-savingsHold;
const reserve=cfg.cadanganMode==='nominal'?(cfg.cadanganNominal||0n):(afterSavings>0n?afterSavings*BigInt(cfg.cadanganPersen||0)/100n:0n);
const fr=afterSavings-reserve;let out=0n;
for(const x of txs())if(x.st==='ok'&&x.d===td&&x.ty==='expense'&&!x.rec&&!x.pay)out+=x.amt;
const A=(fr+out)/BigInt(days);
return{f,t,np,days,tot,B,bt,afterBills,savingsTarget,savingsHold,saved,savingsLeft,afterSavings,reserve,reserveMode:cfg.cadanganMode||'persen',reservePercent:cfg.cadanganPersen??10,reserveNominal:cfg.cadanganNominal||0n,period,fr,out,A,rem:A-out,per:fr>0n?fr/BigInt(days):0n,next:days>1&&fr>0n?fr/BigInt(days-1):0n}}
// Jalankan fn dengan satu transaksi rekaan ditambahkan sementara (untuk pratinjau dampak).
function simTx(o,fn){const t={id:'_sim',w:S.active,st:'ok',at:Date.now(),c:'',to:'',n:'',...o};S.tx.push(t);try{return fn()}finally{const i=S.tx.indexOf(t);if(i>=0)S.tx.splice(i,1)}}
// Belum ada uang yang tercatat sama sekali: jatah belum bisa dihitung.
const needSetup=()=>!accs().some(a=>a.open>0n)&&!txs().some(x=>x.st==='ok'&&T[x.ty].s>0);
// Tambah tagihan tetap bulanan (aturan berulang). Tagihan yang tanggalnya sudah lewat/hari ini dianggap sudah dibayar bulan ini.
function addBill(n,amt,dom,acc){const cs=cats('out'),c=cs.find(v=>/tagihan/i.test(v.name))||cs[0];if(!c||!acc)return false;const td=today();let nx=td.slice(0,7)+'-'+pad(dom);if(nx<=td)nx=addP(nx,'month',dom);
S.rec.push({id:uid(),w:S.active,tpl:{ty:'expense',a:acc,to:'',c:c.id,amt,n},freq:'month',dom,next:nx,on:true});logA('','tagihan tetap',n+' '+rp(amt));return true}

/* ---------- Umpan balik setelah mencatat (toast) ---------- */
function fbMsg(ty,d){const td=today();if(d>td){const J=jatah(),biaya=['expense','loan_prin','loan_int'].includes(ty);return biaya&&d<J.np?'Tersimpan. Biaya sebelum gajian sudah ditahan dalam jatah; saldo rekening berubah pada '+tglId(d)+'.':'Tersimpan. Transaksi masa depan belum mengubah saldo atau jatah sampai tanggalnya tiba.';}
if(needSetup())return'Tersimpan. Isi saldo awal lewat Beranda (Hitung jatah harian saya) agar jatah harian bisa dihitung.';
const J=jatah();if(ty==='transfer')return'Tersimpan. Total uang tidak berubah, jatah harian aman.';
if(J.fr<0n)return'Tersimpan. Uang belum cukup untuk tagihan sampai gajian (kurang '+rp(-J.fr)+').';
if(ty==='expense'&&d===td)return J.rem<0n?'Tersimpan. Melebihi jatah hari ini '+rp(-J.rem)+(J.days>1?'. Jatah besok jadi '+rp(J.next)+'.':'.'):'Tersimpan. Sisa jatah hari ini '+rp(J.rem)+'.';
if(ty==='income')return'Tersimpan. Uang tersedia sampai gajian jadi '+rp(J.fr)+', alokasi hari ini '+rp(J.A)+'.';
return'Tersimpan. Uang tersedia sampai gajian: '+rp(J.fr)+'.'}

/* ---------- Pratinjau dampak di formulir transaksi baru ---------- */
function imp(){const el=$('#imp');if(!el)return;el.innerHTML='';if(FM.id||U())return;
const ty=$('#fty').value,ds=$('#fa').value.replace(/\D/g,''),a=$('#fac').value,to=$('#fto').value,d=$('#fd').value;
if(!ds||ds.length>MAXD||!a||!/^\d{4}-\d{2}-\d{2}$/.test(d)||BigInt(ds)<=0n)return;
const amt=BigInt(ds),ac=S.acc.find(v=>v.id===a);if(!ac)return;const td=today(),L=[];
const ln=(l,x,y)=>L.push(`<div><span>${l}</span><span>${rp(x)} → <span class="${y<0n?'neg':''}">${rp(y)}</span></span></div>`);
const future=d>td,toa=ty==='transfer'?S.acc.find(v=>v.id===to):null,b0=bal(ac),b20=toa?bal(toa):0n,J0=jatah();
const n=simTx({d,ty,a,to:toa?to:'',amt},()=>({j:jatah(),b:bal(ac),b2:toa?bal(toa):0n}));let p='';
if(!future){ln('Saldo '+esc(ac.name),b0,n.b);if(toa)ln('Saldo '+esc(toa.name),b20,n.b2)}else{
ln('Saldo '+esc(ac.name),b0,n.b);if(toa)ln('Saldo '+esc(toa.name),b20,n.b2);
if(ty==='expense'||ty==='loan_prin'||ty==='loan_int')p=n.j.fr!==J0.fr?'Biaya ini sudah ditahan dari uang tersedia karena jatuh sebelum gajian. Saldo rekening baru berubah pada tanggal transaksi.':'Tanggal biaya berada di luar periode sampai gajian; belum mengurangi jatah sekarang.';
else p='Tanggal masa depan: saldo baru berubah pada tanggal transaksi. Pemasukan masa depan tidak dimasukkan ke jatah sebelum benar-benar diterima.';
}
if(ty==='transfer')p='Total uang tidak berubah, jadi jatah harian tidak terpengaruh.';
else if(needSetup())p='Saldo awal belum diisi, jadi hitungan jatah belum bisa ditampilkan. Isi lewat Beranda (Hitung jatah harian saya).';
else{ln('Uang tersedia sampai gajian',J0.fr,n.j.fr);
if(ty==='expense'&&d===td){ln('Sisa jatah hari ini',J0.rem,n.j.rem);if(n.j.rem<0n)p='Melebihi jatah hari ini, sehingga jatah hari-hari berikutnya ikut menyusut.'}
else if(!future&&ty!=='expense')ln('Jatah hari ini',J0.A,n.j.A)}
el.innerHTML='<b>Dampak jika disimpan</b>'+L.join('')+(p?'<p>'+p+'</p>':'')}

/* ---------- Beranda perorangan ---------- */
function heroJ(J){const ng=J.fr<0n,ov=!ng&&J.rem<0n,pc0=J.A>0n?Math.min(100,Math.max(0,Number(J.out*100n/J.A))):(J.out>0n?100:0);
const lab=ng?'Uang belum cukup sampai gajian':ov?'Melebihi alokasi hari ini':'Estimasi alokasi hari ini',big=ng?'Kurang '+rp(-J.fr):rp(J.rem);
const sub=ng?'Saldo '+rp(J.tot)+', tagihan '+rp(J.bt)+', tabungan dan cadangan '+rp(J.tot-J.bt-J.fr)+'. Periksa saldo dan pengaturan jatah.'
:ov?(J.days>1?'Jatah hari-hari berikutnya menyusut jadi '+rp(J.next)+' per hari.':'Besok sudah gajian.')
:S.tx.length?'Dari jatah '+rp(J.A)+' hari ini, terpakai '+rp(J.out)+'.':'Catat pengeluaran pertama Anda, dan angka ini langsung berubah.';
return`<div class="hero hj${ng||ov?' bad':''}"><small>${lab}</small><b>${big}</b>${ng?'':`<div class="hbar" role="img" aria-label="Jatah hari ini terpakai ${pc0}%"><i style="width:${pc0}%"></i></div>`}<small class="hsub">${sub}</small>
<div class="hmini"><span><em>Total saldo</em><strong>${rp(J.tot)}</strong></span><span><em>Tagihan</em><strong>−${rp(J.bt)}</strong></span><span><em>Siap digunakan</em><strong>${rp(J.fr)}</strong></span></div>
<small>Estimasi rata-rata setelah tagihan, tabungan, dan cadangan yang Anda atur; bukan batas aman mutlak. Dibagi ${J.days} hari sampai gajian ${tglId(J.np)}. <button class="lk" data-a="payday">Ubah tanggal gajian</button></small>
<div class="qa"><button class="btn" data-a="add:expense"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Catat</button><button class="btn ghost" data-a="add:transfer"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h13M16 3l4 4-4 4M17 17H4M8 13l-4 4 4 4"/></svg>Transfer</button></div></div>`}
// Layar pertama untuk pengguna yang belum punya uang tercatat: janji, contoh hitungan, tiga pertanyaan.
function vWelcome(){return`<div class="dash"><div class="hero hj prom"><small>Selamat datang di Finara</small><b>Perkirakan alokasi rata-rata harian dari saldo dan tagihan sampai gajian.</b><small>Jawab 3 pertanyaan singkat. Hasilnya langsung tampil, sebelum Anda mencatat apa pun.</small><div class="qa"><button class="btn" data-a="onb">Hitung jatah harian saya</button></div></div>
<div class="d-a"><div class="c"><b>Begini cara menghitungnya</b><table><tr><td>Uang Anda sekarang</td><td>Rp2.000.000</td></tr><tr><td>Tagihan tetap sebelum gajian</td><td>−Rp600.000</td></tr><tr><td>Tabungan yang diamankan</td><td>Rp0</td></tr><tr><td>Cadangan tak terduga (10%)</td><td>−Rp140.000</td></tr><tr><td>Uang tersedia</td><td>Rp1.260.000</td></tr><tr><td>Gajian 10 hari lagi</td><td class="pos">Rp126.000 per hari</td></tr></table><small>Hanya contoh. Angka Anda dihitung dari jawaban Anda sendiri.</small></div>
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
an=Object.entries(r.cat).map(([c,v])=>[c,v,ms.reduce((s,m)=>s+(sum(m.f,m.t).cat[c]||0n),0n)/3n]).filter(([c,v,av])=>av>0n&&v>av*3n/2n).sort((a,b)=>{const da=a[1]-a[2],db=b[1]-b[2];return db>da?1:db<da?-1:0}).slice(0,3);
const hr=(a,b,c,k)=>`<div class="hr"><div><b>${a}</b></div><div><b class="${k||''}">${b}</b><small>${c}</small></div></div>`,
loanLeft=txs().filter(x=>x.st==='ok'&&x.d<=today()&&(x.ty==='loan_in'||x.ty==='loan_prin')).reduce((v,x)=>v+(x.ty==='loan_in'?x.amt:-x.amt),0n),
loanWarn=loanLeft>0n?`<small class="hint">Perhatian: masih ada pinjaman tercatat ${rp(loanLeft)}. Nilai ini tidak otomatis dikurangkan dari jatah kecuali cicilannya dijadwalkan sebelum gajian. Tambahkan jadwal di tagihan berulang atau catatan utang agar tidak terlewat.</small>`:'',
li=J.B.slice(0,5).map(b=>`<div class="hr"><div><small>${fd(b.d)} · ${esc(b.n)}</small></div><div><small>${rp(b.a)}</small></div></div>`).join('')+(J.B.length>5?`<small>dan ${J.B.length-5} tagihan lainnya</small>`:'');
return`<div class="c health"><h3>Cara menghitung jatah Anda</h3>`+hr('Total saldo',rp(J.tot),'semua rekening')
+hr('Tagihan sebelum gajian','−'+rp(J.bt),J.B.length+' tagihan atau utang')+li
+(J.B.length?'':'<small>Belum ada tagihan tetap atau utang jatuh tempo sebelum gajian.</small>')
+hr('Sisa setelah tagihan',rp(J.afterBills),'sebelum tabungan dan cadangan')
+hr('Tabungan yang diamankan','−'+rp(J.savingsHold),'Target '+rp(J.savingsTarget)+' · sudah disisihkan '+rp(J.saved)+' · masih perlu '+rp(J.savingsLeft))
+hr('Cadangan tak terduga','−'+rp(J.reserve),J.reserveMode==='nominal'?'Nominal tetap yang Anda tentukan':J.reservePercent+'% dari sisa setelah tabungan')
+hr('Uang tersedia sampai gajian',rp(J.fr),J.fr>0n?rp(J.per)+' per hari ('+J.days+' hari)':'alokasi belum mencukupi',J.fr<0n?'neg':'pos')
+an.map(([c,v,av])=>hr('Perlu diperhatikan',rp(v),esc(nm(S.cat,c))+' di atas biasanya ('+rp(av)+')','neg')).join('')
+loanWarn+`<div class="row"><button class="btn ghost" data-a="billnew">Tambah tagihan tetap</button><button class="btn ghost" data-a="rec">Lihat semua tagihan</button></div><small class="hint">Uang tersedia = total saldo seluruh rekening dikurangi tagihan, tabungan yang diamankan, dan cadangan tak terduga. Pastikan total saldo mencakup rekening tabungan/cadangan juga; nominal 'sudah disisihkan' hanya untuk bagian target tabungan yang memang sudah dipindahkan atau diamankan pada periode berjalan. Jangan masukkan setoran yang sama dua kali. Angka ini estimasi berdasarkan catatan Anda, bukan jaminan uang aman dibelanjakan.</small></div>`}

/* ---------- Kartu kesehatan keuangan, kini dengan saran langkah ---------- */
function health(f,t,r){
// Hitung setiap ruang kerja secara mandiri agar saldo gabungan tidak memakai
// transaksi ruang aktif untuk rekening ruang kerja lain.
const cashFor=w=>S.acc.filter(a=>a.w===w).reduce((total,a)=>{let b=a.open;for(const x of S.tx){if(x.w!==w||x.st!=='ok'||x.d>today())continue;if(x.ty==='transfer'){if(x.a===a.id)b-=x.amt;if(x.to===a.id)b+=x.amt}else if(x.a===a.id)b+=BigInt(T[x.ty].s)*x.amt}return total+b},0n);
const loanFor=w=>{let v=0n;for(const x of S.tx)if(x.w===w&&x.st==='ok'&&x.d<=today()){if(x.ty==='loan_in')v+=x.amt;else if(x.ty==='loan_prin')v-=x.amt}return v>0n?v:0n};
const payFor=(w,dir)=>S.pay.filter(p=>p.w===w&&p.st==='ok'&&p.dir===dir).reduce((v,p)=>v+sisa(p),0n);
const cash= cashFor(S.active),rc=payFor(S.active,'recv'),db=payFor(S.active,'pay'),loan=loanFor(S.active),nw=cash+rc-db-loan;
const ms=mon(6).slice(2,5).map(m=>{const z=sum(m.f,m.t);return z.exp+z.lpr}).filter(v=>v>0n),av=ms.length?ms.reduce((s,v)=>s+v,0n)/BigInt(ms.length):0n;
// Rasio dihitung sepenuhnya dengan BigInt agar nominal besar tidak kehilangan presisi
// saat dikonversi ke Number. Hasil disimpan dalam satuan persepuluh.
const ratio10=(n,d,scale)=>{if(d<=0n)return null;const neg=n<0n,a=neg?-n:n,q=(a*scale+d/2n)/d;return neg?-q:q};
const fmt10=v=>{if(v===null)return'–';const a=v<0n?-v:v;return(v<0n?'−':'')+(a/10n)+'.'+(a%10n)};
const runwayCash=cash>loan?cash-loan:0n,em10=av>0n?ratio10(runwayCash,av,10n):null;
const ins=txs().filter(x=>x.st==='ok'&&x.d>=f&&x.d<=t&&(x.ty==='loan_prin'||x.ty==='loan_int')).reduce((s,x)=>s+x.amt,0n),dr10=r.inc>0n?ratio10(ins,r.inc,1000n):null;
// Sisa arus kas setelah beban dan pembayaran pokok, bukan sekadar pendapatan dikurangi beban.
const sv10=r.inc>0n?ratio10(r.inc-r.exp-r.lpr,r.inc,1000n):null;
const allCash=cashFor('p')+cashFor('u'),allReceivable=payFor('p','recv')+payFor('u','recv'),allPayable=payFor('p','pay')+payFor('u','pay'),allLoan=loanFor('p')+loanFor('u'),al=allCash+allReceivable-allPayable-allLoan;
const top=Object.entries(r.cat).filter(v=>v[1]>0n).sort((a,b)=>b[1]>a[1]?1:-1)[0],cy=CYC()?'periode':'bulan';
const need=av*3n-runwayCash;
const gNw=nw<0n?'Kewajiban tercatat lebih besar daripada saldo dan piutang. Periksa juga apakah pinjaman yang sama dicatat di transaksi dan daftar utang-piutang.':'',
gEm=em10===null?'Catat pengeluaran dan pembayaran cicilan selama beberapa hari agar daya tahan kas bisa diperkirakan.':em10<30n&&need>0n?'Kas non-pinjaman tercatat belum mencapai 3 bulan pengeluaran dan pembayaran pokok rata-rata. Utang-piutang yang dicatat terpisah belum dikurangkan.':'',
gSv=sv10===null?'':sv10<100n?'Sisa arus kas setelah pengeluaran dan pokok pinjaman masih di bawah 10% pemasukan. Tinjau pengeluaran dan cicilan.':sv10<200n?'Naikkan sisa arus kas menuju 20% bila memungkinkan.':'',
gDr=dr10!==null&&dr10>300n?'Pembayaran pokok dan bunga yang tercatat mencapai '+fmt10(dr10)+'% pemasukan. Angka ini tidak mencakup cicilan yang belum dicatat.':'';

const row=(l,v,s,c,h,g)=>`<div class="hr"><div><b>${l}</b><small>${h}</small>${g?`<small class="sg">Langkah: ${g}</small>`:''}</div><div><b class="${c}">${v}</b><small>${s}</small></div></div>`;
return`<div class="c health"><h3>Kesehatan keuangan</h3><small>Setiap angka disertai langkah yang bisa Anda lakukan bila perlu.</small>`+row('Kekayaan bersih (estimasi)',rp(nw),'saldo + piutang − utang − pinjaman tercatat',nw<0n?'neg':'pos','Saldo dan piutang dikurangi utang-piutang serta sisa pinjaman dari transaksi Pinjaman diterima dikurangi Bayar pokok. Jika pinjaman yang sama dicatat di kedua tempat, hasil dapat terhitung ganda.',gNw)
+(PF()==='owner'?row('Kekayaan gabungan (estimasi)',rp(al),'Pribadi + Usaha',al<0n?'neg':'pos','Saldo dan piutang kedua ruang dikurangi utang-piutang dan sisa pinjaman transaksi. Pastikan pinjaman tidak dicatat ganda.',''):'')+row('Daya tahan kas non-pinjaman (estimasi)',em10===null?'–':fmt10(em10)+' bulan',em10===null?'butuh data pengeluaran':em10<30n?'kurang':em10<=60n?'cukup':'tinggi',em10===null?'':em10<30n?'neg':'','Saldo rekening dikurangi sisa pinjaman dari transaksi, dibanding rata-rata pengeluaran dan pembayaran pokok tiga bulan yang tersedia. Utang-piutang yang dicatat terpisah belum dikurangkan; bukan ukuran dana darurat terverifikasi.',gEm)
+row('Sisa arus kas',sv10===null?'–':fmt10(sv10)+'%',sv10===null?'belum ada pemasukan':sv10>=200n?'baik':sv10>=100n?'cukup':'rendah',sv10===null?'':sv10>=100n?'pos':'neg','Pemasukan dikurangi pengeluaran tercatat dan pembayaran pokok pinjaman, dibanding pemasukan. Rasio dibulatkan satu angka desimal. Tidak sama dengan kenaikan tabungan bersih karena transfer, modal, dan penarikan tidak dihitung.',gSv)
+row('Pembayaran cicilan tercatat',dr10===null?'–':fmt10(dr10)+'%',dr10===null?'belum ada pemasukan':dr10<=300n?'sehat':dr10<=400n?'waspada':'tinggi',dr10===null?'':dr10<=300n?'pos':'neg','Pembayaran pokok dan bunga yang sudah dicatat pada periode ini dibanding pemasukan. Tidak mengukur seluruh cicilan terjadwal atau kewajiban yang belum dicatat. Rasio dibulatkan satu angka desimal.',gDr)
+`<small class="hint">Angka merupakan estimasi berdasarkan data yang dicatat, bukan pemeriksaan rekening atau kontrak. Pinjaman yang sama jangan dicatat sekaligus sebagai transaksi pinjaman dan utang-piutang tanpa rekonsiliasi.</small></div>`}
