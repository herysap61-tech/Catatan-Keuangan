/* ============================================================
   FINARA · js/07-render-formulir.js
   RENDER & FORMULIR: render(), jendela sheet, konfirmasi, formulir transaksi
   Dimuat berurutan (angka di nama berkas = urutan). Semua berkas
   berbagi satu lingkup global; lihat docs/PETA-KODE.md.
   ============================================================ */
function render(){applyProfile();runRec();document.body.dataset.mode=S.active;
$('#seg').innerHTML=[['p','Pribadi'],['u','Usaha']].filter(v=>PF()==='owner'||(PF()==='person')===(v[0]==='p')).map(v=>`<button class="${S.active===v[0]?'on':''}" data-a="mode:${v[0]}">${v[1]}</button>`).join('');
$('#nav').innerHTML=[['home',IC.home,'Beranda'],['tx',IC.tx,'Transaksi'],['rep',IC.rep,'Laporan'],['acc',IC.acc,'Rekening'],['more',IC.more,'Lainnya']].map(v=>`<button class="${tab===v[0]?'on':''}" data-a="tab:${v[0]}"${tab===v[0]?' aria-current="page"':''}><b>${v[1]}</b><span>${v[2]}</span></button>`).join('');
$('#m').innerHTML={home:vHome,tx:vTx,rep:vRep,acc:vAcc,more:vMore}[tab]();applyHint();
const q=$('#q');if(q)q.oninput=e=>{Q.q=e.target.value;const p=e.target.selectionStart;render();const n=$('#q');n.focus();n.setSelectionRange(p,p)};
[['qa','ac'],['qg','cg'],['qf','df'],['qd','dt']].forEach(([i,k])=>{const e=$('#'+i);if(e)e.onchange=()=>{Q[k]=e.value;render()}});
const qt=$('#qt');if(qt)qt.onchange=e=>{Q.ty=e.target.value;render()};
['rf','rt'].forEach(i=>{const e=$('#'+i);if(e)e.onchange=()=>{const cl=v=>v<'1900-01-01'?'1900-01-01':v>'2100-12-31'?'2100-12-31':v;R.f=cl($('#rf').value||R.f);R.t=cl($('#rt').value||R.t);render()}})}
let LASTF=null;const BG=['.rail','#m','.fab'];
function sheet(h){if(!$('#sh').classList.contains('on'))LASTF=document.activeElement;$('#shc').innerHTML='<button class="hb hs" data-a="hint" aria-label="Tampilkan atau sembunyikan bantuan">?</button>'+h;$('#sh').classList.add('on');document.body.classList.add('lock');$('#shc').scrollTop=0;fmtInit();applyHint();BG.forEach(s=>{const e=$(s);if(e)e.inert=true});$('#shc').focus({preventScroll:true})}
const close=()=>{$('#sh').classList.remove('on');document.body.classList.remove('lock');BG.forEach(s=>{const e=$(s);if(e)e.inert=false});if(LASTF&&LASTF.focus&&document.contains(LASTF))try{LASTF.focus({preventScroll:true})}catch(e){}LASTF=null};
function ask(msg,a,p){sheet(`<h2>Konfirmasi</h2><p>${msg}</p><div class="row"><button class="btn" data-a="${a}:${p||''}">Ya, lanjutkan</button><button class="btn ghost" data-a="close">Kembali</button></div>`)}
const opt=(v,l,s)=>`<option value="${v}" ${v===s?'selected':''}>${esc(l)}</option>`;
function txForm(id,ty0){const x=id?S.tx.find(v=>v.id===id):null;FM={id};const ty=x?x.ty:ty0||'expense';
sheet(`<h2>${x?'Ubah':ty==='transfer'?'Transfer antar rekening':'Catat transaksi'}</h2>${x?'<small class="hint">Perubahan dihitung ulang ke saldo dan laporan, dan tercatat di log. Pakai Batalkan transaksi jika ingin mengeluarkannya dari perhitungan.</small>':''}
${x?'':`<div class="row chips" id="tq" role="group" aria-label="Jenis cepat">${['expense','income','transfer'].map(k=>`<button type="button" class="chip" data-a="fty:${k}">${T[k].l}</button>`).join('')}</div>`}<label>Jenis<select id="fty">${Object.keys(T).filter(k=>!T[k].only||U()||k===ty).map(k=>opt(k,T[k].l,ty)).join('')}</select></label>
<small id="th" class="hint"></small><label>Tanggal<input type="date" id="fd" value="${x?x.d:today()}"></label><small class="hint">Laporan memakai tanggal ini, bukan waktu Anda mengetik.</small>
<label>Nominal (Rp)<input id="fa" inputmode="numeric" placeholder="0" value="${x?x.amt:''}"></label><div class="row chips qk" role="group" aria-label="Tambah nominal cepat">${[10000,50000,100000,500000].map(v=>`<button type="button" class="chip" data-a="qamt:${v}">+${shortRp(BigInt(v))}</button>`).join('')}<button type="button" class="chip" data-a="qamt:clr">Hapus</button></div>
<label><span id="lac">Rekening</span><select id="fac">${accs().map(a=>opt(a.id,a.name,x?x.a:LAST.a)).join('')}</select></label>
<label id="lto">Ke rekening (tujuan)<select id="fto"></select></label>
<label id="lc">Kategori<select id="fc"></select></label>
<datalist id="nl">${NL()}</datalist><label>Catatan<input id="fn" list="nl" autocomplete="off" maxlength="120" value="${esc(x?x.n:'')}"></label>${x?(ADV&&x.st==='ok'&&jr(x)?`<small>Jurnal: debit ${esc(lname(jr(x)[0]))}, kredit ${esc(lname(jr(x)[1]))}</small>`:''):`<label>Ulangi<select id="fr"><option value="">Tidak berulang</option><option value="week">Setiap minggu</option><option value="month">Setiap bulan</option><option value="year">Setiap tahun</option></select><small class="hint">Transaksi berikutnya dicatat otomatis saat aplikasi dibuka.</small></label>`}<p id="err" class="neg"></p>
<div class="row"><button class="btn" data-a="save">Simpan</button>${x?'<button class="btn ghost" data-a="void">Batalkan transaksi</button>':''}<button class="btn ghost" data-a="close">Tutup</button></div>`);
const fx=()=>{const t=T[$('#fty').value];document.querySelectorAll('#tq .chip').forEach(c=>c.classList.toggle('on',c.dataset.a==='fty:'+$('#fty').value));$('#th').textContent=(ADV?TH[$('#fty').value]:TH[$('#fty').value].replace(/\s*Jurnal:[^.]*\./,''))+($('#fty').value==='transfer'&&accs().length<2?' Anda butuh minimal dua rekening; tambah di tab Rekening.':'');applyFold();$('#lto').style.display=$('#fty').value==='transfer'?'block':'none';$('#lac').textContent=$('#fty').value==='transfer'?'Dari rekening':'Rekening';
$('#lc').style.display=t.cat?'block':'none';$('#fc').innerHTML=t.cat?cats(t.cat).map(c=>opt(c.id,c.name,x?x.c:LAST.c)).join(''):''};
const sy=()=>{const f=$('#fac').value,cur=$('#fto').value||(x&&x.to)||'',o=accs().filter(a=>a.id!==f);$('#fto').innerHTML=o.map(a=>opt(a.id,a.name,o.some(v=>v.id===cur)?cur:o[0].id)).join('')};
$('#fty').onchange=()=>{fx();sy()};$('#fac').onchange=sy;fx();sy();if(x&&x.pay)$('#fty').disabled=true;if(!x&&matchMedia('(hover:hover)').matches)setTimeout(()=>{const f=$('#fa');f&&f.focus({preventScroll:true})},60)}
