'use strict';
/* =========================================================
   Soru Arenası — oyun tabanlı çoktan seçmeli
   ========================================================= */
const LETTERS='ABCDE';
const subjOf=q=>q.subject||'kimya';
function subjectQuestions(){const id=App.subject().id;return Store.questions().filter(q=>subjOf(q)===id);}
function topicIcon(t=''){
  t=t.toLocaleLowerCase('tr');
  if(t.includes('kesir')) return '🍕';
  if(t.includes('zaman')||t.includes('saat')) return '⏰';
  if(t.includes('şekil')||t.includes('geometri')) return '🔷';
  if(t.includes('fonksiyon')) return '📈';
  if(t.includes('denklem')||t.includes('eşitsizlik')) return '⚖️';
  if(t.includes('üslü')||t.includes('köklü')) return '√';
  if(t.includes('olasılık')) return '🎲';
  if(t.includes('sayı')||t.includes('işlem')) return '🔢';
  if(t.includes('orbital')||t.includes('dizilim')) return '🌀';
  if(t.includes('atom')||t.includes('periyod')) return '⚛️';
  if(t.includes('hal')) return '💨';
  if(t.includes('etkileşim')||t.includes('bağ')) return '🔗';
  if(t.includes('tepkime')) return '🔥';
  if(t.includes('asit')||t.includes('baz')) return '🧪';
  if(t.includes('güvenli')||t.includes('laboratuvar')) return '🥽';
  if(t.includes('sürdürül')||t.includes('çevre')) return '♻️';
  if(t.includes('madde')||t.includes('karışım')) return '🧊';
  return '📘';
}

const Quiz = (()=>{
  let st=null, timerId=null, keyHandler=null;
  const MODES={
    classic:{name:'Klasik',icon:'⏱️',desc:'30 saniye · 3 can · kombo puanı',time:30,lives:3,mult:1},
    practice:{name:'Antrenman',icon:'🧘',desc:'Süre yok · can yok · rahatça öğren',time:0,lives:0,mult:.5},
    sudden:{name:'Ani Ölüm',icon:'💀',desc:'20 saniye · tek can · 2× puan',time:20,lives:1,mult:2},
  };
  let setup={topic:'',grade:0,count:10,mode:'classic'};

  /* ---------- Soru HTML (oyun + önizleme ortak) ---------- */
  function buildQuestionHTML(q,{mascot=true}={}){
    const n=q.options.length;
    const d=clamp(q.difficulty||1,1,3);
    const diff='★'.repeat(d)+'<i>★</i>'.repeat(3-d);
    const stemCap=q.stem?Visual.caption(q.stem):'';
    const stem=(q.stem&&q.stem.type&&q.stem.type!=='none')?`<div class="q-stem">${Visual.render(q.stem)}${stemCap?`<div class="stem-cap">${stemCap}</div>`:''}</div>`:'';
    const img=q.image?`<div class="q-stem"><img src="${esc(q.image)}" alt="soru görseli"></div>`:'';
    const longText=q.options.every(o=>o.type==='text')&&q.options.some(o=>String(o.value||'').replace(/[{}*]/g,'').length>30);
    const opts=q.options.map((o,i)=>{
      const cap=Visual.caption(o);
      return `<button class="opt t-${o.type}" style="--c:var(--o${LETTERS[i]})" data-i="${i}" aria-label="Şık ${LETTERS[i]}">
        <span class="letter">${LETTERS[i]}</span>
        <div class="vis">${Visual.render(o)}</div>
        ${cap?`<div class="cap">${cap}</div>`:''}
        <span class="mark"></span>
      </button>`;
    }).join('');
    return `<div class="q-stage">
        ${mascot?`<div class="mascot-wrap">${Mascot.svg()}<div class="speech" id="speech"></div></div>`:''}
        <div class="q-card">
          <div class="q-meta"><span class="tag">${topicIcon(q.topic)} ${esc(q.topic||'Genel')}</span><span class="tag">${esc(q.grade||9)}. sınıf</span><span class="tag diff">${diff}</span></div>
          <div class="q-text">${richText(q.text)}</div>${img}${stem}
        </div>
      </div>
      <div class="opts n${n} ${longText?'long-text':''}">${opts}</div>`;
  }

  /* ---------- Kurulum ekranı ---------- */
  function mountSetup(app){
    cleanup();
    const qs=subjectQuestions();const S=App.subject();
    if(setup.subject!==S.id){setup.subject=S.id;setup.topic='';setup.grade=0;}
    const topics=[...new Set(qs.map(q=>q.topic))];
    const cnt=t=>qs.filter(q=>!t||q.topic===t).length;
    app.innerHTML=`<section class="screen setup">
      <h1 class="screen-title">🎯 Soru Arenası</h1>
      <p class="sub">Konunu seç, modunu belirle ve arenaya çık! Doğru cevaplarla kombo yap, puanları topla.</p>
      <div class="panel"><h3>📚 Konu</h3><div class="chips" data-g="topic">
        <button class="chip" data-v="">🌈 Tüm Konular <small>${qs.length}</small></button>
        ${topics.map(t=>`<button class="chip" data-v="${esc(t)}">${topicIcon(t)} ${esc(t)} <small>${cnt(t)}</small></button>`).join('')}
      </div></div>
      <div class="panel" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px">
        <div><h3>🎓 Sınıf</h3><div class="chips" data-g="grade">
          <button class="chip" data-v="0">Hepsi</button>${S.grades.filter(g=>qs.some(q=>+q.grade===g)).map(g=>`<button class="chip" data-v="${g}">${g}. sınıf</button>`).join('')}
        </div></div>
        <div><h3>🔢 Soru sayısı</h3><div class="chips" data-g="count">
          ${[5,10,15,0].map(c=>`<button class="chip" data-v="${c}">${c||'Hepsi'}</button>`).join('')}
        </div></div>
      </div>
      <div class="panel"><h3>🎮 Oyun modu</h3><div class="mode-pick">
        ${Object.entries(MODES).map(([k,m])=>`<button class="mode-card" data-mode="${k}"><div class="mi">${m.icon}</div><h4>${m.name}</h4><p>${m.desc}</p></button>`).join('')}
      </div></div>
      <div class="go-row"><button class="btn btn-big btn-good" id="go">ARENAYA GİR ▶</button></div>
    </section>`;
    const sync=()=>{
      $$('.chips',app).forEach(g=>{const key=g.dataset.g;$$('.chip',g).forEach(c=>c.classList.toggle('active',String(setup[key])===c.dataset.v));});
      $$('.mode-card',app).forEach(c=>c.classList.toggle('active',c.dataset.mode===setup.mode));
    };
    if(setup.topic&&!topics.includes(setup.topic)) setup.topic='';
    sync();
    $$('.chips',app).forEach(g=>g.addEventListener('click',e=>{
      const c=e.target.closest('.chip');if(!c) return;
      const key=g.dataset.g;setup[key]=key==='topic'?c.dataset.v:+c.dataset.v;FX.sfx.click();sync();
    }));
    $$('.mode-card',app).forEach(c=>c.onclick=()=>{setup.mode=c.dataset.mode;FX.sfx.click();sync();});
    $('#go',app).onclick=()=>start(app);
  }

  /* ---------- Oyun ---------- */
  function start(app){
    let pool=subjectQuestions().filter(q=>(!setup.topic||q.topic===setup.topic)&&(!setup.grade||+q.grade===setup.grade));
    if(!pool.length){UI.toast('Bu seçimde soru yok. Başka bir konu/sınıf seç ya da öğretmen panelinden soru ekle.','bad');return;}
    pool=shuffle(pool);
    if(setup.count) pool=pool.slice(0,setup.count);
    const m=MODES[setup.mode];
    st={app,qs:pool,i:0,score:0,lives:m.lives,maxLives:m.lives,mode:setup.mode,m,streak:0,maxStreak:0,correct:0,results:[],wrong:[],
      jokers:{fifty:true,hint:true,time:!!m.time},locked:false,timeLeft:m.time};
    FX.sfx.pop();
    keyHandler=onKey;document.addEventListener('keydown',keyHandler);
    renderQuestion();
  }
  function heartsHTML(){
    if(!st.maxLives) return '<span title="Antrenman modunda can yok">♾️</span>';
    let h='';for(let i=0;i<st.maxLives;i++) h+=`<span class="heart ${i>=st.lives?'lost':''}" data-h="${i}">${I('heart')}</span>`;
    return h;
  }
  function renderQuestion(){
    const q=st.qs[st.i];
    st.locked=false;st.timeLeft=st.m.time;
    const dots=st.qs.map((_,k)=>`<i class="${k===st.i?'cur':st.results[k]===true?'ok':st.results[k]===false?'no':''}"></i>`).join('');
    const C=2*Math.PI*34;
    st.app.innerHTML=`<section class="screen quiz">
      <div class="q-hud">
        <div class="qh-left"><div class="q-progress">${dots}</div><div class="q-count">Soru ${st.i+1} / ${st.qs.length}</div></div>
        <div class="qh-mid"><div class="timer ${st.m.time?'':'off'}" id="timer"><svg viewBox="0 0 78 78"><circle class="bgc" cx="39" cy="39" r="34"/><circle class="fgc" id="tring" cx="39" cy="39" r="34" stroke-dasharray="${C}" stroke-dashoffset="0"/></svg><span id="tsec">${st.m.time||'∞'}</span></div></div>
        <div class="qh-right"><div class="combo ${st.streak>=3?'hot':''}" id="combo">${st.streak>=2?'🔥×'+st.streak:''}</div><div class="lives" id="lives">${heartsHTML()}</div><div class="score-box" id="scorebox"><span>PUAN</span><b id="score">${st.score}</b></div></div>
      </div>
      ${buildQuestionHTML(q)}
      <div class="jokers">
        <button class="btn btn-sm joker ${st.jokers.fifty?'':'used'}" data-j="fifty">✂️ Yarı Yarıya</button>
        <button class="btn btn-sm joker ${st.jokers.hint?'':'used'}" data-j="hint">💡 ${App.subject().mascot}'dan İpucu</button>
        ${st.m.time?`<button class="btn btn-sm joker ${st.jokers.time?'':'used'}" data-j="time">⏳ +15 sn</button>`:''}
      </div>
      <div class="kb-hint">Klavye: <span class="kbd">A</span>–<span class="kbd">E</span> veya <span class="kbd">1</span>–<span class="kbd">5</span> ile seç · <span class="kbd">Enter</span> devam</div>
    </section>
    <div class="feedback" id="feedback"></div>`;
    $$('.opt',st.app).forEach(b=>b.onclick=()=>answer(+b.dataset.i));
    $$('.joker',st.app).forEach(b=>b.onclick=()=>useJoker(b.dataset.j,b));
    if(st.m.time) startTimer();
    setTimeout(()=>{if(st&&st.i===0&&!st.locked) Mascot.say('Hadi başlayalım! Takılırsan 💡 ipucu jokerini kullanabilirsin.',3500);},700);
  }
  function startTimer(){
    stopTimer();
    const ring=$('#tring'),sec=$('#tsec'),box=$('#timer');
    const C=2*Math.PI*34;let lastWhole=Math.ceil(st.timeLeft);
    let last=performance.now();
    timerId=setInterval(()=>{
      if(!st||st.locked) return;
      const now=performance.now();st.timeLeft-=(now-last)/1000;last=now;
      const t=Math.max(0,st.timeLeft);
      ring.style.strokeDashoffset=String(C*(1-t/st.m.time));
      const whole=Math.ceil(t);sec.textContent=whole;
      box.classList.toggle('warn',t<=5);
      if(whole!==lastWhole&&whole<=5&&whole>0) FX.sfx.tick();
      lastWhole=whole;
      if(t<=0) answer(-1,true);
    },100);
  }
  function stopTimer(){if(timerId){clearInterval(timerId);timerId=null;}}

  function useJoker(j,btn){
    if(!st||st.locked||!st.jokers[j]) return;
    const q=st.qs[st.i];
    st.jokers[j]=false;btn.classList.add('used');FX.sfx.pop();
    if(j==='fifty'){
      const n=q.options.length;const remove=n>=4?2:n===3?1:0;
      const wrongs=shuffle(q.options.map((_,i)=>i).filter(i=>i!==q.answer)).slice(0,remove);
      wrongs.forEach(i=>{const el=$(`.opt[data-i="${i}"]`);el.classList.add('eliminated');FX.burst(FX.centerOf(el).x,FX.centerOf(el).y,14,['#94a3b8','#64748b']);});
      Mascot.say('✂️ İki yanlış şıkkı laboratuvardan kovdum!');
    } else if(j==='hint'){
      Mascot.set('think');
      Mascot.say('💡 '+(q.hint?richText(q.hint):'Seçenekleri dikkatlice karşılaştır; anahtar kelimeyi bul!'),7000);
    } else if(j==='time'){
      st.timeLeft+=15;FX.floatText(FX.centerOf($('#timer')).x,FX.centerOf($('#timer')).y,'+15 sn','#22d3ee');
    }
  }

  function answer(idx,timedOut=false){
    if(!st||st.locked) return;
    st.locked=true;stopTimer();
    const q=st.qs[st.i];
    const ok=idx===q.answer;
    const cards=$$('.opt',st.app);
    cards.forEach(c=>c.classList.add('locked'));
    const picked=cards[idx];
    st.results[st.i]=ok;
    if(ok){
      st.streak++;st.maxStreak=Math.max(st.maxStreak,st.streak);st.correct++;
      const diffMul=[1,1,1.5,2][clamp(q.difficulty||1,1,3)];
      const timeBonus=st.m.time?Math.round(Math.max(0,st.timeLeft)*4):0;
      const comboMul=1+Math.min(st.streak-1,5)*.25;
      const pts=Math.round((100*diffMul+timeBonus)*comboMul*st.m.mult);
      st.score+=pts;
      picked.classList.add('correct');picked.querySelector('.mark').textContent='✓';
      cards.forEach(c=>{if(c!==picked) c.classList.add('dim');});
      FX.sfx.correct();FX.celebrate(picked);
      const c=FX.centerOf(picked);FX.floatText(c.x,c.y-40,'+'+pts,'#fbbf24');
      FX.banner(['DOĞRU!','HARİKA!','SÜPER!','MÜKEMMEL!','BRAVO!'][Math.floor(Math.random()*5)],'good');
      Mascot.set('happy');
      const sb=$('#scorebox');sb.classList.remove('bump');void sb.offsetWidth;sb.classList.add('bump');
      $('#score').textContent=st.score;
      const combo=$('#combo');combo.textContent=st.streak>=2?'🔥×'+st.streak:'';combo.classList.toggle('hot',st.streak>=3);
      if(st.streak>=3){setTimeout(()=>{FX.sfx.combo();FX.banner(st.streak+'× KOMBO!','gold','small');},450);}
      Game.recordAnswer(true,st.streak);
    } else {
      st.streak=0;
      if(picked){picked.classList.add('wrong');picked.querySelector('.mark').textContent='✗';}
      const right=cards[q.answer];if(right){right.classList.add('reveal');right.querySelector('.mark').textContent='✓';}
      cards.forEach(c=>{if(c!==picked&&c!==right) c.classList.add('dim');});
      FX.sfx.wrong();FX.shake();FX.flash();
      FX.banner(timedOut?'SÜRE BİTTİ!':'YANLIŞ!','bad');
      Mascot.set('sad');
      if(st.maxLives){
        st.lives--;
        const h=$(`.heart[data-h="${st.lives}"]`);if(h) h.classList.add('breaking');
      }
      $('#combo').textContent='';
      st.wrong.push({q,picked:idx});
      Game.recordAnswer(false,0);
    }
    setTimeout(()=>showFeedback(ok,q,timedOut),950);
  }
  function showFeedback(ok,q,timedOut){
    if(!st) return;
    const fb=$('#feedback');
    const last=st.i>=st.qs.length-1||(st.maxLives&&st.lives<=0);
    const head=ok?'✅ Doğru cevap!':(timedOut?'⏰ Süre doldu!':'❌ Yanlış cevap');
    fb.className='feedback '+(ok?'good':'bad');
    fb.innerHTML=`<div class="fb-head">${head} <span class="muted" style="font-size:16px;font-family:var(--font-b)">${ok?'':'Doğru şık: <b style="color:#4ade80">'+LETTERS[q.answer]+'</b>'}</span></div>
      <div class="fb-body">${q.explanation?richText(q.explanation):'Açıklama eklenmemiş.'}</div>
      <div class="fb-actions"><span class="muted">${st.maxLives&&st.lives<=0?'💔 Canın bitti!':''}</span><button class="btn btn-big ${ok?'btn-good':'btn-primary'}" id="next">${last?'SONUÇLARI GÖR 🏁':'DEVAM ▶'}</button></div>`;
    requestAnimationFrame(()=>fb.classList.add('show'));
    $('#next').onclick=next;
    $('#next').focus({preventScroll:true});
  }
  function next(){
    if(!st) return;
    FX.sfx.click();
    if(st.i>=st.qs.length-1||(st.maxLives&&st.lives<=0)) return finish();
    st.i++;renderQuestion();window.scrollTo({top:0,behavior:'smooth'});
  }
  function onKey(e){
    if(!st) return;
    if(e.target&&['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
    const fb=$('#feedback');
    if(fb&&fb.classList.contains('show')){if(e.key==='Enter'||e.key===' '){e.preventDefault();next();}return;}
    if(st.locked) return;
    const k=e.key.toUpperCase();
    let idx=LETTERS.indexOf(k);
    if(idx<0&&/^[1-5]$/.test(e.key)) idx=+e.key-1;
    const q=st.qs[st.i];
    if(idx>=0&&idx<q.options.length){
      const el=$(`.opt[data-i="${idx}"]`);
      if(el&&!el.classList.contains('eliminated')) answer(idx);
    }
  }

  /* ---------- Sonuç ---------- */
  function finish(){
    stopTimer();
    const total=st.qs.length, answered=st.results.filter(r=>r!==undefined).length;
    const ratio=st.correct/total;
    const stars=ratio>=.9?3:ratio>=.6?2:ratio>0.3?1:0;
    const xp=st.correct*10+Math.floor(st.score/25)+stars*10;
    const res=Game.finishQuiz({score:st.score,correct:st.correct,total,answered,maxStreak:st.maxStreak,perfect:st.correct===total&&total>=5,xp});
    const app=st.app;
    const wrong=st.wrong;
    const titles=['Tekrar deneyelim! 💪','İyi başlangıç! 👍','Çok iyi! 🎉','Efsane! 🏆'];
    app.innerHTML=`<section class="screen result">
      <div style="display:flex;justify-content:center">${Mascot.svg(stars>=2?'happy':stars===0?'sad':'think')}</div>
      <h1 class="screen-title" style="justify-content:center">${titles[stars]}</h1>
      <div class="stars">${[0,1,2].map(i=>`<span class="star" data-s="${i}">⭐</span>`).join('')}</div>
      <div class="big-score" id="bigscore">0</div>
      <div class="muted" style="font-weight:800">${res.newBest?'🎉 YENİ REKOR!':'En yüksek puan: '+res.best}</div>
      <div class="stat-tiles">
        <div class="stat"><b style="color:#4ade80">${st.correct}</b><span>Doğru</span></div>
        <div class="stat"><b style="color:#f87171">${answered-st.correct}</b><span>Yanlış</span></div>
        <div class="stat"><b style="color:#fb923c">${st.maxStreak}</b><span>En uzun kombo</span></div>
        <div class="stat"><b style="color:var(--gold)">+${xp}</b><span>Deneyim puanı (XP)</span></div>
      </div>
      <div class="btn-row" style="justify-content:center">
        <button class="btn btn-big btn-good" id="again">🔁 Tekrar Oyna</button>
        <a class="btn btn-big btn-ghost" href="#/menu">🏠 Menü</a>
      </div>
      ${wrong.length?`<div class="review"><h2>📖 Hatalarından öğren</h2>${wrong.map(w=>{
        const o=w.q.options[w.q.answer];
        return `<div class="review-item"><div class="mini">${Visual.render(o)}<div class="cap" style="font-size:12px;font-weight:800">${Visual.caption(o)}</div></div>
          <div><h4>${richText(w.q.text)}</h4><p><b style="color:#4ade80">Doğru cevap: ${LETTERS[w.q.answer]}</b>${w.picked>=0?` · Senin cevabın: ${LETTERS[w.picked]}`:' · Süre doldu'}</p><p style="margin-top:6px">${richText(w.q.explanation||'')}</p></div></div>`;
      }).join('')}</div>`:''}
    </section>`;
    cleanupKeys();
    st=null;
    stars>=1?FX.sfx.win():FX.sfx.lose();
    $$('.star',app).forEach((s,i)=>{if(i<stars) setTimeout(()=>{s.classList.add('on');FX.sfx.pop();const c=FX.centerOf(s);FX.burst(c.x,c.y,24,['#fbbf24','#fde68a','#fff'],{shape:'star',size:9});},400+i*350);});
    if(stars>=2) setTimeout(()=>FX.confetti(180),1300);
    // puanı say
    const target=res.score;const el=$('#bigscore',app);const t0=performance.now();
    const tick=t=>{const k=Math.min(1,(t-t0)/1200);el.textContent=Math.round(target*(1-Math.pow(1-k,3)));if(k<1) requestAnimationFrame(tick);};
    requestAnimationFrame(tick);
    $('#again',app).onclick=()=>mountSetup(app);
  }

  /* ---------- Önizleme (öğretmen paneli) ---------- */
  function preview(q){
    const m=UI.modal({wide:true,title:'👁️ Öğrenci görünümü',html:`<div class="quiz" id="pv-quiz">${buildQuestionHTML(q)}</div><div id="pv-fb" style="margin-top:10px"></div>`,buttons:[{label:'Kapat',cls:'btn-ghost'}]});
    const root=m.el;let done=false;
    $$('.opt',root).forEach(b=>b.onclick=()=>{
      if(done) return;done=true;
      const i=+b.dataset.i;const ok=i===q.answer;const cards=$$('.opt',root);
      if(ok){b.classList.add('correct');b.querySelector('.mark').textContent='✓';FX.sfx.correct();FX.celebrate(b);Mascot.set('happy');}
      else{b.classList.add('wrong');b.querySelector('.mark').textContent='✗';const r=cards[q.answer];r.classList.add('reveal');r.querySelector('.mark').textContent='✓';FX.sfx.wrong();FX.shake($('.modal',root));Mascot.set('sad');}
      $('#pv-fb',root).innerHTML=`<div class="panel"><b>${ok?'✅ Doğru':'❌ Yanlış'}</b> — ${richText(q.explanation||'')}</div>`;
    });
  }

  function cleanupKeys(){if(keyHandler){document.removeEventListener('keydown',keyHandler);keyHandler=null;}}
  function cleanup(){stopTimer();cleanupKeys();st=null;}
  return {mount:mountSetup,unmount:cleanup,buildQuestionHTML,preview};
})();
