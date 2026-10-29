/* ============================================================
   FINARA · js/05-grafik.js
   GRAFIK: grafik garis/area SVG, tren, kartu mingguan & laju anggaran
   Dimuat berurutan (angka di nama berkas = urutan). Semua berkas
   berbagi satu lingkup global; lihat docs/PETA-KODE.md.
   ============================================================ */
/* ===== Grafik & kartu rekening: hanya tampilan, data dibaca lewat sum()/bal() yang sudah ada ===== */
const MN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],DN=['Min','Sen','Sel','Rab','Kam','Jum','Sab'],PAL=['#2f8f46','#e0a526','#2f7fd1','#d6498a','#8a5cd6','#d9822b','#0f8f96','#c23b2b'];
const num=v=>Number(v),dAdd=(s,n)=>{const[y,m,d]=s.split('-').map(Number);return ymd(new Date(y,m-1,d+n))};
const r1=v=>Math.round(v*10)/10,pc=v=>(Math.round(v*10)/10).toString().replace('.',',');
const shortRp=v=>{const n=Math.abs(num(v)),s=v<0n?'−':'';if(n>=1e15)return s+'999+ T';if(n>=1e12)return s+pc(n/1e12)+' T';if(n>=1e9)return s+pc(n/1e9)+' M';if(n>=1e6)return s+pc(n/1e6)+' jt';if(n>=1e3)return s+Math.round(n/1e3)+' rb';return s+Math.round(n)};
const mon=k=>{const n=new Date(),y=n.getFullYear(),m=n.getMonth(),o=[];for(let i=k-1;i>=0;i--){const a=new Date(y,m-i,1);o.push({f:ymd(a),t:ymd(new Date(a.getFullYear(),a.getMonth()+1,0)),l:MN[a.getMonth()]})}return o};
let CID=0;
const sm=P=>{let d='M'+P[0][0]+' '+P[0][1];for(let i=1;i<P.length;i++){const a=P[i-1],c=P[i],m=r1((a[0]+c[0])/2);d+='C'+m+' '+a[1]+' '+m+' '+c[1]+' '+c[0]+' '+c[1]}return d};
const tipg=(x,y,t)=>{const w=Math.round(t.length*6.1+18),bx=Math.max(2,Math.min(358-w,x-w/2));return{w,bx,by:y-34<2?y+10:y-34}};
function area(pts,o){o=o||{};const W=360,H=o.h||150,pl=16,pr=16,pt=36,pb=24,n=pts.length,id='g'+(++CID);
const vs=pts.map(p=>num(p.v));if(!n||vs.every(v=>v===0))return'<div class="empty ce">Belum ada data untuk grafik.</div>';
const mx=Math.max(...vs,0),mn=Math.min(...vs,0),rg=(mx-mn)||1,X=i=>n<2?W/2:pl+i*(W-pl-pr)/(n-1),Y=v=>pt+(1-(v-mn)/rg)*(H-pt-pb);
const P=vs.map((v,i)=>[r1(X(i)),r1(Y(v))]),d=sm(P),md=o.ma?sm(o.ma.map((v,i)=>[r1(X(i)),r1(Y(v))])):'';
const bt=H-pb,ai=o.peak?vs.indexOf(Math.max(...vs)):n-1,st=Math.ceil(n/6),step=n<2?W:(W-pl-pr)/(n-1);
const g=tipg(P[ai][0],P[ai][1],pts[ai].t);
const grid=[0,1,2].map(k=>{const y=r1(pt+k*(bt-pt)/2);return`<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" stroke="var(--ln)" stroke-width="1" stroke-dasharray="3 5"/>`}).join('');
const zero=mn<0?`<line x1="${pl}" x2="${W-pr}" y1="${r1(Y(0))}" y2="${r1(Y(0))}" stroke="var(--mu)" stroke-width="1" opacity=".5"/>`:'';
const lab=pts.map((p,i)=>(i%st===0||(i===n-1&&(n-1)%st>=st/2))?`<text class="ax" x="${P[i][0]}" y="${H-6}" text-anchor="middle">${p.l}</text>`:'').join('');
const hits=pts.map((p,i)=>`<rect class="hit" x="${r1(X(i)-step/2)}" y="0" width="${r1(step)}" height="${H}" data-x="${P[i][0]}" data-y="${P[i][1]}" data-t="${p.t}"/>`).join('');
return`<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria||'Grafik')}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--ac2);stop-opacity:.6"/><stop offset="1" style="stop-color:var(--ac2);stop-opacity:0"/></linearGradient></defs>${grid}${zero}<path d="${d}L${P[n-1][0]} ${bt}L${P[0][0]} ${bt}Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke="var(--ac)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${md?`<path d="${md}" fill="none" stroke="var(--ink)" stroke-width="2" stroke-dasharray="5 4" stroke-linecap="round" opacity=".7"/>`:''}${lab}<line class="tl" x1="${P[ai][0]}" x2="${P[ai][0]}" y1="${pt-4}" y2="${bt}" stroke="var(--ac)" stroke-width="1.5"/><circle class="tc" cx="${P[ai][0]}" cy="${P[ai][1]}" r="5"/><rect class="tb" x="${g.bx}" y="${g.by}" width="${g.w}" height="22" rx="8"/><text class="tt" x="${g.bx+g.w/2}" y="${g.by+15}" text-anchor="middle">${pts[ai].t}</text>${hits}</svg>`}
function tipSet(h){const s=h.ownerSVGElement;if(!s)return;const x=+h.dataset.x,y=+h.dataset.y,t=h.dataset.t,g=tipg(x,y,t),a=(c,o)=>{const e=s.querySelector(c);if(e)for(const k in o)e.setAttribute(k,o[k])};
a('.tl',{x1:x,x2:x});a('.tc',{cx:x,cy:y});a('.tb',{x:g.bx,y:g.by,width:g.w});a('.tt',{x:g.bx+g.w/2,y:g.by+15});const tt=s.querySelector('.tt');if(tt&&tt.textContent!==t)tt.textContent=t}
['pointerover','pointerdown'].forEach(ev=>document.addEventListener(ev,e=>{const h=e.target.closest&&e.target.closest('.hit');if(h)tipSet(h)}));
function weekCard(){const n=new Date(),mo=ymd(new Date(n.getFullYear(),n.getMonth(),n.getDate()-((n.getDay()+6)%7))),L=['S','S','R','K','J','S','M'],N=['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'],ti=(n.getDay()+6)%7,cu=[];let tc=0n,tp=0n;
for(let i=0;i<7;i++){const a=sum(dAdd(mo,i),dAdd(mo,i)).exp,b=sum(dAdd(mo,i-7),dAdd(mo,i-7)).exp;cu.push(a>0n?a:0n);tc+=a;tp+=b}
const mx=Math.max(1,...cu.map(num)),p=tp>0n?Number((tc-tp)*1000n/tp)/10:null,cls=p===null?'na':p>0?'up':'dn',tx=p===null?'Belum ada data minggu lalu':(p>0?'▲ ':p<0?'▼ ':'')+pc(Math.abs(p))+'% dari minggu lalu';
return`<div class="c wk"><div class="wk-l"><small>${U()?'Pengeluaran usaha':'Pengeluaran saya'}</small><b class="big">${rp(tc>0n?tc:0n)}</b><small class="dl ${cls}">${tx}</small></div><div class="wk-b" role="img" aria-label="Pengeluaran per hari minggu ini">${cu.map((v,i)=>`<span class="wb${i===ti?' on':''}" title="${N[i]}: ${rp(v)}"><u><i style="height:${Math.max(6,Math.round(num(v)/mx*100))}%"></i></u><em>${L[i]}</em></span>`).join('')}</div></div>`}
function buckets(p,f,t){const B=[];
if(p==='year'){const y=+f.slice(0,4);for(let m=0;m<12;m++)B.push({f:ymd(new Date(y,m,1)),t:ymd(new Date(y,m+1,0)),l:MN[m],tl:MN[m]+' '+y})}
else{let a=f,b=t;if(p==='day'){a=dAdd(t,-6);b=t}
const span=Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/864e5)+1;
if(span<=62){for(let i=0;i<span;i++){const d=dAdd(a,i),wd=new Date(d+'T00:00:00').getDay();B.push({f:d,t:d,l:span<=7?DN[wd]:String(+d.slice(8)),tl:(+d.slice(8))+' '+MN[+d.slice(5,7)-1]})}}
else{let y=+a.slice(0,4),m=+a.slice(5,7)-1;const ey=+b.slice(0,4),em=+b.slice(5,7)-1;if((ey-y)*12+em-m+1>60){const st=Math.ceil((ey-y+1)/60),p4=v=>String(v).padStart(4,'0');for(let yy=y;yy<=ey;yy+=st){const ye=Math.min(yy+st-1,ey),s0=p4(yy)+'-01-01',e0=p4(ye)+'-12-31';B.push({f:s0<a?a:s0,t:e0>b?b:e0,l:String(yy),tl:st>1?yy+'–'+ye:String(yy)})}}else while((y<ey||y===ey&&m<=em)&&B.length<120){const s=ymd(new Date(y,m,1)),e=ymd(new Date(y,m+1,0));B.push({f:s<a?a:s,t:e>b?b:e,l:MN[m],tl:MN[m]+' '+y});if(++m>11){m=0;y++}}}}
return B}
function periodLabel(p,f,t){return p==='day'?(f===today()?'Hari ini':fd(f)):p==='week'?fd(f)+' – '+fd(t):p==='month'?(f.slice(8)==='01'?MN[+f.slice(5,7)-1]+' '+f.slice(0,4):fd(f)+' – '+fd(t)):p==='year'?f.slice(0,4):fd(f)+' – '+fd(t)}
function expTrend(p,f,t,r){const bk=buckets(p,f,t),pts=bk.map(b=>{const e=sum(b.f,b.t).exp,v=e>0n?e:0n;return{l:b.l,v,t:b.tl+' · '+rp(v)}}),vs=pts.map(q=>num(q.v)),n=vs.length,daily=n>0&&bk[0].f===bk[0].t,w=n>=20?7:3,k=(w-1)/2;
const ma=n>=4&&vs.some(v=>v>0)?vs.map((_,i)=>{let s=0,c=0;for(let j=i-k;j<=i+k;j++)if(j>=0&&j<n){s+=vs[j];c++}return s/c}):null;
let tr='';if(ma){const mean=vs.reduce((a,b)=>a+b,0)/n,xm=(n-1)/2;let sx=0,sxy=0;vs.forEach((v,i)=>{sxy+=(i-xm)*(v-mean);sx+=(i-xm)*(i-xm)});const rel=mean&&sx?sxy/sx*(n-1)/mean:0;
tr=rel>.15?'<small class="dl up">▲ Tren pengeluaran naik</small>':rel<-.15?'<small class="dl dn">▼ Tren pengeluaran turun</small>':'<small class="dl na">● Tren pengeluaran stabil</small>'}
return`<div class="c an"><div class="an-h"><div><small>Pengeluaran</small><b class="big">${rp(r.exp>0n?0n-r.exp:0n)}</b>${tr}</div><span class="pill">${esc(periodLabel(p,f,t))}</span></div>${area(pts,{peak:true,h:215,ma:ma,aria:'Tren pengeluaran periode ini'})}${ma?`<div class="lgd"><span><i style="background:var(--ac)"></i>Pengeluaran</span><span><i class="dash"></i>Rata-rata ${w} ${daily?'hari':'bulan'}</span></div>`:''}</div>`}
const rdh=(m,i,e)=>`<span class="rl">${m}</span><span><i style="background:var(--pos)"></i>Pemasukan <b>${i}</b></span><span><i style="background:var(--neg)"></i>Pengeluaran <b>${e}</b></span>`;
function lineChart(ms){const W=360,H=170,pl=42,pr=14,pt=14,pb=24,n=ms.length;
if(!n||ms.every(m=>m.i===0n&&m.e===0n))return'<div class="empty ce">Belum ada data untuk grafik.</div>';
const mx=Math.max(1,...ms.flatMap(m=>[num(m.i),num(m.e)])),X=i=>n<2?W/2:pl+i*(W-pl-pr)/(n-1),Y=v=>pt+(1-v/mx)*(H-pt-pb),bt=H-pb,step=n<2?W:(W-pl-pr)/(n-1),L=n-1;
const PI=ms.map((m,i)=>[r1(X(i)),r1(Y(num(m.i)))]),PE=ms.map((m,i)=>[r1(X(i)),r1(Y(num(m.e)))]);
const grid=[0,1,2].map(q=>{const y=r1(pt+q*(bt-pt)/2),v=BigInt(Math.round(mx*(1-q/2)));return`<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" stroke="var(--ln)" stroke-dasharray="3 5"/><text class="ax" x="${pl-7}" y="${y+3}" text-anchor="end">${shortRp(v)}</text>`}).join('');
const dots=(P,c)=>P.map(q=>`<circle cx="${q[0]}" cy="${q[1]}" r="3" fill="var(--sf)" stroke="${c}" stroke-width="2"/>`).join('');
const lab=ms.map((m,i)=>`<text class="ax" x="${PI[i][0]}" y="${H-6}" text-anchor="middle">${m.l}</text>`).join('');
const hits=ms.map((m,i)=>`<rect class="hx" x="${r1(X(i)-step/2)}" y="0" width="${r1(step)}" height="${H}" data-x="${PI[i][0]}" data-y="${PI[i][1]},${PE[i][1]}" data-m="${m.l}" data-i="${rp(m.i)}" data-e="${rp(m.e)}"/>`).join('');
return`<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Garis pemasukan dan pengeluaran 6 bulan terakhir">${grid}${lab}<line class="tl" x1="${PI[L][0]}" x2="${PI[L][0]}" y1="${pt-4}" y2="${bt}" stroke="var(--mu)" stroke-width="1" stroke-dasharray="3 3"/><path d="${sm(PE)}" fill="none" stroke="var(--neg)" stroke-width="2.5" stroke-linecap="round"/><path d="${sm(PI)}" fill="none" stroke="var(--pos)" stroke-width="2.5" stroke-linecap="round"/>${dots(PE,'var(--neg)')}${dots(PI,'var(--pos)')}<circle class="tc0" cx="${PI[L][0]}" cy="${PI[L][1]}" r="5.5" fill="var(--pos)" stroke="var(--sf)" stroke-width="2"/><circle class="tc1" cx="${PE[L][0]}" cy="${PE[L][1]}" r="5.5" fill="var(--neg)" stroke="var(--sf)" stroke-width="2"/>${hits}</svg><div class="rd">${rdh(ms[L].l,rp(ms[L].i),rp(ms[L].e))}</div>`}
function tipSet2(h){const s=h.ownerSVGElement;if(!s)return;const x=h.dataset.x,y=h.dataset.y.split(','),a=(c,o)=>{const e=s.querySelector(c);if(e)for(const k in o)e.setAttribute(k,o[k])};a('.tl',{x1:x,x2:x});a('.tc0',{cx:x,cy:y[0]});a('.tc1',{cx:x,cy:y[1]});const rd=s.parentElement.querySelector('.rd');if(rd){const h2=rdh(h.dataset.m,h.dataset.i,h.dataset.e);if(rd.innerHTML!==h2)rd.innerHTML=h2}}
['pointerover','pointerdown'].forEach(ev=>document.addEventListener(ev,e=>{const h=e.target.closest&&e.target.closest('.hx');if(h)tipSet2(h)}));
function flowCard(){const ms=mon(6).map(m=>{const s=sum(m.f,m.t);return{l:m.l,i:s.inc,e:s.exp>0n?s.exp:0n}});return`<div class="c an"><div class="an-h"><div><small>Pemasukan vs pengeluaran</small><b class="shd2">6 bulan terakhir</b></div></div>${lineChart(ms)}</div>`}
function budPace(){const b=S.bud.filter(v=>v.w===S.active&&v.lim>0n);if(!b.length)return'';
const n=new Date(),y=n.getFullYear(),m=n.getMonth(),D=new Date(y,m+1,0).getDate(),dy=n.getDate(),ids=b.map(v=>v.c),lim=b.reduce((s,v)=>s+v.lim,0n)
const day=i=>{const d=ymd(new Date(y,m,i)),c=sum(d,d).cat;return ids.reduce((s,k)=>s+(c[k]||0n),0n)};
const cum=[];let tot=0n;for(let i=1;i<=dy;i++){tot+=day(i);cum.push(tot)}
const proj=tot*BigInt(D)/BigInt(dy),over=tot>lim,pOver=proj>lim,left=lim-tot,rem=D-dy+1;
const W=360,H=170,pl=42,pr=14,pt=16,pb=24,bt=H-pb,top=Math.max(num(lim),num(proj),num(tot),1)*1.08,X=i=>r1(pl+(i-1)*(W-pl-pr)/(D-1)),Y=v=>r1(pt+(1-v/top)*(bt-pt));
const A=cum.map((v,i)=>[X(i+1),Y(num(v))]),ly=Y(num(lim)),id='g'+(++CID);
const grid=[0,1,2].map(q=>{const yy=r1(pt+q*(bt-pt)/2);return`<line x1="${pl}" x2="${W-pr}" y1="${yy}" y2="${yy}" stroke="var(--ln)" stroke-dasharray="3 5"/><text class="ax" x="${pl-7}" y="${yy+3}" text-anchor="end">${shortRp(BigInt(Math.round(top*(1-q/2))))}</text>`}).join('');
const xl=[1,8,15,22,D].map(i=>`<text class="ax" x="${X(i)}" y="${H-6}" text-anchor="middle">${i}</text>`).join('');
const area=A.length>1?`<path d="${sm(A)}L${A[A.length-1][0]} ${bt}L${A[0][0]} ${bt}Z" fill="url(#${id})"/>`:'';
const line=A.length>1?`<path d="${sm(A)}" fill="none" stroke="${over?'var(--neg)':'var(--ac)'}" stroke-width="2.5" stroke-linecap="round"/>`:'';
const pj=dy<D?`<line x1="${A[A.length-1][0]}" y1="${A[A.length-1][1]}" x2="${X(D)}" y2="${Y(num(proj))}" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="2 4" stroke-linecap="round" opacity=".6"/>`:'';
const st=over?`<small class="dl up">▲ Melewati anggaran ${rp(-left)}</small>`:pOver?`<small class="dl up">▲ Proyeksi akhir bulan ${rp(proj)}, melewati batas</small>`:`<small class="dl dn">▼ Laju aman, proyeksi akhir bulan ${rp(proj)}</small>`;
const tip=!over&&left>0n?`<small>Sisa ${rp(left)}${rem>0?' · sekitar '+rp(left/BigInt(rem))+' per hari':''}</small>`:'';
return`<h3>Laju anggaran bulan ini</h3><div class="c an"><small>Pengeluaran kategori beranggaran</small><b class="big">${rp(tot)}</b>${st}${tip}<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Laju pengeluaran dibanding batas anggaran bulan ini"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:${over?'var(--neg)':'var(--ac2)'};stop-opacity:.45"/><stop offset="1" style="stop-color:${over?'var(--neg)':'var(--ac2)'};stop-opacity:0"/></linearGradient></defs>${grid}${xl}<line x1="${pl}" x2="${W-pr}" y1="${ly}" y2="${ly}" stroke="var(--neg)" stroke-width="1.5" stroke-dasharray="6 4"/><line x1="${X(1)}" y1="${Y(num(lim)/D)}" x2="${X(D)}" y2="${ly}" stroke="var(--mu)" stroke-width="1.5" stroke-dasharray="2 4" opacity=".8"/>${area}${line}${pj}<circle cx="${A[A.length-1][0]}" cy="${A[A.length-1][1]}" r="5" fill="var(--sf)" stroke="${over?'var(--neg)':'var(--ac)'}" stroke-width="2.5"/></svg><div class="lgd"><span><i style="background:${over?'var(--neg)':'var(--ac)'}"></i>Aktual</span><span><i class="dash" style="border-top-color:var(--mu)"></i>Laju ideal</span><span><i class="dash" style="border-top-color:var(--neg);opacity:1"></i>Batas ${shortRp(lim)}</span></div></div>`}
function ana(p,f,t,r){return`<div class="ana">${weekCard()}${expTrend(p,f,t,r)}${flowCard()}</div>`}
function trendBal(){const ms=mon(6),pts=ms.map(m=>{const v=sum(m.f,m.t).end;return{l:m.l,v,t:m.l+' · '+rp(v)}}),a=pts[4].v,b=pts[5].v,p=a!==0n?Number((b-a)*1000n/(a<0n?-a:a))/10:null,cls=p===null?'na':p>0?'dn':p<0?'up':'na',tx=p===null?'Tren 6 bulan terakhir':(p>0?'▲ ':p<0?'▼ ':'')+pc(Math.abs(p))+'% dari bulan lalu';
return`<h3>Tren saldo</h3><div class="c an"><small>Saldo akhir tiap bulan</small><small class="dl ${cls}">${tx}</small>${area(pts,{aria:'Tren saldo 6 bulan terakhir'})}</div>`}
