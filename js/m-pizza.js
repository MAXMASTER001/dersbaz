'use strict';
/* =========================================================
   Kesir Pizzacısı — kesirleri modelleme, denk kesirler,
   karşılaştırma (ilkokul 3–4)
   ========================================================= */
const MPizza = (()=>{
  const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  const CUSTOMERS=['🧒','👧','👦','👩','👨','👵','👴','🧑‍🦱','👩‍🦰','🐻','🦊','🐱','🐼','🐸'];
  const NAMES=['Ela','Kerem','Zeynep','Arda','Defne','Yusuf','Nil','Emir','Mira','Ayaz','Bulut','Duru'];
  let S=null,tm=null;
  const gcd=(a,b)=>b?gcd(b,a%b):a;

  function mount(app){
    const best=(Store.profile().games.pizza||{}).best||0;
    app.innerHTML=`<section class="screen pizza">
      <div class="pz-intro panel">
        <div class="pz-big">🍕</div>
        <div><h1 class="screen-title" style="margin:0">Kesir Pizzacısı</h1>
          <p class="sub" style="margin:6px 0 0">Müşteriler kesirle sipariş veriyor. Dilimlere dokunarak malzeme koy, siparişi zamanında teslim et!
          İlerledikçe <b>denk kesir</b> siparişleri ve <b>"hangisi daha çok?"</b> soruları gelir.</p>
          <p style="color:var(--gold);font-weight:900">🏆 Rekor: ${best} 🪙</p>
          <button class="btn btn-big btn-good" id="pzgo">Dükkânı Aç 🛎️</button></div>
      </div>
    </section>`;
    $('#pzgo').onclick=()=>{FX.sfx.pop();start(app);};
  }
  function start(app){
    S={app,round:0,coins:0,served:0,lives:3,order:null,sel:new Set(),locked:false};
    app.innerHTML=`<section class="screen pizza">
      <div class="q-hud" style="grid-template-columns:1fr auto">
        <div><h1 class="screen-title" style="font-size:28px;margin:0">🍕 Kesir Pizzacısı</h1><div class="muted" id="pzserved" style="font-weight:800"></div></div>
        <div class="qh-right"><div class="lives" id="pzlives"></div><div class="score-box"><span>KASA</span><b id="pzcoins">0 🪙</b></div></div>
      </div>
      <div class="pz-stage panel" id="pzstage"></div>
    </section>`;
    next();
  }
  function hud(){
    $('#pzlives').innerHTML=[0,1,2].map(i=>`<span class="heart ${i>=S.lives?'lost':''}">❤️</span>`).join('');
    $('#pzcoins').textContent=S.coins+' 🪙';
    $('#pzserved').textContent=`Teslim edilen sipariş: ${S.served}`;
  }
  function makeOrder(){
    const r=S.round;
    if(r<3){const d=R(2,4);return {type:'build',n:R(1,d-1)||1,d,slices:d};}
    if(r<7){const d=[3,4,5,6,8][R(0,4)];return {type:'build',n:R(1,d-1),d,slices:d};}
    const t=['build','equiv','equiv','compare','compare'][R(0,4)];
    if(t==='build'){const d=[5,6,8,10,12][R(0,4)];return {type:'build',n:R(1,d),d,slices:d};}
    if(t==='equiv'){
      const d=[2,3,4][R(0,2)],k=[2,3,4][R(0,2)];let n=R(1,d-1);
      if(gcd(n,d)>1) n=1;
      return {type:'equiv',n,d,slices:d*k};
    }
    // karşılaştırma
    let a,b;
    do{a={n:R(1,7),d:R(2,8)};b={n:R(1,7),d:R(2,8)};}while(a.n>=a.d||b.n>=b.d||(a.n===b.n&&a.d===b.d));
    if(Math.random()<.2){const k=R(2,3);b={n:a.n*k,d:a.d*k};if(b.d>12) b={n:a.n,d:a.d};}
    return {type:'compare',a,b};
  }
  function frac(n,d){return MathX.format(n+'/'+d);}
  function next(){
    if(!S) return;
    hud();
    S.order=makeOrder();S.sel=new Set();S.locked=false;
    const o=S.order;
    const who=CUSTOMERS[R(0,CUSTOMERS.length-1)],name=NAMES[R(0,NAMES.length-1)];
    const patience=Math.max(12,26-S.round);
    S.patience=patience;S.left=patience;
    const st=$('#pzstage');
    if(o.type==='compare'){
      st.innerHTML=`<div class="pz-customer"><div class="pz-face" id="pzface">${who}</div>
          <div class="pz-bubble"><b>${name}:</b> İki pizzadan <b>daha çok</b> olanı istiyorum! Hangisinde daha fazla pizza var?</div></div>
        <div class="pz-patience"><div id="pzbar"></div></div>
        <div class="pz-compare">
          <button class="pz-pick" data-p="a">${pizzaSVG(o.a.d,new Set([...Array(o.a.n).keys()]),false)}<div class="pz-label">${frac(o.a.n,o.a.d)}</div></button>
          <button class="btn btn-ghost pz-eq" data-p="eq">= Eşit</button>
          <button class="pz-pick" data-p="b">${pizzaSVG(o.b.d,new Set([...Array(o.b.n).keys()]),false)}<div class="pz-label">${frac(o.b.n,o.b.d)}</div></button>
        </div>`;
      $$('[data-p]',st).forEach(b=>b.onclick=()=>judgeCompare(b.dataset.p));
    } else {
      const ask=o.type==='equiv'?`<b>${name}:</b> Bana ${frac(o.n,o.d)} pizza lütfen! <span class="muted">(Bu pizza ${o.slices} dilime bölünmüş, dikkat!)</span>`
        :`<b>${name}:</b> Bana ${o.n===o.d?'<b>bütün</b> bir pizza ('+frac(o.n,o.d)+')':frac(o.n,o.d)+' pizza'} lütfen!`;
      st.innerHTML=`<div class="pz-customer"><div class="pz-face" id="pzface">${who}</div><div class="pz-bubble">${ask}</div></div>
        <div class="pz-patience"><div id="pzbar"></div></div>
        <div class="pz-work">
          <div class="pz-board" id="pzboard">${pizzaSVG(o.slices,S.sel,true)}</div>
          <div class="pz-side">
            <div class="pz-count">Hazırlanan: <b id="pzcur">${MathX.format('0/'+o.slices)}</b></div>
            <button class="btn btn-big btn-good" id="pzsend">Teslim Et 🛵</button>
            <button class="btn btn-ghost" id="pzclear">🧽 Temizle</button>
            <p class="muted" style="font-size:13px;font-weight:700">Dilimlere dokunarak sos ve malzeme ekle. Tekrar dokunursan kaldırırsın.</p>
          </div>
        </div>`;
      bindSlices();
      $('#pzsend').onclick=judgeBuild;
      $('#pzclear').onclick=()=>{S.sel.clear();redraw();FX.sfx.down();};
    }
    clearInterval(tm);
    tm=setInterval(()=>{
      if(!S||S.locked) return;
      S.left-=.1;const bar=$('#pzbar');if(!bar) return;
      const k=Math.max(0,S.left/S.patience);bar.style.width=(k*100)+'%';
      bar.style.background=k>.5?'#22c55e':k>.25?'#f59e0b':'#ef4444';
      if(k<.25) $('#pzface')?.classList.add('angry');
      if(S.left<=0) fail('Müşteri beklemekten sıkıldı ve gitti! 😤');
    },100);
  }
  function pizzaSVG(d,sel,interactive){
    let s=`<svg viewBox="0 0 220 220" class="pz-svg"><circle cx="110" cy="110" r="104" fill="#b45309"/><circle cx="110" cy="110" r="94" fill="#fde68a"/>`;
    for(let i=0;i<d;i++){
      const a0=-Math.PI/2+i*2*Math.PI/d,a1=a0+2*Math.PI/d;
      const on=sel.has(i);
      const path=d===1?'M110 16 A94 94 0 1 1 109.9 16Z':MathX.pieSlice(110,110,94,a0,a1);
      s+=`<g class="slice ${on?'on':''}" data-i="${i}" ${interactive?'role="button" tabindex="0"':''}><path d="${path}" fill="${on?'#ef4444':'#fef3c7'}" stroke="#92400e" stroke-width="2.5"/>`;
      if(on){
        const am=(a0+a1)/2;
        const dots=d<=4?3:d<=8?2:1;
        for(let k=0;k<dots;k++){const rr=30+k*22,aa=am+(k%2?.12:-.12)*(8/d);s+=`<circle cx="${(110+Math.cos(aa)*rr).toFixed(1)}" cy="${(110+Math.sin(aa)*rr).toFixed(1)}" r="${d>8?6:8}" fill="#991b1b"/><circle cx="${(110+Math.cos(aa)*rr-2).toFixed(1)}" cy="${(110+Math.sin(aa)*rr-2).toFixed(1)}" r="2" fill="#fca5a5"/>`;}
        s+=`<circle cx="${(110+Math.cos(am+.25)*60).toFixed(1)}" cy="${(110+Math.sin(am+.25)*60).toFixed(1)}" r="4" fill="#22c55e"/>`;
      }
      s+='</g>';
    }
    return s+'</svg>';
  }
  function bindSlices(){
    $$('#pzboard .slice').forEach(g=>{
      const tog=()=>{if(S.locked) return;const i=+g.dataset.i;S.sel.has(i)?S.sel.delete(i):S.sel.add(i);S.sel.has(i)?FX.sfx.pop():FX.sfx.down();redraw();};
      g.onclick=tog;g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tog();}};
    });
  }
  function redraw(){
    $('#pzboard').innerHTML=pizzaSVG(S.order.slices,S.sel,true);bindSlices();
    $('#pzcur').innerHTML=MathX.format(S.sel.size+'/'+S.order.slices);
  }
  function judgeBuild(){
    if(S.locked) return;
    const o=S.order,k=S.sel.size;
    const ok=k*o.d===o.n*o.slices;
    if(ok) win(o.type==='equiv'?`Harika! ${MathX.format(k+'/'+o.slices)} = ${frac(o.n,o.d)} — denk kesirler!`:`Tam ${frac(o.n,o.d)} pizza! Afiyet olsun!`);
    else fail(`Sipariş ${frac(o.n,o.d)} idi, sen ${MathX.format(k+'/'+o.slices)} hazırladın.`+(o.type==='equiv'?` Doğrusu ${o.n*o.slices/o.d} dilimdi.`:''));
  }
  function judgeCompare(p){
    if(S.locked) return;
    const {a,b}=S.order;const va=a.n/a.d,vb=b.n/b.d;
    const right=Math.abs(va-vb)<1e-9?'eq':va>vb?'a':'b';
    const sym=right==='eq'?'=':right==='a'?'>':'<';
    const txt=`${frac(a.n,a.d)} ${sym} ${frac(b.n,b.d)}`;
    if(p===right) win('Doğru! '+txt);
    else fail('Olmadı: '+txt);
  }
  function win(msg){
    S.locked=true;clearInterval(tm);
    const bonus=Math.round(Math.max(0,S.left));
    const gain=10+bonus;S.coins+=gain;S.served++;S.round++;
    $('#pzface').textContent='😋';$('#pzface').classList.add('happy');
    FX.sfx.correct();FX.celebrate($('#pzstage'));
    const c=FX.centerOf($('#pzstage'));FX.floatText(c.x,c.y-60,'+'+gain+' 🪙','#fbbf24');
    toastMsg('✅ '+msg,'good');hud();
    if(S.served%5===0) setTimeout(()=>FX.banner(S.served+' SİPARİŞ!','gold','small'),300);
    setTimeout(next,1500);
  }
  function fail(msg){
    S.locked=true;clearInterval(tm);
    const f=$('#pzface');if(f){f.textContent='😠';f.classList.add('angry');}
    FX.sfx.wrong();FX.shake($('#pzstage'));
    S.lives--;S.round++;hud();toastMsg('❌ '+msg,'bad');
    if(S.lives<=0) return setTimeout(gameOver,1200);
    setTimeout(next,2200);
  }
  function toastMsg(html,kind){
    const st=$('#pzstage');let m=$('.pz-msg',st);
    if(!m){m=document.createElement('div');st.appendChild(m);}
    m.className='pz-msg orb-msg '+kind;m.innerHTML=html;
  }
  function gameOver(){
    if(!S) return;
    const {coins,served,app}=S;
    const stars=served>=15?3:served>=10?2:served>=5?1:0;
    const res=Game.finishArcade('pizza',{score:coins,xp:served*4+stars*5,badge:served>=10?'pizza10':null});
    stars?FX.sfx.win():FX.sfx.lose();if(stars>=2) FX.confetti(150);
    UI.modal({title:'🍕 Dükkân kapandı!',dismiss:false,html:`<div style="text-align:center">
      <div class="stars" style="font-size:56px">${[0,1,2].map(i=>`<span class="star ${i<stars?'on':''}">⭐</span>`).join('')}</div>
      <div class="big-score">${coins} 🪙</div><p class="muted">${res.newBest?'🎉 YENİ REKOR!':'Rekor: '+res.best+' 🪙'}</p>
      <p><b style="color:#4ade80">${served}</b> sipariş teslim ettin.</p></div>`,
      buttons:[{label:'🏠 Menü',cls:'btn-ghost',onClick:()=>Router.nav('menu')},{label:'🔁 Tekrar',cls:'btn-good',onClick:()=>start(app)}]});
  }
  function unmount(){clearInterval(tm);S=null;}
  return {mount,unmount};
})();
