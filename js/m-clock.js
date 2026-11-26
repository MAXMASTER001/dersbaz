'use strict';
/* =========================================================
   Saat Ustası — analog saat okuma ve kurma (ilkokul 1–3)
   ========================================================= */
const MClock = (()=>{
  const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  const LEVELS={
    full:{name:'Tam saatler',icon:'🕐',grade:'1. sınıf',mins:[0],snap:60},
    half:{name:'Buçuklar',icon:'🕜',grade:'1–2. sınıf',mins:[0,30],snap:30},
    quarter:{name:'Çeyrekler',icon:'🕒',grade:'2. sınıf',mins:[0,15,30,45],snap:15},
    five:{name:'5 dakikalar',icon:'🕔',grade:'3. sınıf',mins:[0,5,10,15,20,25,30,35,40,45,50,55],snap:5},
  };
  const TOTAL=10;
  let S=null,drag=null;

  function mount(app){
    const prof=Store.profile();
    app.innerHTML=`<section class="screen clock">
      <h1 class="screen-title">⏰ Saat Ustası</h1>
      <p class="sub">Akrebi (kısa, lacivert) ve yelkovanı (uzun, kırmızı) sürükleyerek saati kur ya da gösterilen saati oku. Her turda ${TOTAL} soru!</p>
      <div class="mode-pick">${Object.entries(LEVELS).map(([k,l])=>{const b=(prof.games['saat_'+k]||{}).best||0;
        return `<button class="mode-card ck-lv" data-l="${k}"><div class="mi">${l.icon}</div><h4>${l.name}</h4><p>${l.grade}</p><p style="margin-top:6px;color:var(--gold)">🏆 En iyi: ${b}/${TOTAL}</p></button>`;}).join('')}</div>
    </section>`;
    $$('.ck-lv',app).forEach(b=>b.onclick=()=>{FX.sfx.pop();start(app,b.dataset.l);});
  }
  function start(app,lv){
    S={app,lv,i:0,correct:0,h:12,m:0,locked:false};
    app.innerHTML=`<section class="screen clock">
      <div class="q-hud" style="grid-template-columns:1fr auto">
        <div><div class="q-progress" id="ckdots"></div><div class="q-count" id="ckcount"></div></div>
        <div class="score-box"><span>DOĞRU</span><b id="ckscore">0</b></div>
      </div>
      <div class="ck-stage panel" id="ckstage"></div>
    </section>`;
    question();
  }
  function randTime(){const L=LEVELS[S.lv];return {h:R(1,12),m:L.mins[R(0,L.mins.length-1)]};}
  function dots(){
    $('#ckdots').innerHTML=Array.from({length:TOTAL},(_,k)=>`<i class="${k===S.i?'cur':S.res?.[k]===true?'ok':S.res?.[k]===false?'no':''}"></i>`).join('');
    $('#ckcount').textContent=`Soru ${S.i+1} / ${TOTAL}`;
  }
  function question(){
    S.res=S.res||[];S.locked=false;dots();
    const t=randTime();S.target=t;
    const st=$('#ckstage');
    S.mode=Math.random()<.5?'set':'read';
    if(S.mode==='set'){
      S.h=12;S.m=0;
      const usePhrase=Math.random()<.6;
      const label=usePhrase?MathX.timePhrase(t.h,t.m):MathX.digital(t.h,t.m);
      st.innerHTML=`<div class="ck-task">Saati kur: <b class="ck-target">${esc(label)}</b></div>
        <div class="ck-work">
          <div class="ck-face" id="ckface">${MathX.clockSVG({h:S.h,m:S.m})}</div>
          <div class="ck-side">
            <div class="ck-btns">
              <button class="btn btn-sm btn-ghost" data-d="h-1">◀ Akrep</button><button class="btn btn-sm btn-ghost" data-d="h1">Akrep ▶</button>
              <button class="btn btn-sm btn-ghost" data-d="m-1">◀ Yelkovan</button><button class="btn btn-sm btn-ghost" data-d="m1">Yelkovan ▶</button>
            </div>
            <button class="btn btn-big btn-good" id="ckcheck">Kontrol Et ✔</button>
            <p class="muted" style="font-size:13px;font-weight:700">İpucu: Yelkovan dakikayı, akrep saati gösterir. Akrep, yelkovan döndükçe yavaşça ilerler.</p>
          </div>
        </div><div id="ckmsg"></div>`;
      bindDrag();
      $$('[data-d]',st).forEach(b=>b.onclick=()=>{
        const d=b.dataset.d,step=LEVELS[S.lv].snap===60?5:Math.min(LEVELS[S.lv].snap,15);
        if(d==='h1') S.h=S.h%12+1; if(d==='h-1') S.h=(S.h+10)%12+1;
        if(d==='m1') setMin(S.m+step); if(d==='m-1') setMin(S.m-step);
        FX.sfx.click();drawFace();
      });
      $('#ckcheck').onclick=checkSet;
    } else {
      const opts=new Map();const key=x=>x.h+':'+x.m;
      opts.set(key(t),t);
      const cands=shuffle([
        {h:(t.m/5)||12,m:(t.h%12)*5}, // akrep ile yelkovanı karıştırma

        {h:t.h%12+1,m:t.m},{h:(t.h+10)%12+1,m:t.m},
        {h:t.h,m:(t.m+30)%60},{h:t.h,m:(t.m+15)%60},{h:t.h,m:(t.m+45)%60},
      ]);
      for(const c of cands){if(c.h<1||c.h>12) continue;if(!LEVELS[S.lv].mins.includes(c.m)&&S.lv!=='five') continue;if(!opts.has(key(c))) opts.set(key(c),c);if(opts.size>=4) break;}
      while(opts.size<4){const c=randTime();opts.set(key(c),c);}
      const list=shuffle([...opts.values()]);
      const phrase=Math.random()<.5;
      st.innerHTML=`<div class="ck-task">Saat kaçı gösteriyor?</div>
        <div class="ck-work"><div class="ck-face">${MathX.clockSVG(t)}</div>
          <div class="ck-side ck-opts">${list.map((o,i)=>`<button class="btn btn-big btn-ghost ck-opt" data-i="${i}">${esc(phrase?MathX.timePhrase(o.h,o.m):MathX.digital(o.h,o.m))}</button>`).join('')}</div>
        </div><div id="ckmsg"></div>`;
      $$('.ck-opt',st).forEach(b=>b.onclick=()=>{
        if(S.locked) return;
        const o=list[+b.dataset.i];
        const ok=o.h===t.h&&o.m===t.m;
        b.classList.add(ok?'btn-good':'btn-danger');b.classList.remove('btn-ghost');
        if(!ok){const ri=list.findIndex(x=>x.h===t.h&&x.m===t.m);const rb=$(`.ck-opt[data-i="${ri}"]`);rb.classList.add('btn-good');rb.classList.remove('btn-ghost');}
        result(ok);
      });
    }
  }
  function setMin(m){
    const old=S.m;m=((m%60)+60)%60;
    if(old>=45&&m<=15&&m!==old) S.h=S.h%12+1;
    if(old<=15&&m>=45&&m!==old) S.h=(S.h+10)%12+1;
    S.m=m;
  }
  function drawFace(){
    const f=$('#ckface');if(!f) return;
    const ha=((S.h%12)+S.m/60)*30,ma=S.m*6;
    $('.hand-h',f).style.transform=`rotate(${ha}deg)`;
    $('.hand-m',f).style.transform=`rotate(${ma}deg)`;
  }
  function bindDrag(){
    const f=$('#ckface');const svg=$('svg',f);
    $('.hand-h',f).classList.add('grab');$('.hand-m',f).classList.add('grab');
    // geniş tutma alanları
    $('.hand-h line',f).setAttribute('stroke-width','10');
    const angleOf=e=>{const r=svg.getBoundingClientRect();const x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2);let a=Math.atan2(x,-y)*180/Math.PI;return (a+360)%360;};
    svg.addEventListener('pointerdown',e=>{
      if(S.locked) return;
      const r=svg.getBoundingClientRect();const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
      const dist=Math.hypot(dx,dy)/(r.width/2);
      const a=angleOf(e);
      const ha=((S.h%12)+S.m/60)*30,ma=S.m*6;
      const diff=(x,y)=>{const d=Math.abs(x-y)%360;return Math.min(d,360-d);};
      drag=(dist<.55&&diff(a,ha)<diff(a,ma)+25)?'h':'m';
      svg.setPointerCapture(e.pointerId);move(e);
    });
    const move=e=>{
      if(!drag||S.locked) return;
      const a=angleOf(e);
      if(drag==='m'){const snap=LEVELS[S.lv].snap===60?5:Math.min(LEVELS[S.lv].snap,15);const m=Math.round(a/6/snap)*snap%60;if(m!==S.m){setMin(m);FX.sfx.tick();}}
      else{const h=Math.round((a/30)-S.m/60);const hh=((h%12)+12)%12||12;if(hh!==S.h){S.h=hh;FX.sfx.tick();}}
      drawFace();
    };
    svg.addEventListener('pointermove',move);
    const up=()=>{drag=null;};
    svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',up);
  }
  function checkSet(){
    if(S.locked) return;
    const t=S.target,ok=S.h===t.h&&S.m===t.m;
    if(!ok){
      $('#ckmsg').innerHTML=`<div class="orb-msg bad">❌ Senin kurduğun: <b>${MathX.digital(S.h,S.m)}</b> (${esc(MathX.timePhrase(S.h,S.m))}). Doğrusu: <b>${MathX.digital(t.h,t.m)}</b></div>`;
      S.h=t.h;S.m=t.m;setTimeout(drawFace,600);
    }
    result(ok);
  }
  function result(ok){
    S.locked=true;S.res[S.i]=ok;
    const t=S.target;
    if(ok){
      S.correct++;$('#ckscore').textContent=S.correct;
      FX.sfx.correct();FX.celebrate($('#ckstage .ck-face'));
      if(!$('#ckmsg').innerHTML) $('#ckmsg').innerHTML=`<div class="orb-msg good">✅ ${MathX.digital(t.h,t.m)} — ${esc(MathX.timePhrase(t.h,t.m))}</div>`;
    } else {
      FX.sfx.wrong();FX.shake($('#ckstage'));
      if(!$('#ckmsg').innerHTML) $('#ckmsg').innerHTML=`<div class="orb-msg bad">❌ Doğrusu: <b>${MathX.digital(t.h,t.m)}</b> — ${esc(MathX.timePhrase(t.h,t.m))}</div>`;
    }
    dots();
    const nb=document.createElement('div');nb.style.cssText='text-align:center;margin-top:12px';
    nb.innerHTML=`<button class="btn btn-big btn-primary" id="cknext">${S.i>=TOTAL-1?'Sonuçlar 🏁':'Devam ▶'}</button>`;
    $('#ckmsg').appendChild(nb);
    $('#cknext').onclick=()=>{FX.sfx.click();if(S.i>=TOTAL-1) return finish();S.i++;question();};
  }
  function finish(){
    const {correct,lv,app}=S;
    const stars=correct>=9?3:correct>=7?2:correct>=5?1:0;
    const res=Game.finishArcade('saat_'+lv,{score:correct,xp:correct*4+stars*5,badge:correct===TOTAL?'clock10':null});
    stars?FX.sfx.win():FX.sfx.lose();if(stars>=2) FX.confetti(150);
    UI.modal({title:'⏰ Tur bitti!',dismiss:false,html:`<div style="text-align:center">
      <div class="stars" style="font-size:56px">${[0,1,2].map(i=>`<span class="star ${i<stars?'on':''}">⭐</span>`).join('')}</div>
      <div class="big-score">${correct} / ${TOTAL}</div><p class="muted">${res.newBest?'🎉 YENİ REKOR!':'En iyi: '+res.best+' / '+TOTAL}</p></div>`,
      buttons:[{label:'Seviye seç',cls:'btn-ghost',onClick:()=>mount(app)},{label:'🔁 Tekrar',cls:'btn-good',onClick:()=>start(app,lv)}]});
  }
  function unmount(){S=null;drag=null;}
  return {mount,unmount};
})();
