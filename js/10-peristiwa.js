/* ============================================================
   FINARA · js/10-peristiwa.js
   PERISTIWA & FORMAT: pendengar klik/geser, terbilang, format nominal, penyesuaian ukuran huruf
   Dimuat berurutan (angka di nama berkas = urutan). Semua berkas
   berbagi satu lingkup global; lihat docs/PETA-KODE.md.
   ============================================================ */
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const i=b.dataset.a.indexOf(':'),a=i<0?b.dataset.a:b.dataset.a.slice(0,i);act[a]&&act[a](i<0?'':b.dataset.a.slice(i+1))});
document.addEventListener('click',e=>{const h=e.target.closest('.hint');if(!h)return;h.classList.toggle('fold');const k=hash(h.textContent),i=FOLD.indexOf(k);if(h.classList.contains('fold')){if(i<0)FOLD.push(k)}else if(i>=0)FOLD.splice(i,1);try{localStorage.setItem('bukukas.fold',JSON.stringify(FOLD))}catch(x){}});
let SWX=0,SWE=null,SWD=0,SWQ=0;
document.addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest('.tx[data-sw]');if(t){SWE=t;SWX=e.clientX;SWD=0}});
document.addEventListener('pointermove',e=>{if(!SWE)return;const d=e.clientX-SWX;if(d<-10||SWD){SWD=Math.max(-160,Math.min(0,d));SWE.classList.add('sw');SWE.style.transform='translateX('+SWD+'px)'}});
const swEnd=e=>{if(!SWE)return;const t=SWE,d=SWD;SWE=null;SWD=0;if(!d)return;SWQ=Date.now();if(d<-90&&e.type==='pointerup'){act.voidq(t.dataset.sw);return}t.style.transform='';t.classList.remove('sw')};
document.addEventListener('pointerup',swEnd);document.addEventListener('pointercancel',swEnd);
document.addEventListener('click',e=>{if(Date.now()-SWQ<400){e.stopImmediatePropagation();e.preventDefault()}},true);
$('#sh').addEventListener('click',e=>{if(e.target.id==='sh')close()});
function tb(n){n=BigInt(n);if(n===0n)return'Nol rupiah';
const w=['','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh','sebelas'],
sc=['','ribu','juta','miliar','triliun','kuadriliun','kuintiliun','sekstiliun','septiliun','oktiliun','noniliun','desiliun'];
const f=g=>g<12?w[g]:g<20?w[g-10]+' belas':g<100?w[Math.floor(g/10)]+' puluh'+(g%10?' '+w[g%10]:''):g<200?'seratus'+(g>100?' '+f(g-100):''):w[Math.floor(g/100)]+' ratus'+(g%100?' '+f(g%100):'');
const d=n.toString(),gs=[];for(let e=d.length;e>0;e-=3)gs.unshift(d.slice(Math.max(0,e-3),e));
const out=[];gs.forEach((x,k)=>{const g=Number(x),i=gs.length-1-k;if(!g)return;out.push(i===1&&g===1?'seribu':f(g)+(sc[i]?' '+sc[i]:''))});
const t=out.join(' ');return t[0].toUpperCase()+t.slice(1)+' rupiah'}
function fmtNum(el){const pos=el.selectionStart,d=(el.value.slice(0,pos).match(/\d/g)||[]).length,g=el.value.replace(/\D/g,'').replace(/^0+(?=\d)/,'').slice(0,MAXD+1),v=g.replace(/\B(?=(\d{3})+(?!\d))/g,'.');
el.value=v;if(document.activeElement===el){let i=0,c=0;while(i<v.length&&c<d){if(/\d/.test(v[i]))c++;i++}try{el.setSelectionRange(i,i)}catch(e){}}
const o=el.nextElementSibling;if(o&&o.classList.contains('say'))o.textContent=!g?'':g.length>MAXD?'Nominal terlalu besar':tb(BigInt(g))}
function fmtInit(){document.querySelectorAll('#shc input[inputmode="numeric"]:not([data-plain])').forEach(el=>{if(!el.nextElementSibling||!el.nextElementSibling.classList.contains('say'))el.insertAdjacentHTML('afterend','<small class="say" aria-live="polite"></small>');fmtNum(el)})}
function srcsum(){const r=[...document.querySelectorAll('#shc .sa')],o=$('#ao');if(!o)return;o.readOnly=r.length>0;if(!r.length)return;const t=r.reduce((t,e)=>t+BigInt(e.value.replace(/\D/g,'').slice(0,MAXD+1)||'0'),0n);o.value=t?String(t):'';fmtNum(o)}
document.addEventListener('input',e=>{const el=e.target;if(el.matches&&el.matches('#shc input[inputmode="numeric"]:not([data-plain])'))fmtNum(el);if(el.classList&&el.classList.contains('sa'))srcsum()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#sh').classList.contains('on'))close()});
function fit(el,max){el.style.fontSize='';el.style.whiteSpace='';el.style.wordBreak='';if(!(max>0)||!el.getClientRects().length)return;let fs=parseFloat(getComputedStyle(el).fontSize);while(fs>9&&el.scrollWidth>max+.5){fs-=Math.max(.5,fs*.04);el.style.fontSize=fs+'px'}if(el.scrollWidth>max+.5){el.style.whiteSpace='normal';el.style.wordBreak='break-all'}}
function fitAll(){document.querySelectorAll('.hero b,.hmini strong,.g2 b,.cards b,.big').forEach(e=>fit(e,e.clientWidth));
document.querySelectorAll('.tx>span:last-child').forEach(e=>fit(e,e.parentElement.clientWidth*.8));
document.querySelectorAll('td+td').forEach(e=>{const t=e.closest('table'),pe=t.parentElement,ps=getComputedStyle(pe),iw=pe.clientWidth-parseFloat(ps.paddingLeft)-parseFloat(ps.paddingRight);fit(e,Math.min(t.clientWidth,iw)*(t.rows[0].cells.length>2?.34:.55))});
document.querySelectorAll('.rep-b b').forEach(e=>fit(e,e.parentElement.clientWidth*.6))}
let fq;const sched=()=>{cancelAnimationFrame(fq);fq=requestAnimationFrame(fitAll)};
new MutationObserver(sched).observe(document.body,{childList:true,subtree:true});
addEventListener('resize',sched);addEventListener('orientationchange',sched);if(document.fonts)document.fonts.ready.then(sched);
