'use strict';
/* =========================================================
   Dersler, oyun durumu (XP, seviye, rozet), menüler, yönlendirme
   ========================================================= */
const SUBJECTS = {
  kimya:{
    id:'kimya',name:'Kimya',icon:'⚗️',mascot:'Mol',c1:'#7c3aed',c2:'#06b6d4',
    level:'Lise · 9–12. sınıf',desc:'Atomlar, tepkimeler, orbitaller ve laboratuvar simülasyonları.',
    grades:[9,10,11,12],topics:()=>TOPICS,facts:()=>FACTS,greet:'Deneye hazır mısın?',
    titles:['Çaylak Simyacı','Laboratuvar Çırağı','Genç Laborant','Deney Ustası','Kimyager','Baş Kimyager','Molekül Mimarı','Profesör','Nobel Adayı'],
    sections:[{title:'',tiles:[
      {href:'#/quiz',ico:'🎯',t:'Soru Arenası',d:'Görsel şıklı sorular, kombo, can ve jokerlerle yarış!',c1:'#e11d48',c2:'#f59e0b',tag:'OYUN'},
      {href:'#/balance',ico:'⚖️',t:'Denkleştirme Lab.',d:'Katsayıları ayarla, kütle terazisini dengele.',c1:'#7c3aed',c2:'#2563eb',tag:'SİMÜLASYON'},
      {href:'#/atom',ico:'⚛️',t:'Atom Kurucu',d:'Proton, nötron, elektron ekle; izotop ve iyon yap.',c1:'#0891b2',c2:'#10b981',tag:'SİMÜLASYON'},
      {href:'#/orbital',ico:'🌀',t:'Orbital Yerleşimi',d:'Aufbau, Pauli ve Hund: elektronları orbitallere yerleştir!',c1:'#4f46e5',c2:'#db2777',tag:'SİMÜLASYON'},
      {href:'#/simetri',ico:'💎',t:'Küresel Simetri',d:'s¹, s², p³, p⁶, d⁵, d¹⁰: hangi atomlar küre gibi dengeli? Keşfet ve avla!',c1:'#0ea5e9',c2:'#6366f1',tag:'9. SINIF'},
      {href:'#/grup',ico:'🔍',t:'Grup Bul',d:'Elektron diziliminden periyodu ve grubu bul, boş tabloya yerleştir!',c1:'#16a34a',c2:'#0d9488',tag:'9. SINIF'},
      {href:'#/ph',ico:'💧',t:'pH Laboratuvarı',d:'Asit-baz damlat, indikatör renklerini keşfet.',c1:'#db2777',c2:'#9333ea',tag:'SİMÜLASYON'},
      {href:'#/gas',ico:'🎈',t:'Gaz Simülatörü',d:'Sıcaklık, hacim, basınç: tanecikler nasıl davranır?',c1:'#ea580c',c2:'#dc2626',tag:'SİMÜLASYON'},
      {href:'#/admin',ico:'🛠️',t:'Öğretmen Paneli',d:'Kendi sorularını, şıklarını ve denklemlerini ekle.',c1:'#334155',c2:'#475569',tag:'ÖĞRETMEN'},
    ]}],
    routes:['balance','atom','orbital','simetri','grup','ph','gas'],
  },
  matematik:{
    id:'matematik',name:'Matematik',icon:'📐',mascot:'Piko',c1:'#f59e0b',c2:'#ef4444',
    level:'İlkokul 1–4 · Lise 9–12',desc:'Balonlar, pizzalar, saatler, grafikler ve denklem terazisi.',
    grades:[1,2,3,4,9,10,11,12],topics:()=>MATH_TOPICS,facts:()=>MATH_FACTS,greet:'Sayılarla oynamaya hazır mısın?',
    titles:['Sayı Çırağı','Hesap Kurdu','Problem Avcısı','Formül Ustası','Matematikçi','Baş Matematikçi','Teorem Mimarı','Profesör','Fields Adayı'],
    sections:[
      {title:'🧒 İlkokul (1–4. sınıf)',tiles:[
        {href:'#/mbalon',ico:'🎈',t:'Balon Patlat',d:'Doğru cevaplı balonu kaçmadan patlat! Toplama, çıkarma, çarpma, bölme.',c1:'#0ea5e9',c2:'#22c55e',tag:'1–4. SINIF'},
        {href:'#/mpizza',ico:'🍕',t:'Kesir Pizzacısı',d:'Müşterilerin istediği kesir kadar pizza hazırla!',c1:'#f97316',c2:'#dc2626',tag:'3–4. SINIF'},
        {href:'#/msaat',ico:'⏰',t:'Saat Ustası',d:'Akrebi ve yelkovanı sürükle, saati oku.',c1:'#8b5cf6',c2:'#ec4899',tag:'1–3. SINIF'},
      ]},
      {title:'🎓 Lise (9–12. sınıf)',tiles:[
        {href:'#/mgrafik',ico:'📈',t:'Grafik Nişancısı',d:'Fonksiyonun katsayılarını ayarla, tüm yıldızları vur!',c1:'#2563eb',c2:'#7c3aed',tag:'9–11. SINIF'},
        {href:'#/mdenklem',ico:'⚖️',t:'Denklem Terazisi',d:'İki tarafa aynı işlemi yap, x\'i yalnız bırak.',c1:'#059669',c2:'#0891b2',tag:'9. SINIF'},
      ]},
      {title:'🌟 Herkes için',tiles:[
        {href:'#/quiz',ico:'🎯',t:'Soru Arenası',d:'Kesir, saat, grafik ve şekilli görsel sorular!',c1:'#e11d48',c2:'#f59e0b',tag:'OYUN'},
        {href:'#/admin',ico:'🛠️',t:'Öğretmen Paneli',d:'Kendi matematik sorularını ekle.',c1:'#334155',c2:'#475569',tag:'ÖĞRETMEN'},
      ]},
    ],
    routes:['mbalon','mpizza','msaat','mgrafik','mdenklem'],
  },
};
const COMING_SOON=[
  {icon:'🧲',name:'Fizik',c1:'#64748b'},
  {icon:'🌿',name:'Biyoloji',c1:'#64748b'},
  {icon:'🌍',name:'Coğrafya',c1:'#64748b'},
];
const THEMES={
  defter:{name:'Okul defteri',desc:'Kareli kâğıt, mürekkep ve kırmızı kalem',bg:'#fbfaf3',ink:'#1f3a93',pen:'#c0392b',bars:['#1f3a93','#c0392b','#2e7d32'],font:"'Caveat',cursive"},
  tahta:{name:'Kara tahta',desc:'Tebeşir yazısı ve renkli tebeşirler',bg:'#2b4a3f',ink:'#f3f1e6',pen:'#f4e285',bars:['#f2a7b8','#9ad0ec','#b5e3a1'],font:"'Patrick Hand',cursive"},
  duz:{name:'Düz ve cesur',desc:'Kalın çizgiler, düz renk blokları',bg:'#fff6e6',ink:'#141414',pen:'#ff6b4a',bars:['#ff6b4a','#4d7cff','#ffc93c'],font:"'Bricolage Grotesque',sans-serif"},
};

const BADGES = [
  {id:'first',sub:'all',icon:'🎯',name:'İlk İsabet',desc:'İlk doğru cevabını ver'},
  {id:'combo5',sub:'all',icon:'🔥',name:'Alev Alev',desc:'5\'li kombo yap'},
  {id:'perfect',sub:'all',icon:'💎',name:'Kusursuz',desc:'En az 5 soruluk bir turu hatasız bitir'},
  {id:'scholar',sub:'all',icon:'📚',name:'Bilgin',desc:'Toplam 50 doğru cevap ver'},
  {id:'balance5',sub:'kimya',icon:'⚖️',name:'Lavoisier\'in Varisi',desc:'5 denklemi denkleştir'},
  {id:'balanceAll',sub:'kimya',icon:'🏆',name:'Denkleştirme Ustası',desc:'Tüm denklemleri denkleştir'},
  {id:'atom5',sub:'kimya',icon:'⚛️',name:'Atom Çırağı',desc:'5 atom görevini tamamla'},
  {id:'atomAll',sub:'kimya',icon:'🧬',name:'Atom Mimarı',desc:'Tüm atom görevlerini tamamla'},
  {id:'orb5',sub:'kimya',icon:'🌀',name:'Orbital Çırağı',desc:'5 orbital seviyesini tamamla'},
  {id:'orbAll',sub:'kimya',icon:'🧲',name:'Hund\'un Varisi',desc:'Tüm orbital seviyelerini tamamla'},
  {id:'sym30',sub:'kimya',icon:'💎',name:'Küre Ustası',desc:'Küresel Simetri avında 30/30 yap'},
  {id:'grup10',sub:'kimya',icon:'🗂️',name:'Periyodik Haritacı',desc:'Grup Bul\'da 10/10 yap'},
  {id:'ph',sub:'kimya',icon:'🧪',name:'pH Dedektifi',desc:'Bir asidi nötralleştir'},
  {id:'phAll',sub:'kimya',icon:'🌈',name:'İndikatör Ustası',desc:'Tüm pH görevlerini tamamla'},
  {id:'gasAll',sub:'kimya',icon:'🎈',name:'Gaz Kaşifi',desc:'Tüm gaz görevlerini tamamla'},
  {id:'balloon20',sub:'matematik',icon:'🎈',name:'Balon Avcısı',desc:'Balon Patlat\'ta tek oyunda 20 doğru'},
  {id:'pizza10',sub:'matematik',icon:'🍕',name:'Usta Pizzacı',desc:'Tek oyunda 10 sipariş teslim et'},
  {id:'clock10',sub:'matematik',icon:'⏰',name:'Zaman Bükücü',desc:'Saat Ustası\'nda 10/10 yap'},
  {id:'graph5',sub:'matematik',icon:'🎯',name:'Keskin Nişancı',desc:'5 grafik seviyesini tamamla'},
  {id:'graphAll',sub:'matematik',icon:'📈',name:'Fonksiyon Ustası',desc:'Tüm grafik seviyelerini tamamla'},
  {id:'eq5',sub:'matematik',icon:'⚖️',name:'Cebir Çırağı',desc:'5 denklem terazisi seviyesini tamamla'},
  {id:'eqAll',sub:'matematik',icon:'🧮',name:'Denklem Ustası',desc:'Tüm denklem seviyelerini tamamla'},
];

/* ---------- Uygulama durumu: seçili ders ---------- */
const App = {
  theme(){const t=Store.settings().theme;return THEMES[t]?t:'defter';},
  setTheme(t){
    if(!THEMES[t]) return;
    document.documentElement.setAttribute('data-theme',t);
    const s=Store.settings();s.theme=t;Store.saveSettings(s);
  },
  pickTheme(){
    const cur=this.theme();
    UI.modal({title:'🎨 Tema seç',html:`<p class="muted" style="margin-top:0">Görünümü istediğin zaman değiştirebilirsin; ilerlemen etkilenmez.</p>
      <div class="theme-pick">${Object.entries(THEMES).map(([k,t])=>`<button class="theme-card ${k===cur?'active':''}" data-t="${k}">
        <div class="tp" style="background:${t.bg};color:${t.ink}"><b style="font-family:${t.font};color:${t.ink}">Aa <span style="color:${t.pen}">3/4</span></b>${t.bars.map((c,i)=>`<i style="background:${c};width:${90-i*20}%"></i>`).join('')}</div>
        <div class="tn"><div>${t.name}<small>${t.desc}</small></div></div></button>`).join('')}</div>`,
      buttons:[{label:'Kapat',cls:'btn-ghost'}],
      onOpen:(el)=>{$$('.theme-card',el).forEach(b=>b.onclick=()=>{this.setTheme(b.dataset.t);$$('.theme-card',el).forEach(x=>x.classList.toggle('active',x===b));FX.sfx.pop();});}});
  },
  /* Elektron dönme animasyonu: varsayılan kapalı, düğmeyle açılır, tercih hatırlanır */
  spinOn(){return !!Store.settings().spin;},
  spinLabel(){return this.spinOn()?'⏸ Elektronları durdur':'▶ Elektronları döndür';},
  spinButton(){return `<button class="btn btn-sm btn-ghost spin-toggle" type="button" aria-pressed="${this.spinOn()}">${this.spinLabel()}</button>`;},
  setSpin(v){
    const s=Store.settings();s.spin=!!v;Store.saveSettings(s);
    document.documentElement.toggleAttribute('data-spin',!!v);
    $$('.spin-toggle').forEach(b=>{b.innerHTML=this.spinLabel();b.setAttribute('aria-pressed',!!v);});
  },
  subjectId(){const s=Store.settings().subject;return SUBJECTS[s]?s:null;},
  subject(){return SUBJECTS[this.subjectId()||'kimya'];},
  setSubject(id){
    if(!SUBJECTS[id]) return;
    const s=Store.settings();s.subject=id;Store.saveSettings(s);
    this.applyBrand();
  },
  applyBrand(){
    const S=this.subject(),chosen=!!this.subjectId();
    $('#brand-icon').textContent=chosen?S.icon:'🎓';
    $('#brand-sub').textContent=chosen?S.name:'';
    document.title=chosen?'Dersbaz — '+S.name:'Dersbaz — Dersi oyuna çevir!';
    Game.refreshHUD();
  },
};

const Game = {
  levelOf(xp){let L=1;while(xp>=50*L*(L+1)) L++;return L;},
  levelInfo(xp){
    const L=this.levelOf(xp);const lo=50*(L-1)*L,hi=50*L*(L+1);
    const T=App.subject().titles;
    return {L,title:T[Math.min(L-1,T.length-1)],pct:(xp-lo)/(hi-lo)*100,toNext:hi-xp};
  },
  addXP(p,n){
    const before=this.levelOf(p.xp);p.xp+=n;const after=this.levelOf(p.xp);
    if(after>before) setTimeout(()=>{FX.sfx.win();FX.confetti(120);UI.toast(`<div class="tb"><span class="bi">🆙</span><div><b>Seviye ${after}!</b><br>${this.levelInfo(p.xp).title}</div></div>`,'gold',4500);},1200);
  },
  award(p,id){
    if(p.badges.includes(id)) return;
    p.badges.push(id);
    const b=BADGES.find(x=>x.id===id);if(!b) return;
    setTimeout(()=>{FX.sfx.badge();UI.toast(`<div class="tb"><span class="bi">${b.icon}</span><div><b>Yeni rozet: ${b.name}</b><br><span class="muted">${b.desc}</span></div></div>`,'gold',4500);},700);
  },
  recordAnswer(ok,streak){
    const p=Store.profile();
    p.stats.answered++;
    if(ok){p.stats.correct++;this.award(p,'first');if(streak>=5) this.award(p,'combo5');if(p.stats.correct>=50) this.award(p,'scholar');}
    p.stats.bestCombo=Math.max(p.stats.bestCombo,streak);
    Store.saveProfile(p);
  },
  finishQuiz({score,perfect,xp}){
    const p=Store.profile();const sub=App.subject().id;
    p.stats.games++;
    const prev=p.bestBy[sub]||0;
    const newBest=score>prev;if(newBest) p.bestBy[sub]=score;
    p.best=Math.max(p.best,score);
    if(perfect) this.award(p,'perfect');
    this.addXP(p,xp);Store.saveProfile(p);this.refreshHUD();
    return {score,best:p.bestBy[sub]||0,newBest:newBest&&score>0};
  },
  /* Seviyeli oyunlar (yıldız) */
  finishLevel(game,lvl,stars,total,badgeSome,badgeAll,someN=5){
    const p=Store.profile();
    p.levels[game]=p.levels[game]||{};
    const prev=p.levels[game][lvl]||0;
    const xp=prev?Math.max(0,(stars-prev)*10)+5:20+stars*10;
    p.levels[game][lvl]=Math.max(prev,stars);
    const n=Object.keys(p.levels[game]).length;
    if(badgeSome&&n>=someN) this.award(p,badgeSome);
    if(badgeAll&&n>=total) this.award(p,badgeAll);
    this.addXP(p,xp);Store.saveProfile(p);this.refreshHUD();
    return {xp};
  },
  levelStars(game){return Store.profile().levels[game]||{};},
  /* Puanlı oyunlar (rekor) */
  finishArcade(game,{score,xp,badge}){
    const p=Store.profile();
    p.games[game]=p.games[game]||{best:0,plays:0};
    const g=p.games[game];g.plays++;
    const newBest=score>g.best;if(newBest) g.best=score;
    if(badge) this.award(p,badge);
    this.addXP(p,xp);Store.saveProfile(p);this.refreshHUD();
    return {best:g.best,newBest:newBest&&score>0};
  },
  finishBalance(id,stars,total){
    const p=Store.profile();
    const prev=p.balance[id]||0;
    const xp=prev?Math.max(0,(stars-prev)*10)+5:20+stars*10;
    p.balance[id]=Math.max(prev,stars);
    const n=Object.keys(p.balance).length;
    if(n>=5) this.award(p,'balance5');
    if(n>=total) this.award(p,'balanceAll');
    this.addXP(p,xp);Store.saveProfile(p);this.refreshHUD();
    return {xp};
  },
  finishAtom(id,total){
    const p=Store.profile();
    if(!p.atomDone.includes(id)){p.atomDone.push(id);this.addXP(p,15);}
    if(p.atomDone.length>=5) this.award(p,'atom5');
    if(p.atomDone.length>=total) this.award(p,'atomAll');
    Store.saveProfile(p);this.refreshHUD();
  },
  finishOrbital(id,stars,total){
    const p=Store.profile();
    const prev=p.orbital[id]||0;
    const xp=prev?Math.max(0,(stars-prev)*10)+5:20+stars*10;
    p.orbital[id]=Math.max(prev,stars);
    const n=Object.keys(p.orbital).length;
    if(n>=5) this.award(p,'orb5');
    if(n>=total) this.award(p,'orbAll');
    this.addXP(p,xp);Store.saveProfile(p);this.refreshHUD();
    return {xp};
  },
  finishPH(id,total){
    const p=Store.profile();
    if(!p.phDone.includes(id)){p.phDone.push(id);this.addXP(p,20);}
    if(id==='p1') this.award(p,'ph');
    if(p.phDone.length>=total) this.award(p,'phAll');
    Store.saveProfile(p);this.refreshHUD();
  },
  finishGas(id,total){
    const p=Store.profile();
    if(!p.gasDone.includes(id)){p.gasDone.push(id);this.addXP(p,15);}
    if(p.gasDone.length>=total) this.award(p,'gasAll');
    Store.saveProfile(p);this.refreshHUD();
  },
  refreshHUD(){
    const p=Store.profile();const li=this.levelInfo(p.xp);
    $('#pname').textContent=p.name||'Oyuncu';
    $('#avatar').textContent=p.avatar||'🧑‍🔬';
    $('#plevel').textContent=`Seviye ${li.L} · ${li.title} · ${p.xp} XP`;
    $('#xpfill').style.width=li.pct+'%';
  },
  editProfile(first=false){
    const p=Store.profile();
    const AV=['🧑‍🔬','👩‍🔬','👨‍🔬','🧑‍🎓','👩‍🎓','🧪','📐','🦊','🐼','🐱','🦉','🤖','🚀','🦄'];
    let av=p.avatar;
    UI.modal({title:first?'👋 Hoş geldin!':'👤 Profil',dismiss:!first,
      html:`<p class="muted">${first?'Oyuna başlamadan önce kendini tanıt!':'Adını ve avatarını değiştirebilirsin.'}</p>
        <input class="inp" id="pn" maxlength="24" placeholder="Adın (örn: Elif)" value="${esc(p.name)}" style="font-size:20px">
        <div class="avatar-pick">${AV.map(a=>`<button type="button" class="${a===av?'active':''}" data-a="${a}">${a}</button>`).join('')}</div>`,
      onOpen:(el)=>{
        $$('.avatar-pick button',el).forEach(b=>b.onclick=()=>{av=b.dataset.a;$$('.avatar-pick button',el).forEach(x=>x.classList.toggle('active',x===b));FX.sfx.pop();});
        setTimeout(()=>$('#pn',el).focus(),100);
      },
      buttons:[{label:first?'Başlayalım! 🚀':'Kaydet',cls:'btn-good',onClick:(el)=>{
        const q=Store.profile();q.name=$('#pn',el).value.trim()||'Oyuncu';q.avatar=av;Store.saveProfile(q);this.refreshHUD();
        if(['menu','dersler'].includes(Router.current())) Router.go();
      }}]});
  }
};

/* ---------- Ders seçimi ---------- */
const SubjectPicker = {
  mount(app){
    const p=Store.profile();
    app.innerHTML=`<section class="screen subjects">
      <div class="subj-hero"><h1>Merhaba ${esc(p.name||'')}! <span>Bugün hangi dersi oynamak istersin?</span></h1>
        <p class="sub">Bir ders seç; o dersin oyunları ve simülasyonlarıyla baş başa kal. Dersi istediğin zaman üstteki 📚 düğmesinden değiştirebilirsin.</p></div>
      <div class="subj-grid">
        ${Object.values(SUBJECTS).map(S=>{
          const games=S.sections.reduce((t,s)=>t+s.tiles.filter(x=>!x.href.includes('admin')).length,0);
          return `<button class="subj-card" data-s="${S.id}" style="--c1:${S.c1};--c2:${S.c2}">
            <span class="subj-ico">${S.icon}</span>
            <span class="subj-name">${S.name}</span>
            <span class="subj-level">${S.level}</span>
            <span class="subj-desc">${S.desc}</span>
            <span class="subj-count">🎮 ${games} oyun · 🦸 Maskot: ${S.mascot}</span>
          </button>`;}).join('')}
        ${COMING_SOON.map(c=>`<div class="subj-card soon" style="--c1:${c.c1}"><span class="subj-ico">${c.icon}</span><span class="subj-name">${c.name}</span><span class="subj-level">Yakında</span></div>`).join('')}
      </div>
    </section>`;
    $$('.subj-card[data-s]',app).forEach(b=>{
      b.addEventListener('mouseenter',()=>FX.sfx.bubble());
      b.onclick=()=>{FX.sfx.pop();FX.celebrate(b);App.setSubject(b.dataset.s);setTimeout(()=>Router.nav('menu'),250);};
    });
  }
};

/* ---------- Ders menüsü ---------- */
const Menu = {
  mount(app){
    const S=App.subject();
    const p=Store.profile();
    const li=Game.levelInfo(p.xp);
    const facts=S.facts();
    const fact=facts[Math.floor(Math.random()*facts.length)];
    const acc=p.stats.answered?Math.round(p.stats.correct/p.stats.answered*100):0;
    const badges=BADGES.filter(b=>b.sub==='all'||b.sub===S.id);
    const owned=badges.filter(b=>p.badges.includes(b.id)).length;
    const tile=t=>`<a class="mode-tile" href="${t.href}" style="--c1:${t.c1};--c2:${t.c2}"><span class="tagline">${t.tag}</span><span class="ico">${t.ico}</span><h3>${t.t}</h3><p>${t.d}</p></a>`;
    let extra;
    if(S.id==='kimya') extra=`<div class="mini-stat"><b>${Object.keys(p.balance).length}</b><span>Denkleşen denklem</span></div>`;
    else{
      const st=['mgrafik','mdenklem'].reduce((t,g)=>t+Object.values(p.levels[g]||{}).reduce((a,b)=>a+b,0),0);
      extra=`<div class="mini-stat"><b>${st} ⭐</b><span>Toplanan yıldız</span></div>`;
    }
    app.innerHTML=`<section class="screen menu">
      <div class="hero">
        ${Mascot.svg('happy')}
        <div><h1>Merhaba ${esc(p.name||'')}! <span>${S.greet}</span></h1>
          <p>${S.icon} <b>${S.name}</b> · Seviye ${li.L} · <b>${li.title}</b> — sonraki seviyeye ${li.toNext} XP kaldı.</p>
          <a class="btn switch-subj" href="#/dersler">📚 Dersi değiştir<span class="switch-to">${Object.values(SUBJECTS).filter(o=>o.id!==S.id).map(o=>o.icon+' '+o.name).join(' · ')}</span></a></div>
        <div class="panel fact"><b>💡 Biliyor muydun?</b>${esc(fact)}</div>
      </div>
      ${S.sections.map(sec=>`${sec.title?`<h2 class="sec-title">${sec.title}</h2>`:''}<div class="mode-grid">${sec.tiles.map(tile).join('')}</div>`).join('')}
      <div class="menu-lower">
        <div class="panel"><h3>🏅 Rozetler (${owned}/${badges.length})</h3><div class="badges">${badges.map(b=>`<div class="badge ${p.badges.includes(b.id)?'':'locked'}" title="${esc(b.desc)}"><div class="bi">${b.icon}</div>${esc(b.name)}</div>`).join('')}</div></div>
        <div class="panel"><h3>📊 İstatistikler</h3><div class="stats-list">
          <div class="mini-stat"><b>${p.bestBy[S.id]||0}</b><span>Arena rekoru</span></div>
          <div class="mini-stat"><b>%${acc}</b><span>Doğruluk</span></div>
          <div class="mini-stat"><b>${p.stats.correct}</b><span>Doğru cevap</span></div>
          ${extra}
        </div></div>
      </div>
    </section>`;
    $$('.mode-tile',app).forEach(t=>t.addEventListener('mouseenter',()=>FX.sfx.bubble()));
  }
};

/* ---------- Yönlendirici ---------- */
const Router = (()=>{
  const screens={dersler:SubjectPicker,menu:Menu,quiz:Quiz,admin:Admin,
    balance:Balance,atom:AtomBuilder,orbital:Orbital,simetri:KSimetri,grup:KGrup,ph:PHLab,gas:GasSim,
    mbalon:MBalloon,mpizza:MPizza,msaat:MClock,mgrafik:MGraph,mdenklem:MEquation};
  let current=null,forced=null;
  const parse=h=>(String(h||'').replace(/^#\/?/,'')).split('?')[0];
  const currentName=()=>{
    const n=forced||parse(location.hash);
    if(n) return n;
    return App.subjectId()?'menu':'dersler';
  };
  // Bazı ortamlarda (dosyadan/önizlemeden açılan sayfa) adres çubuğu değişmez; o zaman doğrudan geçiş yaparız.
  function nav(h){
    const name=parse(h)||'menu', before=location.hash;
    try{location.hash='#/'+name;}catch(e){}
    if(location.hash===before||parse(location.hash)!==name){forced=name;go();}
    else forced=null;
  }
  document.addEventListener('click',e=>{
    const a=e.target.closest&&e.target.closest('a[href^="#/"]');
    if(!a||e.ctrlKey||e.metaKey) return;
    e.preventDefault();nav(a.getAttribute('href'));
  });
  function go(){
    let name=currentName();
    if(name==='menu'&&!App.subjectId()) name='dersler';
    const owner=Object.values(SUBJECTS).find(S=>S.routes.includes(name));
    if(owner&&owner.id!==App.subjectId()) App.setSubject(owner.id);
    const scr=screens[name]||Menu;
    if(current&&current.unmount) current.unmount();
    $$('.feedback,.modal-back,.banner,.speech').forEach(f=>f.remove());
    const app=$('#app');app.innerHTML='';
    window.scrollTo(0,0);
    current=scr;
    try{scr.mount(app);}catch(err){console.error(err);app.innerHTML=`<div class="panel">Bir hata oluştu: ${esc(err.message)}</div>`;}
  }
  addEventListener('hashchange',()=>{forced=null;go();});
  return {go,nav,current:currentName};
})();

/* ---------- Başlat ---------- */
(function init(){
  App.applyBrand();
  const sb=$('#btn-sound');
  const syncSound=()=>{sb.textContent=FX.soundOn?'🔊':'🔇';};
  syncSound();
  sb.onclick=()=>{FX.setSound(!FX.soundOn);syncSound();FX.sfx.click();};
  $('#btn-full').onclick=()=>{
    if(document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.().catch(()=>UI.toast('Tam ekran desteklenmiyor.','bad'));
  };
  $('#player-chip').onclick=()=>Game.editProfile(false);
  $('#btn-theme').onclick=()=>App.pickTheme();
  document.documentElement.setAttribute('data-theme',App.theme());
  document.documentElement.toggleAttribute('data-spin',App.spinOn());
  document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.spin-toggle')){App.setSpin(!App.spinOn());FX.sfx.click();}});
  Iconify.start();
  Router.go();
  if(!Store.persistent) setTimeout(()=>UI.toast('⚠️ Bu tarayıcı, dosyadan açılan sayfalarda kayıt yapmaya izin vermiyor. Oyun çalışır ama ilerleme ve eklenen sorular sayfa kapanınca silinir.','gold',8000),1200);
  if(!Store.profile().name) setTimeout(()=>Game.editProfile(true),400);
})();
