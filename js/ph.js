'use strict';
/* =========================================================
   pH Laboratuvarı — titrasyon ve indikatör simülasyonu
   Model: kuvvetli asit (HCl) / kuvvetli baz (NaOH), 25 °C
   ========================================================= */
const PH_START = {
  water:{name:'💧 Saf su (50 mL)',V:.05,pH:7},
  hcl:{name:'🧪 HCl çözeltisi 0,1 M (50 mL)',V:.05,net:.005},
  naoh:{name:'🧪 NaOH çözeltisi 0,1 M (50 mL)',V:.05,net:-.005},
  lemon:{name:'🍋 Limon suyu (≈ pH 2,3)',V:.05,pH:2.3},
  vinegar:{name:'🍶 Sirke (≈ pH 2,9)',V:.05,pH:2.9},
  milk:{name:'🥛 Süt (≈ pH 6,6)',V:.05,pH:6.6},
  soda:{name:'🧁 Kabartma tozu çözeltisi (≈ pH 8,3)',V:.05,pH:8.3},
  soap:{name:'🧼 Sabunlu su (≈ pH 10)',V:.05,pH:10},
  bleach:{name:'🧴 Çamaşır suyu (≈ pH 12,5)',V:.05,pH:12.5},
};
const INDICATORS = {
  none:'İndikatör yok',universal:'Evrensel indikatör',litmus:'Turnusol',phenol:'Fenolftalein',methyl:'Metil oranj',btb:'Bromtimol mavisi'
};
const PH_TASKS = [
  {id:'p1',text:'HCl çözeltisini NaOH ekleyerek **nötralleştir** (pH 6,5–7,5).',check:s=>s.start==='hcl'&&s.pH>=6.5&&s.pH<=7.5},
  {id:'p2',text:'**Fenolftalein** ekle ve çözeltiyi **pembeye** çevir.',check:s=>s.ind==='phenol'&&s.pH>=9},
  {id:'p3',text:'Saf sudan başlayıp asit damlatarak pH\'ı **3**\'e getir (2,8–3,2).',check:s=>s.start==='water'&&s.pH>=2.8&&s.pH<=3.2},
  {id:'p4',text:'**Turnusol** ile bir ev maddesinin bazik olduğunu göster (mavi renk).',check:s=>s.ind==='litmus'&&s.pH>8.3&&['soda','soap','bleach'].includes(s.start)},
];

const PHLab = (()=>{
  let S=null;
  function netFromPH(pH,V){ // net = n(H+) − n(OH−) (mol)
    const H=Math.pow(10,-pH),OH=1e-14/H;return (H-OH)*V;
  }
  function calcPH(net,V){const x=net/V;const H=(x+Math.sqrt(x*x+4e-14))/2;return -Math.log10(H);}
  function lerpColor(a,b,t){const pa=hex(a),pb=hex(b);return `rgb(${pa.map((v,i)=>Math.round(v+(pb[i]-v)*t)).join(',')})`;}
  function hex(h){h=h.replace('#','');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));}
  function stops(st,pH){
    if(pH<=st[0][0]) return lerpColor(st[0][1],st[0][1],0);
    for(let i=1;i<st.length;i++) if(pH<=st[i][0]){const t=(pH-st[i-1][0])/(st[i][0]-st[i-1][0]);return lerpColor(st[i-1][1],st[i][1],t);}
    return lerpColor(st[st.length-1][1],st[st.length-1][1],0);
  }
  function color(ind,pH){
    switch(ind){
      case 'universal':return stops([[1,'#dc2626'],[3,'#f97316'],[5,'#facc15'],[7,'#22c55e'],[9,'#0d9488'],[10.5,'#2563eb'],[12.5,'#6d28d9'],[14,'#581c87']],pH);
      case 'litmus':return stops([[4.5,'#dc2626'],[6.5,'#9d4edd'],[8.3,'#3b82f6']],pH);
      case 'phenol':return stops([[8.2,'#dbeafe'],[10,'#ec4899']],pH);
      case 'methyl':return stops([[3.1,'#ef4444'],[4.4,'#facc15']],pH);
      case 'btb':return stops([[6,'#eab308'],[7,'#22c55e'],[7.6,'#2563eb']],pH);
      default:return '#bae6fd';
    }
  }
  function mount(app){
    S={app,start:'hcl',ind:'universal',V:0,net:0,added:0,hist:[],pH:7,animating:0};
    app.innerHTML=`<section class="screen ph">
      <h1 class="screen-title">🧪 pH Laboratuvarı</h1>
      <p class="sub">Asit ve baz damlat, indikatörün renginin nasıl değiştiğini gözle. Titrasyon eğrini çiz!</p>
      <div class="ph-layout">
        <div class="panel">${labSVG()}
          <div class="ph-meter" style="margin-top:12px"><div class="lcd" id="lcd">7.00</div><div><div class="ph-class" id="phclass">Nötr</div><div class="muted" id="phinfo" style="font-weight:800;font-size:14px"></div></div></div>
          <div class="ph-scale"><div class="marker" id="marker"></div></div>
          <div class="ph-ticks">${Array.from({length:15},(_,i)=>`<span>${i}</span>`).join('')}</div>
          <div class="ph-ticks" style="margin-top:4px"><span>◀ ASİDİK</span><span>NÖTR</span><span>BAZİK ▶</span></div>
        </div>
        <div>
          <div class="panel">
            <span class="lbl">Başlangıç çözeltisi (beherdeki)</span>
            <select class="inp" id="start">${Object.entries(PH_START).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('')}</select>
            <span class="lbl">İndikatör</span>
            <select class="inp" id="ind">${Object.entries(INDICATORS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select>
            <span class="lbl">Bürete göre ekle (0,1 M)</span>
            <div class="ctl-grid">
              <button class="btn btn-danger" data-add="acid" data-ml=".05">💧 1 damla HCl</button>
              <button class="btn btn-primary" data-add="base" data-ml=".05">💧 1 damla NaOH</button>
              <button class="btn btn-danger" data-add="acid" data-ml="1">+1 mL HCl</button>
              <button class="btn btn-primary" data-add="base" data-ml="1">+1 mL NaOH</button>
              <button class="btn btn-danger" data-add="acid" data-ml="5">+5 mL HCl</button>
              <button class="btn btn-primary" data-add="base" data-ml="5">+5 mL NaOH</button>
              <button class="btn btn-cyan" data-add="water" data-ml="10">+10 mL saf su</button>
              <button class="btn btn-ghost" id="reset">↺ Beheri boşalt</button>
            </div>
          </div>
          <div class="panel" style="margin-top:16px"><h3>📈 Titrasyon eğrisi</h3><canvas class="chart" id="chart" width="560" height="260"></canvas></div>
          <div class="panel" style="margin-top:16px"><h3>🎯 Deney görevleri</h3><div class="task-list" id="tasks"></div></div>
        </div>
      </div>
    </section>`;
    $('#start',app).value=S.start;$('#ind',app).value=S.ind;
    $('#start',app).onchange=e=>{S.start=e.target.value;reset();};
    $('#ind',app).onchange=e=>{S.ind=e.target.value;FX.sfx.bubble();FX.bubbles(FX.centerOf($('#beaker')).x,FX.centerOf($('#beaker')).y+30,10);update();};
    $$('[data-add]',app).forEach(b=>b.onclick=()=>add(b.dataset.add,+b.dataset.ml));
    $('#reset',app).onclick=()=>reset();
    reset();
  }
  function reset(){
    const st=PH_START[S.start];
    S.V=st.V;S.net=st.net!=null?st.net:netFromPH(st.pH,st.V);S.added=0;S.hist=[];
    update();S.hist.push([0,S.pH]);drawChart();
  }
  function add(kind,ml){
    if(S.V+ml/1000>.25){UI.toast('⚠️ Beher dolmak üzere (en fazla 250 mL). Beheri boşalt.','bad');return;}
    const L=ml/1000;
    dropAnim(kind,ml);
    setTimeout(()=>{
      if(!S) return;
      S.V+=L;
      if(kind==='acid') S.net+=.1*L;
      else if(kind==='base') S.net-=.1*L;
      if(kind!=='water'){S.added+=ml;}
      update();
      if(kind!=='water'){S.hist.push([S.added,S.pH]);drawChart();}
    },380);
  }
  function update(){
    S.pH=calcPH(S.net,S.V);
    const pH=S.pH;
    $('#lcd').textContent=pH.toFixed(2);
    const cls=pH<3?'Kuvvetli asidik':pH<6.5?'Asidik':pH<=7.5?'Nötr':pH<11?'Bazik':'Kuvvetli bazik';
    const col=pH<6.5?'#f87171':pH<=7.5?'#4ade80':'#60a5fa';
    $('#phclass').textContent=cls;$('#phclass').style.color=col;
    const H=Math.pow(10,-pH);
    $('#phinfo').innerHTML=`Hacim: ${fmtNum(S.V*1000,1)} mL · [H<sup>+</sup>] = ${H.toExponential(1).replace('e',' × 10^').replace(/\^([+-]?\d+)/,(m,e)=>'<sup>'+e+'</sup>')} M`;
    $('#marker').style.left=(clamp(pH,0,14)/14*100)+'%';
    // sıvı
    const liq=$('#liquid');const maxH=150, h=Math.max(8,S.V/.25*maxH);
    liq.setAttribute('y',(388-h).toFixed(1));liq.setAttribute('height',h.toFixed(1));
    liq.style.fill=color(S.ind,pH);
    liq.style.fillOpacity=S.ind==='none'||(S.ind==='phenol'&&pH<8.2)?.45:.85;
    $('#surface').setAttribute('cy',(388-h).toFixed(1));
    $('#surface').style.fill=color(S.ind,pH);
    $('#vol-label').textContent=Math.round(S.V*1000)+' mL';
    renderTasks();
  }
  function renderTasks(){
    const prof=Store.profile();
    let newly=null;
    PH_TASKS.forEach(t=>{if(!prof.phDone.includes(t.id)&&t.check(S)) newly=t;});
    if(newly){Game.finishPH(newly.id,PH_TASKS.length);FX.sfx.win();FX.celebrate($('#beaker'));FX.banner('GÖREV TAMAM!','good','small');}
    const p2=Store.profile();
    $('#tasks').innerHTML=PH_TASKS.map(t=>{const d=p2.phDone.includes(t.id);return `<div class="task ${d?'done':''}"><span class="tk">${d?'✓':''}</span><span>${richText(t.text)}</span></div>`;}).join('');
  }
  function dropAnim(kind,ml){
    const svg=$('#labsvg');if(!svg) return;
    const x=kind==='acid'?205:kind==='base'?315:260;
    const col=kind==='acid'?'#fca5a5':kind==='base'?'#93c5fd':'#e0f2fe';
    const n=ml<1?1:ml<5?3:6;
    const surfaceY=+$('#surface').getAttribute('cy');
    for(let i=0;i<n;i++){
      const d=document.createElementNS('http://www.w3.org/2000/svg','circle');
      d.setAttribute('cx',x);d.setAttribute('cy',kind==='water'?150:196);d.setAttribute('r',ml>=5?6:4.5);d.setAttribute('fill',col);
      svg.appendChild(d);
      const t0=performance.now()+i*60;const y0=kind==='water'?150:196;
      const step=t=>{const k=Math.max(0,(t-t0)/330);d.setAttribute('cy',(y0+(surfaceY-y0)*k*k).toFixed(1));if(k<1) requestAnimationFrame(step); else {d.remove();}};
      requestAnimationFrame(step);
    }
    setTimeout(()=>FX.sfx.drop(),300);
    // burette level
    if(kind!=='water'){
      const lv=$('#lvl-'+kind);const cur=+lv.dataset.v||0;const nv=Math.min(100,cur+ml*.6);lv.dataset.v=nv;
      lv.setAttribute('y',(30+nv*1.2).toFixed(1));lv.setAttribute('height',(120-nv*1.2).toFixed(1));
      if(nv>=100){lv.dataset.v=0;setTimeout(()=>{lv.setAttribute('y',30);lv.setAttribute('height',120);},500);}
    }
  }
  function labSVG(){
    const burette=(x,label,color,id)=>`
      <rect x="${x-9}" y="26" width="18" height="128" rx="4" style="fill:var(--sv-fill);stroke:var(--sv-ink)" stroke-width="2"/>
      <rect id="lvl-${id}" data-v="0" x="${x-7}" y="30" width="14" height="120" rx="2" fill="${color}" opacity=".75" style="transition:y .4s,height .4s"/>
      ${[0,1,2,3,4,5].map(k=>`<line x1="${x-9}" y1="${40+k*20}" x2="${x-2}" y2="${40+k*20}" style="stroke:var(--sv-ink)" stroke-opacity=".5" stroke-width="1"/>`).join('')}
      <rect x="${x-14}" y="156" width="28" height="10" rx="3" fill="#475569"/>
      <path d="M${x-3} 166 h6 l-1 22 h-4z" style="fill:var(--sv-ink)" fill-opacity=".6"/>
      <text x="${x}" y="18" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="600" font-size="14" fill="${color}">${label}</text>`;
    return `<svg class="lab-svg" id="labsvg" viewBox="0 0 520 420">
      <rect x="40" y="398" width="440" height="14" rx="5" fill="#334155"/>
      <rect x="120" y="12" width="6" height="388" fill="#475569"/><rect x="100" y="392" width="46" height="8" rx="3" fill="#475569"/>
      <rect x="120" y="150" width="210" height="6" fill="#475569"/>
      ${burette(205,'HCl','#f87171','acid')}
      ${burette(315,'NaOH','#60a5fa','base')}
      <g id="beaker">
        <clipPath id="bclip"><path d="M172 232 V380 Q172 392 184 392 H336 Q348 392 348 380 V232Z"/></clipPath>
        <g clip-path="url(#bclip)">
          <rect id="liquid" class="liquid" x="160" y="300" width="200" height="100" style="fill:#bae6fd"/>
          <ellipse id="surface" class="liquid" cx="260" cy="300" rx="88" ry="4" opacity=".7"/>
        </g>
        <path d="M166 226 h8 V380 Q174 390 184 390 H336 Q346 390 346 380 V226 h8" fill="none" style="stroke:var(--sv-ink)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
        ${[0,1,2,3,4].map(k=>`<line x1="346" y1="${388-k*30}" x2="334" y2="${388-k*30}" style="stroke:var(--sv-ink)" stroke-opacity=".5" stroke-width="1.5"/><text x="352" y="${392-k*30}" font-size="9" style="fill:var(--sv-ink)" fill-opacity=".7" font-family="Nunito">${k*50}</text>`).join('')}
        <text id="vol-label" x="260" y="412" text-anchor="middle" font-family="Nunito, sans-serif" font-size="12" style="fill:var(--sv-ink)">50 mL</text>
      </g>
      <g><rect x="400" y="120" width="70" height="90" rx="10" fill="#1e293b" stroke="#475569" stroke-width="2"/><rect x="408" y="130" width="54" height="24" rx="4" fill="#03130a"/><text x="435" y="148" text-anchor="middle" font-family="Courier New" font-weight="700" font-size="14" fill="#4ade80">pH</text>
      <circle cx="420" cy="180" r="7" fill="#22c55e"/><circle cx="448" cy="180" r="7" fill="#ef4444"/>
      <path d="M435 210 Q435 240 330 250 L324 360" fill="none" stroke="#94a3b8" stroke-width="3"/><rect x="319" y="340" width="10" height="34" rx="4" fill="#cbd5e1"/></g>
    </svg>`;
  }
  function drawChart(){
    const cv=$('#chart');if(!cv) return;
    const c=cv.getContext('2d');const W=cv.width,H=cv.height,pl=40,pb=30,pt=12,pr=12;
    c.clearRect(0,0,W,H);
    const maxX=Math.max(20,Math.ceil((S.hist.length?S.hist[S.hist.length-1][0]:0)/10)*10);
    const X=v=>pl+v/maxX*(W-pl-pr),Y=v=>pt+(14-v)/14*(H-pt-pb);
    c.font='bold 11px Nunito';c.fillStyle='#a5b4fc';c.strokeStyle='rgba(255,255,255,.1)';c.lineWidth=1;
    for(let p=0;p<=14;p+=2){c.beginPath();c.moveTo(pl,Y(p));c.lineTo(W-pr,Y(p));c.stroke();c.fillText(p,pl-22,Y(p)+4);}
    for(let v=0;v<=maxX;v+=maxX/5){c.fillText(Math.round(v),X(v)-6,H-10);}
    c.fillText('pH',6,14);c.fillText('eklenen asit/baz (mL)',W-150,H-10+0);
    c.setLineDash([5,5]);c.strokeStyle='rgba(74,222,128,.6)';c.beginPath();c.moveTo(pl,Y(7));c.lineTo(W-pr,Y(7));c.stroke();c.setLineDash([]);
    if(S.hist.length){
      c.strokeStyle='#22d3ee';c.lineWidth=3;c.beginPath();
      S.hist.forEach(([v,p],i)=>{i?c.lineTo(X(v),Y(p)):c.moveTo(X(v),Y(p));});c.stroke();
      S.hist.forEach(([v,p])=>{c.fillStyle=color('universal',p);c.beginPath();c.arc(X(v),Y(p),3.5,0,Math.PI*2);c.fill();});
    }
  }
  function unmount(){S=null;}
  return {mount,unmount};
})();
