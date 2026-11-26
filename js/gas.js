'use strict';
/* =========================================================
   Gaz Simülatörü — kinetik molekül kuramı, P-V-T-n ilişkisi
   ========================================================= */
const GAS_TYPES = {
  He:{name:'Helyum (He)',M:4,color:'#67e8f9',r:4},
  Ne:{name:'Neon (Ne)',M:20,color:'#fb923c',r:5},
  N2:{name:'Azot (N₂)',M:28,color:'#60a5fa',r:5.5},
  CO2:{name:'Karbon dioksit (CO₂)',M:44,color:'#a3a3a3',r:6.5},
};
const GAS_TASKS = [
  {id:'g1',text:'Basıncı **3 atm**\'nin üzerine çıkar.',check:s=>s.P>3},
  {id:'g2',text:'Basıncı **0,5 atm**\'nin altına düşür.',check:s=>s.P<.5&&s.N>0},
  {id:'g3',text:'Gazı **900 K** veya üzerine ısıt; taneciklerin hızlandığını gözle.',check:s=>s.T>=900},
  {id:'g4',text:'Gaz türünü değiştir: hafif ve ağır gazların hızlarını karşılaştır.',check:s=>s.gasChanged},
];

const GasSim = (()=>{
  let S=null,raf=null;
  const W=720,H=400,WALL=14;
  const SPEED=0.29*60; // piksel/s ölçeği
  function sigma(){return SPEED*Math.sqrt(S.T/GAS_TYPES[S.gas].M);}
  function rayleigh(sg){return sg*Math.sqrt(-2*Math.log(1-Math.random()));}
  function right(){return WALL+S.Vf*(W-2*WALL-40);}
  function addP(){
    const sp=rayleigh(sigma()),a=Math.random()*Math.PI*2,r=GAS_TYPES[S.gas].r;
    S.parts.push({x:WALL+r+Math.random()*(right()-WALL-2*r),y:WALL+r+Math.random()*(H-2*WALL-2*r),vx:Math.cos(a)*sp,vy:Math.sin(a)*sp});
  }
  function mount(app){
    S={app,T:300,Vf:1,N:60,gas:'He',parts:[],imp:0,win:0,ratio:1,P:1,gasChanged:false,last:performance.now()};
    app.innerHTML=`<section class="screen gas">
      <h1 class="screen-title">🎈 Gaz Simülatörü</h1>
      <p class="sub">Sıcaklığı, hacmi ve tanecik sayısını değiştir; basınç nasıl değişiyor? Tanecik renkleri hızı gösterir: <span style="color:#60a5fa">mavi = yavaş</span>, <span style="color:#f87171">kırmızı = hızlı</span>.</p>
      <div class="gas-layout">
        <div class="panel"><canvas id="gas-canvas" width="${W}" height="${H}"></canvas>
          <div class="readouts">
            <div class="readout"><span>BASINÇ (P)</span><b id="rP">1,00 atm</b></div>
            <div class="readout"><span>HACİM (V)</span><b id="rV">2,50 L</b></div>
            <div class="readout"><span>SICAKLIK (T)</span><b id="rT">300 K</b></div>
            <div class="readout"><span>MOL (n)</span><b id="rN">0,100</b></div>
          </div>
          <div style="margin-top:14px"><h3 style="margin:0 0 8px;font-size:16px">📊 Tanecik hız dağılımı</h3><canvas class="chart" id="hist" width="700" height="150"></canvas></div>
        </div>
        <div>
          <div class="panel">
            <svg class="gauge" viewBox="0 0 220 190" id="gauge"><rect x="0" y="0" width="220" height="190" rx="18" fill="#0f1a2e"/>
              <defs><linearGradient id="gg"><stop offset="0" stop-color="#22c55e"/><stop offset=".6" stop-color="#facc15"/><stop offset="1" stop-color="#ef4444"/></linearGradient></defs>
              <path d="M53.4 166.6 A80 80 0 1 1 166.6 166.6" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="16" stroke-linecap="round"/>
              <path d="M53.4 166.6 A80 80 0 1 1 166.6 166.6" fill="none" stroke="url(#gg)" stroke-width="16" stroke-dasharray="4 3"/>
              ${[0,1,2,3,4,5,6].map(v=>{const a=(135+v*45)*Math.PI/180;return `<text x="${(110+Math.cos(a)*56).toFixed(1)}" y="${(110+Math.sin(a)*56+4).toFixed(1)}" text-anchor="middle" font-size="12" font-family="Nunito, sans-serif" fill="#cbd5e1">${v}</text>`;}).join('')}
              <g id="needleG" style="transition:transform .3s;transform-origin:110px 110px"><line x1="110" y1="110" x2="110" y2="42" stroke="#f43f5e" stroke-width="4" stroke-linecap="round"/></g>
              <circle cx="110" cy="110" r="9" fill="#e2e8f0"/><text x="110" y="182" text-anchor="middle" font-family="Nunito, sans-serif" font-size="13" fill="#a5b4fc">atm</text>
            </svg>
            <div class="slider-row"><label>🌡️ Sıcaklık <b id="lT">300 K</b></label><input type="range" id="sT" min="100" max="1000" step="10" value="300"></div>
            <div class="slider-row"><label>📦 Hacim (piston) <b id="lV">2,50 L</b></label><input type="range" id="sV" min="25" max="100" step="1" value="100"></div>
            <div class="slider-row"><label>⚪ Tanecik sayısı <b id="lN">60</b></label><input type="range" id="sN" min="0" max="180" step="5" value="60"></div>
            <span class="lbl">Gaz türü</span>
            <select class="inp" id="sG">${Object.entries(GAS_TYPES).map(([k,v])=>`<option value="${k}">${v.name} — ${v.M} g/mol</option>`).join('')}</select>
            <div class="btn-row" style="margin-top:12px"><button class="btn btn-sm btn-danger" id="heat">🔥 Isıt</button><button class="btn btn-sm btn-cyan" id="cool">❄️ Soğut</button><button class="btn btn-sm btn-ghost" id="greset">↺ Sıfırla</button></div>
          </div>
          <div class="panel" style="margin-top:16px"><div class="law-box" id="laws"></div></div>
          <div class="panel" style="margin-top:16px"><h3>🎯 Görevler</h3><div class="task-list" id="gtasks"></div></div>
        </div>
      </div>
    </section>`;
    for(let i=0;i<S.N;i++) addP();
    $('#sT').oninput=e=>setT(+e.target.value);
    $('#sV').oninput=e=>{S.Vf=+e.target.value/100;};
    $('#sN').oninput=e=>{const n=+e.target.value;S.N=n;while(S.parts.length<n) addP();S.parts.length=n;};
    $('#sG').onchange=e=>{const old=GAS_TYPES[S.gas].M;S.gas=e.target.value;const f=Math.sqrt(old/GAS_TYPES[S.gas].M);S.parts.forEach(p=>{p.vx*=f;p.vy*=f;});S.gasChanged=true;FX.sfx.pop();};
    $('#heat').onclick=()=>{setT(Math.min(1000,S.T+100));FX.sfx.up();};
    $('#cool').onclick=()=>{setT(Math.max(100,S.T-100));FX.sfx.down();};
    $('#greset').onclick=()=>{GasSim.unmount();mount(app);};
    S.last=performance.now();
    raf=requestAnimationFrame(loop);
    renderTasks();
  }
  function setT(t){
    const f=Math.sqrt(t/S.T);S.T=t;S.parts.forEach(p=>{p.vx*=f;p.vy*=f;});
    $('#sT').value=t;
  }
  function loop(now){
    if(!S||!$('#gas-canvas')) return;
    let dt=Math.min(1/30,(now-S.last)/1000);S.last=now;
    const sub=2;dt/=sub;
    const g=GAS_TYPES[S.gas],r=g.r,R=right();
    for(let k=0;k<sub;k++) physics(dt,r,R,g.M);
    S.win+=dt*sub;
    if(S.win>=.3){
      const A=(R-WALL)*(H-2*WALL);
      const sg=sigma();
      const expected=S.N*g.M*sg*sg/A;
      const perim=2*((R-WALL)+(H-2*WALL));
      const measured=S.imp/(S.win*perim);
      const ratio=expected>0?measured/expected:0;
      S.ratio=S.ratio*.6+ratio*.4;
      S.imp=0;S.win=0;
      readouts();
    }
    draw(r,R,g);
    raf=requestAnimationFrame(loop);
  }
  function physics(dt,r,R,M){
    const ps=S.parts;
    for(const p of ps){
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.x<WALL+r){p.x=WALL+r;S.imp+=2*M*Math.abs(p.vx);p.vx=Math.abs(p.vx);}
      if(p.x>R-r){p.x=R-r;S.imp+=2*M*Math.abs(p.vx);p.vx=-Math.abs(p.vx);}
      if(p.y<WALL+r){p.y=WALL+r;S.imp+=2*M*Math.abs(p.vy);p.vy=Math.abs(p.vy);}
      if(p.y>H-WALL-r){p.y=H-WALL-r;S.imp+=2*M*Math.abs(p.vy);p.vy=-Math.abs(p.vy);}
    }
    const d2=(2*r)*(2*r);
    for(let i=0;i<ps.length;i++){const a=ps[i];
      for(let j=i+1;j<ps.length;j++){const b=ps[j];
        const dx=b.x-a.x,dy=b.y-a.y,dd=dx*dx+dy*dy;
        if(dd<d2&&dd>0){
          const d=Math.sqrt(dd),nx=dx/d,ny=dy/d;
          const rel=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
          if(rel>0){a.vx-=rel*nx;a.vy-=rel*ny;b.vx+=rel*nx;b.vy+=rel*ny;}
          const ov=(2*r-d)/2;a.x-=nx*ov;a.y-=ny*ov;b.x+=nx*ov;b.y+=ny*ov;
        }
      }
    }
  }
  function idealP(){const n=S.N/600,V=S.Vf*2.5;return V>0?n*.0821*S.T/V:0;}
  function readouts(){
    S.P=S.N?idealP()*S.ratio:0;
    const n=S.N/600,V=S.Vf*2.5;
    $('#rP').textContent=fmtNum(S.P,2)+' atm';$('#rV').textContent=fmtNum(V,2)+' L';$('#rT').textContent=S.T+' K';$('#rN').textContent=fmtNum(n,3);
    $('#lT').textContent=S.T+' K ('+(S.T-273)+' °C)';$('#lV').textContent=fmtNum(V,2)+' L';$('#lN').textContent=S.N;
    $('#needleG').style.transform=`rotate(${(-135+clamp(S.P,0,6)*45).toFixed(1)}deg)`;
    $('#laws').innerHTML=`<b>İdeal gaz denklemi:</b> P·V = n·R·T<br>
      P·V = <b style="color:var(--gold)">${fmtNum(S.P*V,2)}</b> &nbsp; n·R·T = <b style="color:var(--gold)">${fmtNum(n*.0821*S.T,2)}</b><br>
      <span class="muted">• Boyle: T sabitken hacmi azalt → basınç artar.<br>• Gay-Lussac: V sabitken ısıt → basınç artar.<br>• Avogadro: tanecik ekle → basınç artar.</span>`;
    drawHist();
    renderTasks();
  }
  function renderTasks(){
    const prof=Store.profile();
    let newly=null;GAS_TASKS.forEach(t=>{if(!prof.gasDone.includes(t.id)&&t.check(S)) newly=t;});
    if(newly){Game.finishGas(newly.id,GAS_TASKS.length);FX.sfx.win();FX.celebrate($('#gas-canvas'));FX.banner('GÖREV TAMAM!','good','small');}
    const p2=Store.profile();
    $('#gtasks').innerHTML=GAS_TASKS.map(t=>{const d=p2.gasDone.includes(t.id);return `<div class="task ${d?'done':''}"><span class="tk">${d?'✓':''}</span><span>${richText(t.text)}</span></div>`;}).join('');
  }
  function draw(r,R,g){
    const c=$('#gas-canvas').getContext('2d');
    c.clearRect(0,0,W,H);
    const heat=(S.T-100)/900;
    const grd=c.createLinearGradient(0,H,0,H-120);grd.addColorStop(0,`rgba(239,68,68,${.05+heat*.35})`);grd.addColorStop(1,'rgba(239,68,68,0)');
    c.fillStyle=grd;c.fillRect(0,0,W,H);
    // kap
    c.fillStyle='rgba(255,255,255,.03)';c.fillRect(WALL,WALL,R-WALL,H-2*WALL);
    c.strokeStyle='rgba(226,232,255,.75)';c.lineWidth=4;c.beginPath();c.moveTo(R,WALL);c.lineTo(WALL,WALL);c.lineTo(WALL,H-WALL);c.lineTo(R,H-WALL);c.stroke();
    // piston
    c.fillStyle='#64748b';c.fillRect(R,WALL-6,14,H-2*WALL+12);
    c.fillStyle='#94a3b8';c.fillRect(R+14,H/2-6,W-R-14,12);
    c.fillStyle='#cbd5e1';c.fillRect(W-22,H/2-34,14,68);
    c.fillStyle='rgba(255,255,255,.04)';
    for(let x=R+20;x<W;x+=16){c.fillRect(x,WALL,6,H-2*WALL);}
    // tanecikler
    const sg=sigma();
    for(const p of S.parts){
      const sp=Math.hypot(p.vx,p.vy);
      const t=clamp(sp/(2.4*SPEED*Math.sqrt(1000/g.M)*.5),0,1);
      c.fillStyle=`hsl(${(220-220*t).toFixed(0)},90%,62%)`;
      c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.fill();
      c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.arc(p.x-r*.3,p.y-r*.3,r*.35,0,Math.PI*2);c.fill();
    }
    // alev
    const fl=Math.round(heat*8);
    for(let i=0;i<fl;i++){const x=WALL+30+i*((R-WALL-60)/Math.max(1,fl-1));const hh=10+Math.random()*10+heat*12;
      c.fillStyle=`rgba(251,146,60,${.5+Math.random()*.3})`;c.beginPath();c.moveTo(x-6,H);c.quadraticCurveTo(x,H-hh*2,x+6,H);c.fill();}
    void sg;
  }
  function drawHist(){
    const cv=$('#hist');if(!cv) return;
    const c=cv.getContext('2d');const w=cv.width,h=cv.height;c.clearRect(0,0,w,h);
    const g=GAS_TYPES[S.gas];
    const vmax=SPEED*Math.sqrt(1000/4)*3.2;
    const bins=28,cnt=new Array(bins).fill(0);
    S.parts.forEach(p=>{const b=Math.floor(Math.hypot(p.vx,p.vy)/vmax*bins);if(b<bins) cnt[b]++;});
    const mx=Math.max(4,...cnt);
    const bw=(w-20)/bins;
    cnt.forEach((v,i)=>{const t=i/bins*1.8;c.fillStyle=`hsl(${(220-220*clamp(t,0,1)).toFixed(0)},85%,60%)`;const bh=v/mx*(h-30);c.fillRect(10+i*bw+1,h-18-bh,bw-2,bh);});
    // kuramsal eğri
    const sg=sigma();c.strokeStyle='#fbbf24';c.lineWidth=2;c.beginPath();
    for(let i=0;i<=100;i++){const v=i/100*vmax;const f=v/(sg*sg)*Math.exp(-v*v/(2*sg*sg));const y=S.N*f*(vmax/bins);const Y=h-18-y/mx*(h-30);i?c.lineTo(10+i/100*(w-20),Y):c.moveTo(10,Y);}
    c.stroke();
    c.fillStyle='#a5b4fc';c.font='bold 11px Nunito';c.fillText('yavaş',10,h-4);c.fillText('hızlı →',w-50,h-4);c.fillText('— kuramsal dağılım ('+g.name+')',w-230,14);
  }
  function unmount(){cancelAnimationFrame(raf);S=null;}
  return {mount,unmount};
})();
