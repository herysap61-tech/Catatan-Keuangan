/* ============================================================
   FINARA · js/04-komponen.js
   KOMPONEN: ikon, avatar kategori, daftar transaksi, anggaran
   Dimuat berurutan (angka di nama berkas = urutan). Semua berkas
   berbagi satu lingkup global; lihat docs/PETA-KODE.md.
   ============================================================ */
const sv=p=>'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';
const IC={home:sv('<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),tx:sv('<path d="M7 7h13M16 3l4 4-4 4M17 17H4M8 13l-4 4 4 4"/>'),rep:sv('<path d="M5 21V10M12 21V4M19 21v-7"/>'),acc:sv('<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z"/><circle cx="17" cy="14.5" r="1"/>'),more:sv('<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>')};
const DOTS='<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>';
const CI=[[/makan|minum|food/i,'<path d="M6 3v7a2 2 0 0 0 4 0V3M8 3v18M17 3c-2 2-3 5-3 8h3v10"/>','#d9822b'],
[/transport|bensin|parkir|kendara/i,'<path d="M5 16V9l2-4h10l2 4v7M3 16h18M7 19v-3M17 19v-3"/>','#2f7fd1'],
[/tagihan|listrik|pdam|pulsa|internet/i,'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>','#8a5cd6'],
[/belanja|beli|barang/i,'<path d="M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0"/>','#d6498a'],
[/gaji|penjualan|pendapatan|omzet/i,'<path d="M3 7h18v12H3zM3 11h18M12 14v1"/>','#1f9a4f'],
[/operasional|biaya|sewa/i,'<path d="M14 6l4 4-9 9H5v-4zM12 8l4 4"/>','#0f8f96']];
const cic=id=>{const n=nm(S.cat,id),m=CI.find(v=>v[0].test(n)),c=m?m[2]:'#6b7c70';return`<i class="av" style="background:color-mix(in srgb,${c} 16%,var(--sf));color:${c}">${sv(m?m[1]:DOTS)}</i>`};
const avi=(x,s)=>x.c?cic(x.c):`<i class="av ${s}">${x.ty==='transfer'?'⇄':T[x.ty].s>0?'↓':'↑'}</i>`;
function dlab(d){const t=today();if(d===t)return'Hari ini';if(d===dAdd(t,-1))return'Kemarin';const w=new Date(d+'T00:00:00');return DN[w.getDay()]+', '+w.getDate()+' '+MN[w.getMonth()]+(d.slice(0,4)!==t.slice(0,4)?' '+d.slice(0,4):'')}
function list(a,flt){if(!a.length)return listRows(a,flt);const g=[];for(const x of a){const l=g[g.length-1];if(l&&l.d===x.d)l.r.push(x);else g.push({d:x.d,r:[x]})}
return g.map(h=>{let n=0n;for(const x of h.r)if(x.st==='ok')n+=eff(x);return`<div class="dh"><span>${dlab(h.d)}</span>${n?`<span class="${n<0n?'neg':'pos'}">${n>0n?'+':''}${rp(n)}</span>`:''}</div>`+listRows(h.r,false)}).join('')}
function listRows(a,flt){if(!a.length&&flt)return'<div class="empty">Tidak ada transaksi yang cocok dengan pencarian atau filter.</div>';if(!a.length)return U()?'<div class="empty">Belum ada transaksi. Mulai dengan mengisi saldo awal: buka tab Rekening, ketuk rekening (mis. Kas usaha), lalu Ubah nama dan saldo awal. Setelah itu ketuk + untuk mencatat transaksi pertama.<div class="row" style="justify-content:center"><button class="btn" data-a="add:expense">Catat transaksi pertama</button></div></div>':'<div class="empty">Belum ada transaksi. Catat pengeluaran pertama Anda, dan sisa jatah harian di Beranda langsung berubah.<div class="row" style="justify-content:center"><button class="btn" data-a="add:expense">Catat transaksi pertama</button></div></div>';
return a.map(x=>{const t=T[x.ty],v=x.st!=='ok',s=x.ty==='transfer'?'':t.s>0?'pos':'neg';
const sub=x.ty==='transfer'?nm(S.acc,x.a)+' → '+nm(S.acc,x.to):nm(S.acc,x.a);
return`<${v?'div':'button'} class="tx${v?' v':''}" ${v?'':'data-a="edit:'+esc(x.id)+'"'}${v||x.pay?'':' data-sw="'+esc(x.id)+'"'}>${avi(x,s)}<span class="gr">${esc(t.l)}${x.c?' · '+esc(nm(S.cat,x.c)):''}<small>${fd(x.d)} · ${esc(sub)}${x.n?' · '+esc(x.n):''}${v?' · dibatalkan':''}</small></span><span class="${s}">${t.s<0?'−':t.s>0?'+':''}${rp(x.amt)}</span></${v?'div':'button'}>`}).join('')}
function bud(){const[f,t]=range('month'),r=sum(f,t),b=S.bud.filter(v=>v.w===S.active);
if(!b.length)return'<div class="c"><small>Anggaran belum diatur. Buka Lainnya › Anggaran.</small></div>';
return'<h3>Anggaran bulan ini</h3><div class="c">'+b.map(v=>{const u=r.cat[v.c]||0n,p=u<=0n?0:u>=v.lim?100:Number(u*100n/v.lim);
return`<div>${esc(nm(S.cat,v.c))}<small>${rp(u)} dari ${rp(v.lim)}${u>v.lim?' · melewati batas bulan ini':p>=80?' · hampir habis':''}</small><div class="bar"><i class="${u>v.lim?'over':p>=80?'warn':''}" style="width:${p}%"></i></div></div>`}).join('')+'</div>'}
