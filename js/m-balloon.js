'use strict';
/* =========================================================
   Balon Patlat — hızlı dört işlem (ilkokul 1–4)
   Doğru cevaplı balonu, gökyüzüne kaçmadan patlat!
   ========================================================= */
const MBalloon = (()=>{
  const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  const MODES={
    add:{name:'Toplama',sub:'20\'ye kadar',icon:'➕',grade:'1. sınıf',c:'#22c55e',gen:()=>{const a=R(1,10),b=R(1,10);return {q:`${a} + ${b}`,a:a+b};}},
    sub:{name:'Çıkarma',sub:'20\'ye kadar',icon:'➖',grade:'1. sınıf',c:'#0ea5e9',gen:()=>{const a=R(5,20),b=R(1,a);return {q:`${a} − ${b}`,a:a-b};}},
    add100:{name:'Toplama-Çıkarma',sub:'100\'e kadar',icon:'🔢',grade:'2. sınıf',c:'#8b5cf6',gen:()=>{
      if(Math.random()<.5){const a=R(10,89),b=R(2,99-a);return {q:`${a} + ${b}`,a:a+b};}
      const a=R(20,99),b=R(2,a-1);return {q:`${a} − ${b}`,a:a-b};}},
    mul:{name:'Çarpım Tablosu',sub:'1–10',icon:'✖️',grade:'2–3. sınıf',c:'#f59e0b',gen:()=>{const a=R(1,10),b=R(1,10);return {q:`${a} × ${b}`,a:a*b,mul:[a,b]};}},
    div:{name:'Bölme',sub:'Kalansız',icon:'➗',grade:'3–4. sınıf',c:'#ef4444',gen:()=>{const b=R(2,10),q=R(1,10);return {q:`${b*q} ÷ ${b}`,a:q};}},
    mix:{name:'Karışık',sub:'Meydan okuma',icon:'🌈',grade:'4. sınıf',c:'#ec4899',gen:()=>{
      const k=['add100','mul','div'][R(0,2)];const g=MODES[k].gen();
      if(Math.random()<.35&&!g.mul){ // eksik sayıyı bul: ? + b = c
        const m=g.q.match(/^(\d+) ([+−]) (\d+)$/);
        if(m) return {q:`? ${m[2]} ${m[3]} = ${g.a}`,a:+m[1]};
      }
      return g;}},
  };
  const COLORS=['#f43f5e','#f59e0b','#22c55e','#0ea5e9','#8b5cf6','#ec4899','#14b8a6','#f97316'];
  let S=null,raf=null,keyH=null;

  function distractors(g){
    const a=g.a,set=new Set();
    const cands=[a+1,a-1,a+2,a-2,a+10,a-10,a+3];
    if(g.mul){const [x,y]=g.mul;cands.unshift(x*(y+1),x*(y-1),(x+1)*y);}
    if(a>=10){const r=+String(a).split('').reverse().join('');if(r!==a) cands.unshift(r);}
    for(const c of shuffle(cands)){if(c>=0&&c!==a) set.add(c);if(set.size>=3) break;}
    let k=4;while(set.size<3){if(a+k!==a) set.add(a+k);k++;}
    return [...set].slice(0,3);
  }

  function mount(app){
    const prof=Store.profile();
    const best=k=>(prof.games['balon_'+k]||{}).best||0;
    app.innerHTML=`<section class="screen bl-game">
      <h1 class="screen-title">🎈 Balon Patlat</h1>
      <p class="sub">Soruyu oku, doğru cevaplı balonu gökyüzüne kaçmadan patlat! Seri yaptıkça balonlar hızlanır. 3 canın var.</p>
      <div class="mode-pick">${Object.entries(MODES).map(([k,m])=>`<button class="mode-card bl-mode" data-m="${k}" style="--mc:${m.c}">
        <div class="mi">${m.icon}</div><h4>${m.name}</h4><p>${m.sub} · ${m.grade}</p><p style="margin-top:6px;color:var(--gold)">🏆 Rekor: ${best(k)}</p></button>`).join('')}</div>
    </section>`;
    $$('.bl-mode',app).forEach(b=>b.onclick=()=>{FX.sfx.pop();start(app,b.dataset.m);});
  }

  function start(app,mode){
    S={app,mode,score:0,correct:0,lives:3,streak:0,speed:46,balloons:[],q:null,last:performance.now(),typed:'',over:false};
    app.innerHTML=`<section class="screen bl-game">
      <div class="bl-hud">
        <div class="bl-q" id="blq">?</div>
        <div class="qh-right"><div class="combo" id="blcombo"></div><div class="lives" id="bllives"></div><div class="score-box"><span>PUAN</span><b id="blscore">0</b></div></div>
      </div>
      <div class="bl-sky" id="sky">
        <div class="cloud c1">☁️</div><div class="cloud c2">☁️</div><div class="cloud c3">☁️</div>
        <div class="bl-typed" id="typed"></div>
      </div>
      <div class="kb-hint">Balona tıkla ya da cevabı klavyeden yazıp <span class="kbd">Enter</span>'a bas.</div>
    </section>`;
    renderLives();
    keyH=e=>{
      if(!S||S.over) return;
      if(/^[0-9]$/.test(e.key)){S.typed=(S.typed+e.key).slice(-4);}
      else if(e.key==='Backspace'){S.typed=S.typed.slice(0,-1);}
      else if(e.key==='Enter'){const t=S.typed;S.typed='';const b=S.balloons.find(x=>!x.dead&&String(x.v)===t);if(b) hit(b);else if(t) FX.sfx.down();}
      else return;
      e.preventDefault();$('#typed').textContent=S.typed;
    };
    document.addEventListener('keydown',keyH);
    nextWave();
    S.last=performance.now();
    raf=requestAnimationFrame(loop);
  }
  function renderLives(){$('#bllives').innerHTML=[0,1,2].map(i=>`<span class="heart ${i>=S.lives?'lost':''}">❤️</span>`).join('');}
  function nextWave(){
    if(!S||S.over) return;
    S.balloons.forEach(b=>{if(!b.dead){b.dead=true;b.el.classList.add('fly');setTimeout(()=>b.el.remove(),600);}});
    S.balloons=[];
    const g=MODES[S.mode].gen();S.q=g;
    $('#blq').innerHTML=`${g.q.includes('=')?g.q:g.q+' = ?'}`;
    $('#blq').classList.remove('pop');void $('#blq').offsetWidth;$('#blq').classList.add('pop');
    const vals=shuffle([g.a,...distractors(g)]);
    const sky=$('#sky');const W=sky.clientWidth,H=sky.clientHeight;
    const lanes=vals.length,laneW=W/lanes;
    const colors=shuffle(COLORS);
    vals.forEach((v,i)=>{
      const el=document.createElement('button');
      el.className='balloon';el.setAttribute('aria-label','Balon '+v);
      el.innerHTML=`<svg viewBox="0 0 100 150"><path d="M50 4C82 4 96 30 96 56C96 86 70 106 54 112L58 120H42L46 112C30 106 4 86 4 56C4 30 18 4 50 4Z" fill="${colors[i]}"/><ellipse cx="32" cy="36" rx="10" ry="17" fill="#fff" opacity=".35" transform="rotate(-20 32 36)"/><path d="M50 120 q-9 12 0 26" stroke="rgba(255,255,255,.6)" fill="none" stroke-width="1.6"/></svg><span>${v}</span>`;
      sky.appendChild(el);
      const b={el,v,ok:v===g.a,x:laneW*i+laneW/2-48+R(-12,12),y:H-120+R(0,90),ph:Math.random()*6,dead:false};
      el.onpointerdown=e=>{e.preventDefault();hit(b);};
      S.balloons.push(b);
    });
  }
  function hit(b){
    if(!S||b.dead||S.over) return;
    const c=FX.centerOf(b.el);
    if(b.ok){
      b.dead=true;S.correct++;S.streak++;
      const mult=1+Math.min(S.streak-1,9)*.1;
      const pts=Math.round((10+Math.max(0,Math.round(b.y/40)))*mult);
      S.score+=pts;S.speed=Math.min(150,46+S.correct*3.2);
      b.el.classList.add('popped');setTimeout(()=>b.el.remove(),300);
      FX.sfx.correct();FX.burst(c.x,c.y,36);FX.floatText(c.x,c.y-30,'+'+pts,'#fbbf24');
      $('#blscore').textContent=S.score;
      $('#blcombo').textContent=S.streak>=2?'🔥×'+S.streak:'';
      if(S.streak%5===0){FX.sfx.combo();FX.banner(S.streak+' SERİ!','gold','small');}
      setTimeout(nextWave,380);
    } else {
      b.dead=true;b.el.classList.add('bad');setTimeout(()=>b.el.remove(),500);
      FX.sfx.wrong();FX.burst(c.x,c.y,14,['#94a3b8','#475569']);FX.floatText(c.x,c.y-30,'✗','#f87171');
      loseLife('Yanlış balon!');
    }
  }
  function loseLife(msg){
    S.streak=0;$('#blcombo').textContent='';
    S.lives--;renderLives();FX.shake($('#sky'));FX.flash();
    if(S.lives<=0) return gameOver();
    FX.banner(msg,'bad','small');
  }
  function loop(t){
    if(!S||S.over||!$('#sky')) return;
    const dt=Math.min(.05,(t-S.last)/1000);S.last=t;
    for(const b of S.balloons){
      if(b.dead) continue;
      b.y-=S.speed*dt;b.ph+=dt*2;
      b.el.style.transform=`translate(${(b.x+Math.sin(b.ph)*8).toFixed(1)}px,${b.y.toFixed(1)}px) rotate(${(Math.sin(b.ph)*4).toFixed(1)}deg)`;
      if(b.y<-150){
        b.dead=true;b.el.remove();
        if(b.ok){
          loseLife('Kaçtı! Cevap '+S.q.a);
          if(!S.over) setTimeout(nextWave,500);
        }
      }
    }
    raf=requestAnimationFrame(loop);
  }
  function gameOver(){
    S.over=true;cancelAnimationFrame(raf);
    const {score,correct,mode,app}=S;
    const stars=correct>=25?3:correct>=15?2:correct>=6?1:0;
    const res=Game.finishArcade('balon_'+mode,{score,xp:correct*3+stars*5,badge:correct>=20?'balloon20':null});
    stars?FX.sfx.win():FX.sfx.lose();if(stars>=2) FX.confetti(150);
    UI.modal({title:'🎈 Oyun bitti!',dismiss:false,html:`<div style="text-align:center">
      <div class="stars" style="font-size:56px">${[0,1,2].map(i=>`<span class="star ${i<stars?'on':''}">⭐</span>`).join('')}</div>
      <div class="big-score">${score}</div><p class="muted">${res.newBest?'🎉 YENİ REKOR!':'Rekor: '+res.best}</p>
      <p><b style="color:#4ade80">${correct}</b> balonu doğru patlattın · ${MODES[mode].icon} ${MODES[mode].name}</p></div>`,
      buttons:[{label:'Mod seç',cls:'btn-ghost',onClick:()=>{cleanup();mount(app);}},{label:'🔁 Tekrar',cls:'btn-good',onClick:()=>{cleanup();start(app,mode);}}]});
  }
  function cleanup(){cancelAnimationFrame(raf);if(keyH) document.removeEventListener('keydown',keyH);keyH=null;}
  function unmount(){cleanup();S=null;}
  return {mount,unmount,MODES};
})();
