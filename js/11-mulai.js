/* ============================================================
   FINARA · js/11-mulai.js
   MULAI: splash, penyempurnaan akhir, render pertama, service worker
   Dimuat berurutan (angka di nama berkas = urutan). Semua berkas
   berbagi satu lingkup global; lihat docs/PETA-KODE.md.
   ============================================================ */
(()=>{const e=$('#spl');if(!e)return;let k=0;try{k=sessionStorage.getItem('fsp');sessionStorage.setItem('fsp','1')}catch(x){}if(k){e.remove();return}setTimeout(()=>{e.classList.add('x');setTimeout(()=>e.remove(),450)},900)})();
document.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.isComposing)return;const t=e.target;if(!t.matches||!t.matches('#shc input:not([type=file]):not([type=search])'))return;const b=document.querySelector('#shc .row .btn:not(.ghost)');if(b){e.preventDefault();b.click()}});
new MutationObserver(()=>{const e=$('#shc #err');if(e&&e.textContent)e.scrollIntoView({block:'center',behavior:'smooth'})}).observe($('#shc'),{childList:true,subtree:true,characterData:true});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('[role=button]:not(button)')){e.preventDefault();e.target.click()}});
// 1.5.0: pengguna baru langsung memakai profil Perorangan (tanpa pemilih profil); profil bisa diganti di Lainnya.
if(!S.profile){if(S.tx.length||S.acc.some(a=>a.open>0n))S.profile='owner';else{S.profile='person';save()}}
render();
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))addEventListener('load',()=>{const had=!!navigator.serviceWorker.controller;navigator.serviceWorker.register('sw.js').catch(()=>{});navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!had)return;const e=$('#toast');e.textContent='Versi baru Finara siap. ';const b=document.createElement('button');b.textContent='Muat ulang';b.style.cssText='margin-left:8px;border:0;background:none;color:#a6ee6b;font:inherit;font-weight:800;text-decoration:underline;cursor:pointer';b.onclick=()=>location.reload();e.append(b);e.style.display='block';e.style.pointerEvents='auto';clearTimeout(TT)})});
