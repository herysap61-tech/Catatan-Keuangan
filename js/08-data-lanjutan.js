/* ============================================================
   FINARA · js/08-data-lanjutan.js
   DATA LANJUTAN: log, CSV, unduh/impor, transaksi berulang, utang-piutang, jurnal debit-kredit, impor CSV
   Dimuat berurutan (angka di nama berkas = urutan). Semua berkas
   berbagi satu lingkup global; lihat docs/PETA-KODE.md.
   ============================================================ */
const logA=(id,act,b)=>{S.log.push({t:Date.now(),id,act,b});if(S.log.length>500)S.log.shift()};
const desc=x=>T[x.ty].l+' '+rp(x.amt)+' '+x.d;
function csv(f,t){const q=s=>{s=String(s??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return'"'+s.replace(/"/g,'""')+'"'};
const rows=[['Tanggal','Jenis','Rekening','Rekening tujuan','Kategori','Nominal (Rp)','Catatan','Status']].concat(txs().filter(x=>x.d>=f&&x.d<=t).sort(cmp).map(x=>[x.d,T[x.ty].l,nm(S.acc,x.a),x.to?nm(S.acc,x.to):'',x.c?nm(S.cat,x.c):'',x.amt,x.n,x.st==='ok'?'Sah':'Batal']));
return rows.map(r=>r.map(q).join(',')).join('\r\n')}
function dl(name,txt,type){const f=new File([txt],name,{type}),mob=/iPhone|iPad|Android/i.test(navigator.userAgent);
if(mob&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:name}).catch(()=>{});return}
const u=URL.createObjectURL(f),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);toast('File diunduh: '+name)}
document.addEventListener('change',e=>{if(e.target.id==='bkf'){const f=e.target.files[0];if(!f)return;f.text().then(t=>{if(t.replace(/^\uFEFF/,'').trim()[0]==='{'){$('#rs').value=t;act.rest()}else act.restcsv(t)},()=>toast('File tidak bisa dibaca'))}});
function box(title,txt,extra){sheet(`<h2>${title}</h2><textarea id="bx" readonly>${esc(txt)}</textarea><div class="row"><button class="btn" data-a="copy">Salin</button><button class="btn ghost" data-a="close">Tutup</button></div>${extra||''}`)}
function addP(d,f,dom){let[y,m]=d.split('-').map(Number);if(f==='week')return ymd(new Date(y,m-1,Number(d.slice(8))+7));if(f==='month'){m++;if(m>12){m=1;y++}}else y++;return y+'-'+pad(m)+'-'+pad(Math.min(dom,new Date(y,m,0).getDate()))}
function runRec(){let n=0;for(const r of S.rec){if(!r.on)continue;let g=0;while(r.next<=today()&&g++<120){const t=r.tpl,x={id:uid(),w:r.w,st:'ok',at:Date.now(),d:r.next,ty:t.ty,a:t.a,to:t.to,c:t.c,amt:t.amt,n:t.n,rec:r.id};S.tx.push(x);logA(x.id,'berulang',desc(x));r.next=addP(r.next,r.freq,r.dom);n++}}if(n){save();toast(n+' transaksi berulang dicatat')}}
const pa=(v,p)=>{if(!v.tx)return v.amt;const i=p&&Array.isArray(p.paid)?p.paid.indexOf(v):-1;if(i>=0&&p.paid.slice(0,i).some(z=>z.tx===v.tx))return 0n;const t=S.tx.find(t=>t.id===v.tx),ty=p&&p.dir==='recv'?'income':'expense';return t&&p&&t.st==='ok'&&t.w===p.w&&t.pay===p.id&&t.ty===ty?t.amt:0n};
const sisa=p=>{const r=p.amt-p.paid.reduce((s,v)=>s+pa(v,p),0n);return r>0n?r:0n};
function nudge(){let l=0;try{l=+localStorage.getItem('finara.lastbk')||0}catch(e){}if(!S.tx.length||Date.now()-l<14*864e5)return'';return`<button class="list-btn" data-a="bk"><small>${l?'Terakhir dicadangkan '+Math.floor((Date.now()-l)/864e5)+' hari lalu':'Data belum pernah dicadangkan'}</small><b>Unduh cadangan sekarang agar data aman</b></button>`}
function due(){const lim=ymd(new Date(Date.now()+7*864e5)),a=S.pay.filter(p=>p.w===S.active&&p.st!=='void'&&sisa(p)>0n&&p.due<=lim);return a.length?`<button class="list-btn" data-a="plist"><small>Jatuh tempo dalam 7 hari atau terlambat</small><b>${a.length} catatan, sisa ${rp(a.reduce((s,p)=>s+sisa(p),0n))}</b></button>`:''}
function jr(x){const A='A:'+x.a,Z=x.to?'A:'+x.to:'',C=x.c;return{income:[A,'R:'+C],expense:['B:'+C,A],loan_int:['B:'+C,A],refund:[A,'B:'+C],transfer:[Z,A],capital:[A,'E:modal'],draw:['E:prive',A],loan_in:[A,'L:pinjaman'],loan_prin:['L:pinjaman',A],adjp:[A,'E:koreksi'],adjm:['E:koreksi',A]}[x.ty]}
function lname(k){const[t,id]=k.split(':');return t==='A'?nm(S.acc,id):t==='R'||t==='B'?nm(S.cat,id):{modal:'Modal pemilik',prive:'Penarikan pemilik',awal:'Saldo awal (ekuitas)',koreksi:'Selisih koreksi',pinjaman:'Utang pinjaman'}[id]}
function ledger(){const L={},add=(k,d,c)=>{L[k]=L[k]||[0n,0n];L[k][0]+=BigInt(d);L[k][1]+=BigInt(c)};for(const a of accs())if(a.open){add('A:'+a.id,a.open,0);add('E:awal',0,a.open)}const td=today();for(const x of txs()){if(x.st!=='ok'||x.d>td)continue;const[d,c]=jr(x);add(d,x.amt,0);add(c,0,x.amt)}return L}
let HINT=true;try{HINT=localStorage.getItem('bukukas.hint')!=='0'}catch(e){}
let FOLD=[];try{FOLD=JSON.parse(localStorage.getItem('bukukas.fold'))||[]}catch(e){}
function applyFold(){document.querySelectorAll('.hint').forEach(h=>{h.classList.toggle('fold',FOLD.includes(hash(h.textContent)));h.setAttribute('role','button');h.tabIndex=0})}
function applyHint(){document.body.classList.toggle('nohint',!HINT);document.querySelectorAll('.hb').forEach(b=>b.classList.toggle('off',!HINT));applyFold()}
const catUse=id=>S.tx.filter(x=>x.c===id).length;
const LAST=(()=>{try{return JSON.parse(localStorage.getItem('finara.last'))||{}}catch(e){return{}}})();
const NL=()=>[...new Set(txs().sort(cmp).map(x=>x.n).filter(Boolean))].slice(0,8).map(n=>'<option value="'+esc(n)+'">').join('');
const WN={p:'Pribadi',u:'Usaha'},WK={Pribadi:'p',Usaha:'u'};
function fullcsv(){const q=s=>{s=String(s??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return'"'+s.replace(/"/g,'""')+'"'};
const r=[['Bagian','Ruang','Kolom1','Kolom2','Kolom3','Kolom4','Kolom5','Kolom6','Kolom7','Kolom8']];
S.acc.forEach(a=>r.push(['Rekening',WN[a.w],a.name,a.open]));S.cat.forEach(c=>r.push(['Kategori',WN[c.w],c.k,c.name]));
S.bud.forEach(v=>r.push(['Anggaran',WN[v.w],nm(S.cat,v.c),v.lim]));
S.tx.forEach(x=>r.push(['Transaksi',WN[x.w],x.d,x.ty,nm(S.acc,x.a),x.to?nm(S.acc,x.to):'',x.c?nm(S.cat,x.c):'',x.amt,x.n,x.st]));
return r.map(a=>a.map(q).join(',')).join('\r\n')}
function pcsv(t){t=t.replace(/^\uFEFF/,'');const l=t.split('\n')[0],d=l.includes(';')&&!l.includes(',')?';':',',o=[];let r=[],f='',qq=false;
for(let i=0;i<t.length;i++){const c=t[i];if(qq){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else qq=false}else f+=c}else if(c==='"')qq=true;else if(c===d){r.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;r.push(f);o.push(r);r=[];f=''}else f+=c}
if(f||r.length){r.push(f);o.push(r)}return o}
