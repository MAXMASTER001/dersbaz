'use strict';
/* =========================================================
   Efekt motoru: ses (WebAudio), konfeti/parçacık, yazılar,
   ekran sarsıntısı, arka plan molekülleri
   ========================================================= */
const FX = (()=>{
  /* ---- Ses ---- */
  let actx=null;
  let soundOn=Store.settings().sound!==false;
  function ac(){
    if(!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}}
    if(actx.state==='suspended') actx.resume();
    return actx;
  }
  function tone(f,d=.15,type='sine',vol=.15,delay=0,slide=0){
    if(!soundOn) return;
    const a=ac(); if(!a) return;
    const t=a.currentTime+delay;
    const o=a.createOscillator(), g=a.createGain();
    o.type=type; o.frequency.setValueAtTime(f,t);
    if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+d);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(vol,t+.012);
    g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t+d+.05);
  }
  const sfx={
    click(){tone(660,.06,'triangle',.07);},
    pop(){tone(420,.09,'sine',.12,0,500);},
    correct(){[523,659,784,1047].forEach((f,i)=>tone(f,.2,'triangle',.13,i*.07));},
    wrong(){tone(220,.38,'sawtooth',.08,0,-120);tone(150,.42,'square',.05,.06,-50);},
    tick(){tone(1250,.035,'square',.035);},
    win(){[523,659,784,659,784,1047,1319].forEach((f,i)=>tone(f,.24,'triangle',.12,i*.1));},
    lose(){[392,349,311,262].forEach((f,i)=>tone(f,.32,'sine',.11,i*.18));},
    bubble(){tone(300+Math.random()*300,.08,'sine',.07,0,600);},
    drop(){tone(950,.1,'sine',.08,0,-600);},
    badge(){[784,988,1175,1568].forEach((f,i)=>tone(f,.3,'sine',.1,i*.09));},
    up(){tone(500,.07,'triangle',.07,0,200);},
    down(){tone(500,.07,'triangle',.07,0,-200);},
    combo(){[880,1109,1319].forEach((f,i)=>tone(f,.12,'square',.05,i*.05));},
  };
  function setSound(on){soundOn=on;const s=Store.settings();s.sound=on;Store.saveSettings(s);}

  /* ---- Parçacık / konfeti ---- */
  const cv=document.getElementById('fx-canvas');
  const c2=cv.getContext('2d');
  let parts=[],running=false;
  function resize(){
    const dpr=window.devicePixelRatio||1;
    cv.width=innerWidth*dpr; cv.height=innerHeight*dpr;
    c2.setTransform(dpr,0,0,dpr,0,0);
  }
  resize(); addEventListener('resize',resize);
  const PALETTE=['#f43f5e','#f59e0b','#10b981','#8b5cf6','#0ea5e9','#fbbf24','#22d3ee','#f472b6'];
  function burst(x,y,n=40,colors=PALETTE,opt={}){
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2, s=(opt.speed||7)*(.35+Math.random());
      parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-(opt.up??2),g:opt.g??.22,life:1,decay:.011+Math.random()*.014,
        size:(opt.size||7)*(.5+Math.random()),color:colors[i%colors.length],shape:opt.shape||(Math.random()<.5?'rect':'circle'),rot:Math.random()*6,vr:(Math.random()-.5)*.35});
    }
    loop();
  }
  function confetti(n=160){
    for(let i=0;i<n;i++){
      parts.push({x:Math.random()*innerWidth,y:-20-Math.random()*innerHeight*.4,vx:(Math.random()-.5)*3,vy:2+Math.random()*3,g:.06,life:1,decay:.004+Math.random()*.004,
        size:6+Math.random()*7,color:PALETTE[i%PALETTE.length],shape:'rect',rot:Math.random()*6,vr:(Math.random()-.5)*.25,wob:Math.random()*10});
    }
    loop();
  }
  function bubbles(x,y,n=14){
    for(let i=0;i<n;i++) parts.push({x:x+(Math.random()-.5)*60,y,vx:(Math.random()-.5)*1.2,vy:-1-Math.random()*2.5,g:-.02,life:1,decay:.012+Math.random()*.01,size:4+Math.random()*8,color:'rgba(186,230,253,.9)',shape:'ring',rot:0,vr:0});
    loop();
  }
  function loop(){if(running) return;running=true;requestAnimationFrame(step);}
  function step(){
    c2.clearRect(0,0,innerWidth,innerHeight);
    parts=parts.filter(p=>p.life>0&&p.y<innerHeight+60);
    for(const p of parts){
      p.vy+=p.g; p.vx*=.99; p.x+=p.vx+(p.wob?Math.sin((p.wob+=.08))*.6:0); p.y+=p.vy; p.rot+=p.vr; p.life-=p.decay;
      c2.globalAlpha=Math.max(0,Math.min(1,p.life*1.5));
      c2.save(); c2.translate(p.x,p.y); c2.rotate(p.rot);
      if(p.shape==='rect'){c2.fillStyle=p.color;c2.fillRect(-p.size/2,-p.size/4,p.size,p.size/2);}
      else if(p.shape==='ring'){c2.strokeStyle=p.color;c2.lineWidth=1.5;c2.beginPath();c2.arc(0,0,p.size/2,0,Math.PI*2);c2.stroke();}
      else if(p.shape==='star'){c2.fillStyle=p.color;starPath(c2,p.size);c2.fill();}
      else {c2.fillStyle=p.color;c2.beginPath();c2.arc(0,0,p.size/2,0,Math.PI*2);c2.fill();}
      c2.restore();
    }
    c2.globalAlpha=1;
    if(parts.length) requestAnimationFrame(step); else {running=false;c2.clearRect(0,0,innerWidth,innerHeight);}
  }
  function starPath(c,s){c.beginPath();for(let i=0;i<10;i++){const r=i%2?s*.4:s;const a=i*Math.PI/5-Math.PI/2;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();}

  /* ---- Ekran efektleri ---- */
  function centerOf(el){const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};}
  function floatText(x,y,text,color='#fbbf24'){
    const el=document.createElement('div');el.className='float-text';el.textContent=text;
    el.style.left=x+'px';el.style.top=y+'px';el.style.color=color;
    document.body.appendChild(el);setTimeout(()=>el.remove(),1350);
  }
  function banner(text,kind='good',extra=''){
    const el=document.createElement('div');el.className='banner '+kind+' '+extra;el.textContent=text;
    document.body.appendChild(el);setTimeout(()=>el.remove(),1300);
  }
  function flash(color='rgba(239,68,68,.35)'){
    const el=document.createElement('div');el.className='flash';el.style.background=`radial-gradient(ellipse at center, transparent 30%, ${color} 100%)`;
    document.body.appendChild(el);setTimeout(()=>el.remove(),750);
  }
  function shake(el=document.getElementById('app')){el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');setTimeout(()=>el.classList.remove('shake'),500);}
  function celebrate(el){
    const c=el?centerOf(el):{x:innerWidth/2,y:innerHeight/2};
    burst(c.x,c.y,60,['#4ade80','#22c55e','#fbbf24','#fde68a','#ffffff']);
    burst(c.x,c.y,16,['#fbbf24','#fde68a'],{shape:'star',size:12,speed:9});
  }

  /* ---- Arka plan: süzülen moleküller ---- */
  const bg=document.getElementById('bg-canvas');
  const bc=bg.getContext('2d');
  let mols=[];
  function bgResize(){
    const dpr=Math.min(2,window.devicePixelRatio||1);
    bg.width=innerWidth*dpr;bg.height=innerHeight*dpr;bc.setTransform(dpr,0,0,dpr,0,0);
  }
  bgResize();addEventListener('resize',bgResize);
  const MCOL=['#22d3ee','#a78bfa','#f472b6','#fbbf24','#4ade80','#60a5fa'];
  for(let i=0;i<16;i++){
    const n=1+Math.floor(Math.random()*3);
    mols.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.25,vy:-.1-Math.random()*.25,rot:Math.random()*6,vr:(Math.random()-.5)*.004,
      r:8+Math.random()*16,n,c:MCOL[i%MCOL.length],c2:MCOL[(i+2)%MCOL.length]});
  }
  function bgStep(){
    if(getComputedStyle(bg).display==='none') return;
    if(!document.hidden){
      bc.clearRect(0,0,innerWidth,innerHeight);
      for(const m of mols){
        m.x+=m.vx;m.y+=m.vy;m.rot+=m.vr;
        if(m.y<-80){m.y=innerHeight+80;m.x=Math.random()*innerWidth;}
        if(m.x<-80) m.x=innerWidth+80; if(m.x>innerWidth+80) m.x=-80;
        bc.save();bc.translate(m.x,m.y);bc.rotate(m.rot);bc.globalAlpha=.11;
        const pts=[[0,0]];
        for(let k=0;k<m.n;k++){const a=k*2.1;pts.push([Math.cos(a)*m.r*1.7,Math.sin(a)*m.r*1.7]);}
        bc.strokeStyle='#fff';bc.lineWidth=3;
        for(let k=1;k<pts.length;k++){bc.beginPath();bc.moveTo(0,0);bc.lineTo(pts[k][0],pts[k][1]);bc.stroke();}
        pts.forEach((p,k)=>{bc.fillStyle=k?m.c2:m.c;bc.beginPath();bc.arc(p[0],p[1],k?m.r*.65:m.r,0,Math.PI*2);bc.fill();});
        bc.restore();
      }
    }
    requestAnimationFrame(bgStep);
  }
  requestAnimationFrame(bgStep);

  return {sfx,setSound,get soundOn(){return soundOn;},burst,confetti,bubbles,floatText,banner,flash,shake,celebrate,centerOf};
})();
