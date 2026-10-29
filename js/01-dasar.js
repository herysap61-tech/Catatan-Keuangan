/* ============================================================
   FINARA · js/01-dasar.js
   DASAR: konstanta, pemformat angka/tanggal/rupiah, escape HTML
   Dimuat berurutan (angka di nama berkas = urutan). Semua berkas
   berbagi satu lingkup global; lihat docs/PETA-KODE.md.
   ============================================================ */
const $=s=>document.querySelector(s),K='bukukas.v1',MAXD=36;
const BLN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const tglId=s=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');return m?(+m[3])+' '+BLN[+m[2]-1]+' '+m[1]:'tanggal tidak tercatat'}; // isi FEEDBACK_URL dengan tautan GitHub Issues agar menu Kirim masukan muncul
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const grp=b=>b.toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const rp=n=>{n=BigInt(n);return(n<0n?'−':'')+'Rp'+grp(n<0n?-n:n)};
const B=v=>typeof v==='bigint'?v:typeof v==='number'?(isFinite(v)?BigInt(Math.round(v)):0n):/^-?\d+$/.test(String(v))?BigInt(v):0n;
const NB=ds=>ds.length>MAXD?-1n:BigInt(ds||'0');
const J=o=>JSON.stringify(o,(k,v)=>typeof v==='bigint'?v.toString():v);
const pad=n=>String(n).padStart(2,'0'),ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>ymd(new Date()),fd=s=>s.split('-').reverse().join('/');
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36);
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16)};
