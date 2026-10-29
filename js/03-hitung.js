/* ============================================================
   FINARA · js/03-hitung.js
   HITUNG: rekening, kategori, saldo, rentang periode, ringkasan (sum)
   Dimuat berurutan (angka di nama berkas = urutan). Semua berkas
   berbagi satu lingkup global; lihat docs/PETA-KODE.md.
   ============================================================ */
const accs=()=>S.acc.filter(a=>a.w===S.active),cats=k=>S.cat.filter(c=>c.w===S.active&&c.k===k),txs=()=>S.tx.filter(x=>x.w===S.active);
const nm=(l,id)=>(l.find(v=>v.id===id)||{}).name||'—',cmp=(a,b)=>b.d.localeCompare(a.d)||b.at-a.at;
const eff=x=>x.ty==='transfer'?0n:BigInt(T[x.ty].s)*x.amt;
function bal(a){let b=a.open;const td=today();for(const x of txs()){if(x.st!=='ok'||x.d>td)continue;if(x.ty==='transfer'){if(x.a===a.id)b-=x.amt;if(x.to===a.id)b+=x.amt}else if(x.a===a.id)b+=eff(x)}return b}
function range(p,o){const n=new Date();if(o&&p!=='x'){if(p==='day')n.setDate(n.getDate()+o);else if(p==='week')n.setDate(n.getDate()+7*o);else if(p==='month')n.setMonth(n.getMonth()+o,1);else n.setFullYear(n.getFullYear()+o)}const y=n.getFullYear(),m=n.getMonth();
if(p==='day')return[ymd(n),ymd(n)];
if(p==='week'){const d=new Date(y,m,n.getDate()-((n.getDay()+6)%7));return[ymd(d),ymd(new Date(d.getFullYear(),d.getMonth(),d.getDate()+6))]}
if(p==='month'){const d=S.payday||1;if(d>1&&!U()){const b=m-(new Date().getDate()>=d?0:1);return[ymd(new Date(y,b,d)),ymd(new Date(y,b+1,d-1))]}return[ymd(new Date(y,m,1)),ymd(new Date(y,m+1,0))]}
if(p==='year')return[y+'-01-01',y+'-12-31'];return R.f>R.t?[R.t,R.f]:[R.f,R.t]}
function sum(f,t){const r={inc:0n,exp:0n,cap:0n,draw:0n,lin:0n,lpr:0n,adj:0n,cat:{},cin:{},flow:0n};let before=0n;
for(const a of accs())before+=a.open;
for(const x of txs()){if(x.st!=='ok')continue;if(x.d<f){before+=eff(x);continue}if(x.d>t)continue;const a=x.amt;r.flow+=eff(x);
switch(x.ty){case'income':r.inc+=a;r.cin[x.c]=(r.cin[x.c]||0n)+a;break;
case'expense':case'loan_int':r.exp+=a;r.cat[x.c]=(r.cat[x.c]||0n)+a;break;
case'refund':r.exp-=a;r.cat[x.c]=(r.cat[x.c]||0n)-a;break;
case'capital':r.cap+=a;break;case'draw':r.draw+=a;break;case'loan_in':r.lin+=a;break;case'loan_prin':r.lpr+=a;break;case'adjp':r.adj+=a;break;case'adjm':r.adj-=a}}
r.net=r.inc-r.exp;r.start=before;r.end=before+r.flow;return r}
const U=()=>S.active==='u',CYC=()=>!U()&&S.payday>1,PF=()=>S.profile||'owner',PN={person:'Perorangan',owner:'Perorangan dengan usaha',biz:'Bisnis'};let TH0=null;
