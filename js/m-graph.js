'use strict';
/* =========================================================
   Grafik Nişancısı — doğrusal ve ikinci dereceden fonksiyonlar
   Katsayıları ayarla, "Ateş!" de; top eğri boyunca uçup yıldızları toplasın.
   ========================================================= */
const MGraph = (()=>{
  const LEVELS=[
    {t:'lin',p:{m:1,n:2},xs:[-4,0,3],preview:true,tip:'n, doğrunun y eksenini kestiği noktadır.'},
    {t:'lin',p:{m:2,n:-1},xs:[-2,1,3],preview:true,tip:'m eğimdir: x 1 artınca y, m kadar değişir.'},
    {t:'lin',p:{m:-1,n:3},xs:[-3,1,5],preview:true,tip:'Negatif eğimli doğru soldan sağa alçalır.'},
    {t:'lin',p:{m:0.5,n:-2},xs:[-4,0,6],preview:false,tip:'Uzman: önizleme yok! Yıldızlardan eğimi hesapla.'},
    {t:'lin',p:{m:-2,n:4},xs:[0,1,4],preview:false,tip:'İki yıldız arasındaki Δy / Δx = eğim.'},
    {t:'lin',p:{m:-0.5,n:1},xs:[-6,2,8],preview:false,tip:'Kesirli eğim: x 2 artınca y 1 azalıyor mu?'},
    {t:'quad',p:{a:1,h:0,k:-4},xs:[-2,0,2],preview:true,tip:'(h, k) tepe noktasıdır.'},
    {t:'quad',p:{a:1,h:2,k:-3},xs:[0,2,4],preview:true,tip:'h, parabolü sağa-sola kaydırır.'},
    {t:'quad',p:{a:-1,h:-1,k:5},xs:[-3,-1,1],preview:true,tip:'a < 0 ise kollar aşağı bakar.'},
    {t:'quad',p:{a:0.5,h:3,k:-4},xs:[-1,3,7],preview:false,tip:'Uzman: |a| küçüldükçe parabol genişler.'},
    {t:'quad',p:{a:2,h:-2,k:-6},xs:[-4,-2,0],preview:false,tip:'Tepe noktasındaki yıldızı bul, sonra a\'yı hesapla.'},
    {t:'quad',p:{a:-0.5,h:1,k:6},xs:[-3,1,5],preview:false,tip:'Simetri eksenine dikkat: x = h.'},
  ];
  const PAR={
    lin:{keys:['m','n'],start:{m:1,n:0},step:{m:.5,n:1},min:{m:-5,n:-10},max:{m:5,n:10},name:{m:'m (eğim)',n:'n (y-kesişimi)'}},
    quad:{keys:['a','h','k'],start:{a:1,h:0,k:0},step:{a:.5,h:1,k:1},min:{a:-3,h:-10,k:-10},max:{a:3,h:10,k:10},name:{a:'a (açıklık)',h:'h (tepe x)',k:'k (tepe y)'}},
  };
  const RANGE=10,SZ=520,PAD=20,W=SZ-2*PAD;
  const X=x=>PAD+(x+RANGE)/(2*RANGE)*W, Y=y=>PAD+(RANGE-y)/(2*RANGE)*W;
  const f=(t,p)=>t==='lin'?(x=>p.m*x+p.n):(x=>p.a*(x-p.h)*(x-p.h)+p.k);
  let S=null,raf=null;

  function eqText(t,p){
    const N=MathX.num;
    const sg=(v,first)=>v<0?(first?'−':' − ')+N(Math.abs(v)):(first?N(v):' + '+N(v));
    if(t==='lin'){
      let s='y = ';
      if(p.m===0) s+=N(p.n);
      else{s+=(p.m===1?'':p.m===-1?'−':N(p.m))+'x';if(p.n) s+=sg(p.n,false);}
      return s;
    }
    let s='y = '+(p.a===1?'':p.a===-1?'−':N(p.a));
    s+=p.h===0?'x²':`(x${p.h>0?' − '+N(p.h):' + '+N(-p.h)})²`;
    if(p.k) s+=sg(p.k,false);
    return s;
  }
  function mount(app,startIdx){
    const stars=Game.levelStars('graph');
    let idx=startIdx??LEVELS.findIndex((_,i)=>!stars['g'+i]);if(idx<0) idx=0;
    const L=LEVELS[idx];
    S={app,idx,L,p:{...PAR[L.t].start},tries:0,firing:false,done:false};
    if(L.t==='lin'&&idx===0) S.p={m:1,n:0};
    app.innerHTML=`<section class="screen graph">
      <div class="bal-top">
        <div><h1 class="screen-title">📈 Grafik Nişancısı</h1><p class="sub" style="margin:0">Katsayıları ayarla ve <b>Ateş!</b> de. Top eğrinin üzerinde uçar: tüm yıldızları tek atışta topla!</p></div>
        <div class="level-chips">${LEVELS.map((l,k)=>{const s=stars['g'+k]||0;return `<button class="lvl ${k===idx?'active':''} ${s?'done':''} ${l.preview?'':'bonus'}" data-k="${k}" title="${l.t==='lin'?'Doğrusal':'İkinci derece'}${l.preview?'':' · Uzman'}">${k+1}<small>${s?'★'.repeat(s):l.t==='lin'?'╱':'∪'}</small></button>`;}).join('')}</div>
      </div>
      <div class="gr-layout">
        <div class="panel gr-board"><svg viewBox="0 0 ${SZ} ${SZ}" id="grsvg" class="gr-svg"></svg></div>
        <div class="gr-side">
          <div class="panel">
            <div class="gr-type">${L.t==='lin'?'Doğrusal fonksiyon · 9. sınıf':'İkinci dereceden fonksiyon · 10–11. sınıf'} ${L.preview?'':'<span class="tag diff">🔥 UZMAN</span>'}</div>
            <div class="gr-eq" id="greq"></div>
            <div id="grctl"></div>
            <div class="btn-row" style="margin-top:14px"><button class="btn btn-big btn-danger" id="grfire">🎯 Ateş!</button><button class="btn btn-ghost" id="grreset">↺</button></div>
            <div class="orb-msg" id="grmsg">💡 ${esc(L.tip)}</div>
          </div>
          <div class="panel law-box" style="margin-top:14px">${L.t==='lin'
            ?'<b>y = m·x + n</b><br>• <b>m</b>: eğim — x 1 birim artınca y\'nin değişimi<br>• <b>n</b>: doğrunun y eksenini kestiği nokta (0, n)'
            :'<b>y = a(x − h)² + k</b><br>• <b>(h, k)</b>: tepe noktası<br>• <b>a > 0</b> kollar yukarı, <b>a < 0</b> kollar aşağı<br>• |a| büyüdükçe parabol daralır'}</div>
        </div>
      </div>
    </section>`;
    $$('.lvl',app).forEach(b=>b.onclick=()=>{FX.sfx.click();cleanup();mount(app,+b.dataset.k);});
    $('#grfire').onclick=fire;
    $('#grreset').onclick=()=>{if(S.firing) return;S.p={...PAR[L.t].start};FX.sfx.down();update();};
    buildCtl();update();
  }
  function buildCtl(){
    const P=PAR[S.L.t];
    $('#grctl').innerHTML=P.keys.map(k=>`<div class="gr-par"><span class="gr-pn">${P.name[k]}</span>
      <button class="pbtn minus" data-k="${k}" data-d="-1">−</button><span class="pval gr-val" id="gv-${k}"></span><button class="pbtn plus" data-k="${k}" data-d="1">+</button></div>`).join('');
    $$('#grctl .pbtn').forEach(b=>b.onclick=()=>{
      if(S.firing||S.done) return;
      const k=b.dataset.k,d=+b.dataset.d;
      let v=Math.round((S.p[k]+d*P.step[k])*2)/2;
      v=clamp(v,P.min[k],P.max[k]);
      if(k==='a'&&v===0) v=d>0?P.step.a:-P.step.a;
      S.p[k]=v;d>0?FX.sfx.up():FX.sfx.down();update();
    });
  }
  function update(){
    const P=PAR[S.L.t];
    P.keys.forEach(k=>{$('#gv-'+k).textContent=MathX.num(S.p[k]);});
    $('#greq').textContent=eqText(S.L.t,S.p);
    draw();
  }
  function stars(){const g=f(S.L.t,S.L.p);return S.L.xs.map(x=>({x,y:g(x)}));}
  function onCurve(st){return Math.abs(f(S.L.t,S.p)(st.x)-st.y)<1e-9;}
  function draw(ball,collected=new Set(),trail=''){
    let s=`<rect x="0" y="0" width="${SZ}" height="${SZ}" rx="12" style="fill:var(--sv-panel)"/>`;
    for(let i=-RANGE;i<=RANGE;i++){s+=`<line x1="${X(i)}" y1="${PAD}" x2="${X(i)}" y2="${SZ-PAD}" style="stroke:var(--sv-ink)" stroke-opacity="${i%5?'.08':'.2'}"/><line x1="${PAD}" y1="${Y(i)}" x2="${SZ-PAD}" y2="${Y(i)}" style="stroke:var(--sv-ink)" stroke-opacity="${i%5?'.08':'.2'}"/>`;}
    s+=`<line x1="${PAD}" y1="${Y(0)}" x2="${SZ-PAD}" y2="${Y(0)}" style="stroke:var(--sv-ink)" stroke-opacity=".85" stroke-width="2"/><line x1="${X(0)}" y1="${PAD}" x2="${X(0)}" y2="${SZ-PAD}" style="stroke:var(--sv-ink)" stroke-opacity=".85" stroke-width="2"/>`;
    for(let i=-RANGE;i<=RANGE;i+=2){if(!i) continue;s+=`<text x="${X(i)}" y="${Y(0)+16}" text-anchor="middle" font-size="12" style="fill:var(--sv-ink)" fill-opacity=".75" font-family="Nunito" font-weight="800">${MathX.num(i)}</text><text x="${X(0)-6}" y="${Y(i)+4}" text-anchor="end" font-size="12" style="fill:var(--sv-ink)" fill-opacity=".75" font-family="Nunito" font-weight="800">${MathX.num(i)}</text>`;}
    const g=f(S.L.t,S.p);
    if(S.L.preview||S.done){
      let d='',pen=false;
      for(let i=0;i<=400;i++){const x=-RANGE+i*2*RANGE/400,y=g(x);if(Math.abs(y)>RANGE*3){pen=false;continue;}d+=(pen?'L':'M')+X(x).toFixed(1)+' '+Y(y).toFixed(1);pen=true;}
      s+=`<clipPath id="grclip"><rect x="${PAD}" y="${PAD}" width="${W}" height="${W}"/></clipPath><path d="${d}" clip-path="url(#grclip)" fill="none" style="stroke:var(--sv-line)" stroke-width="3" stroke-dasharray="${S.done?'0':'8 7'}" opacity="${S.done?1:.75}"/>`;
    }
    if(trail) s+=`<path d="${trail}" clip-path="url(#grclip2)" fill="none" stroke="#fbbf24" stroke-width="4" stroke-linecap="round" opacity=".85"/><clipPath id="grclip2"><rect x="${PAD}" y="${PAD}" width="${W}" height="${W}"/></clipPath>`;
    stars().forEach((st,i)=>{
      const got=collected.has(i),hint=S.L.preview&&onCurve(st);
      s+=`<g transform="translate(${X(st.x)} ${Y(st.y)})">${got?'':`<circle r="18" fill="${hint?'rgba(74,222,128,.25)':'rgba(251,191,36,.15)'}"/>`}
        <text y="9" text-anchor="middle" font-size="${got?16:26}" opacity="${got?.35:1}">⭐</text>
        <text y="34" text-anchor="middle" font-size="11" style="fill:var(--sv-ink)" font-family="Nunito" font-weight="800">(${MathX.num(st.x)}, ${MathX.num(st.y)})</text></g>`;
    });
    if(ball) s+=`<circle cx="${ball[0]}" cy="${ball[1]}" r="11" fill="#fbbf24" stroke="#fff" stroke-width="3"><animate attributeName="r" values="10;13;10" dur=".3s" repeatCount="indefinite"/></circle>`;
    $('#grsvg').innerHTML=s;
  }
  function fire(){
    if(S.firing||S.done) return;
    S.firing=true;S.tries++;FX.sfx.pop();
    const g=f(S.L.t,S.p),sts=stars(),collected=new Set();
    const t0=performance.now(),dur=2200;let trail='',pen=false;
    const step=t=>{
      if(!S) return;
      const k=Math.min(1,(t-t0)/dur);const x=-RANGE+k*2*RANGE,y=g(x);
      const inside=Math.abs(y)<=RANGE*1.2;
      if(inside){trail+=(pen?'L':'M')+X(x).toFixed(1)+' '+Y(y).toFixed(1);pen=true;}else pen=false;
      sts.forEach((st,i)=>{if(!collected.has(i)&&x>=st.x&&Math.abs(g(st.x)-st.y)<1e-9){collected.add(i);FX.sfx.correct();const r=$('#grsvg').getBoundingClientRect();FX.burst(r.left+X(st.x)/SZ*r.width,r.top+Y(st.y)/SZ*r.height,26,['#fbbf24','#fde68a','#fff'],{shape:'star',size:9});}});
      draw(inside?[X(x),Y(y)]:null,collected,trail);
      if(k<1) raf=requestAnimationFrame(step); else land(collected.size,sts.length);
    };
    raf=requestAnimationFrame(step);
  }
  function land(got,total){
    S.firing=false;
    if(got===total){
      S.done=true;draw(null,new Set(stars().map((_,i)=>i)));
      const st=S.tries===1?3:S.tries===2?2:1;
      FX.sfx.win();FX.confetti(140);FX.banner('TAM İSABET!','good','small');
      const res=Game.finishLevel('graph','g'+S.idx,st,LEVELS.length,'graph5','graphAll');
      setTimeout(()=>{if(!S) return;UI.modal({title:'🎯 Tüm yıldızlar toplandı!',html:`<div style="text-align:center">
        <div class="stars" style="font-size:56px">${[0,1,2].map(i=>`<span class="star ${i<st?'on':''}">⭐</span>`).join('')}</div>
        <div class="gr-eq" style="margin:10px auto">${esc(eqText(S.L.t,S.p))}</div>
        <p class="muted">Atış sayısı: ${S.tries} · <b style="color:var(--gold)">+${res.xp} XP</b></p></div>`,
        buttons:[{label:'↺ Tekrar',cls:'btn-ghost',onClick:()=>{const a=S.app,i=S.idx;cleanup();mount(a,i);}},{label:'Sonraki ▶',cls:'btn-good',onClick:()=>{const a=S.app,i=(S.idx+1)%LEVELS.length;cleanup();mount(a,i);}}]});},900);
    } else {
      FX.sfx.wrong();
      const m=$('#grmsg');m.className='orb-msg bad';
      m.innerHTML=`❌ ${got}/${total} yıldız toplandı. Katsayıları değiştirip tekrar dene! <span class="muted">(Atış: ${S.tries})</span>`;
      if(S.tries>=3&&!S.L.preview){m.innerHTML+='<br>💡 İpucu: Yıldızların koordinatlarını denklemde yerine koymayı dene.';}
    }
  }
  function cleanup(){cancelAnimationFrame(raf);}
  function unmount(){cleanup();S=null;}
  return {mount,unmount,LEVELS};
})();
