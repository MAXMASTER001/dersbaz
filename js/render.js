'use strict';
/* =========================================================
   Görsel motor: şık/soru görselleri (SVG)
   tipler: text, image, emoji, atom, particles, ghs
   ========================================================= */
const GHS_INFO = {
  flame:{name:'Yanıcı'},
  corrosive:{name:'Aşındırıcı (Korozif)'},
  skull:{name:'Akut Toksik (Zehirli)'},
  exclamation:{name:'Tahriş Edici / Zararlı'},
  explosive:{name:'Patlayıcı'},
  oxidizer:{name:'Yükseltgen'},
  gas:{name:'Basınçlı Gaz'},
  environment:{name:'Çevreye Zararlı'},
  health:{name:'Ciddi Sağlık Tehlikesi'},
};

const Visual = (()=>{
  function render(o){
    if(!o||!o.type||o.type==='none') return '';
    switch(o.type){
      case 'text':{
        const plain=String(o.value||'').replace(/[{}*$]/g,'').replace(/sqrt/g,'√');
        const cls=plain.length>44?'long':plain.length>11?'mid':'short';
        return `<div class="v-text ${cls}">${richText(o.value)}</div>`;
      }
      case 'image': return o.src?`<img class="v-img" src="${esc(o.src)}" alt="${esc(o.label||'görsel')}" draggable="false">`:'<div class="v-empty">Görsel seçilmedi</div>';
      case 'emoji': return `<div class="v-emoji">${esc(o.value||'❓')}</div>`;
      case 'atom': return atomSVG(o);
      case 'particles': return particlesSVG(o.spec,o.layout);
      case 'ghs': return ghsSVG(o.code);
      case 'orbital': return orbitalSVG(o.spec,true);
      case 'fraction': return MathX.fractionSVG(o);
      case 'clock': return MathX.clockSVG(o);
      case 'graph': return MathX.graphSVG(o);
      case 'shape': return MathX.shapeSVG(o);
      case 'count': return MathX.countHTML(o);
    }
    return '';
  }
  function caption(o){
    if(!o) return '';
    if(o.type==='atom'&&o.showLabel) return nuclideHTML(o.p,o.n,o.e)+(o.label?' '+richText(o.label):'');
    if(o.type==='ghs'&&o.showName) return esc(GHS_INFO[o.code]?.name||'');
    if(o.type==='shape'&&o.showName) return esc(MathX.SHAPES[o.shape]||'');
    return o.label?richText(o.label):'';
  }
  function nuclideHTML(p,n,e){
    const el=ELEMENTS[p-1];
    const sym=el?el.sym:'?';
    const c=p-e;
    return `<span class="nuclide"><span class="nz"><span>${p+n}</span><span>${p}</span></span>${sym}${c?`<span class="ch">${chargeStr(c)}</span>`:''}</span>`;
  }

  /* ---- Atom (Bohr modeli) ---- */
  function atomSVG({p=1,n=0,e=1,hideNucleus=false}){
    p=clamp(+p||1,1,36);n=clamp(+n||0,0,80);e=clamp(+e||0,0,40);
    const sh=shellsOf(p,e);const N=sh.length;
    const radii=sh.map((_,i)=>N===1?50:36+i*(54/(N-1)));
    let s=`<svg viewBox="0 0 200 200" class="v-atom">`;
    s+=``;
    radii.forEach(r=>{s+=`<circle cx="100" cy="100" r="${r.toFixed(1)}" fill="none" style="stroke:var(--sv-ink)" stroke-opacity=".45" stroke-width="1.6" stroke-dasharray="3 4"/>`;});
    s+=`<circle cx="100" cy="100" r="25" fill="#ea580c" stroke="#fdba74" stroke-width="2"/>`;
    s+=`<circle cx="92" cy="92" r="8" fill="#fff" opacity=".25"/>`;
    if(hideNucleus) s+=`<text x="100" y="109" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="700" font-size="26" fill="#fff">?</text>`;
    else s+=`<text x="100" y="98" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="600" font-size="13" fill="#fff">${p}p⁺</text><text x="100" y="113" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="600" font-size="13" fill="#fed7aa">${n}n</text>`;
    sh.forEach((cnt,i)=>{
      const r=radii[i];const dur=7+i*4;
      s+=`<g class="spin" style="transform-origin:100px 100px;animation-duration:${dur}s;${i%2?'animation-direction:reverse;':''}">`;
      for(let k=0;k<cnt;k++){
        const a=2*Math.PI*k/cnt-Math.PI/2;
        s+=`<circle cx="${(100+Math.cos(a)*r).toFixed(1)}" cy="${(100+Math.sin(a)*r).toFixed(1)}" r="5" fill="#38bdf8" stroke="#e0f2fe" stroke-width="1.5"/>`;
      }
      s+='</g>';
    });
    s+='</svg>';
    return s;
  }

  /* ---- Tanecik modeli ---- */
  function parseSpec(spec){
    return String(spec||'').split(/[,;]/).map(x=>x.trim()).filter(Boolean).map(part=>{
      const [m,c]=part.split('*');
      const atoms=(m||'').trim().match(/[A-Z][a-z]?/g)||[];
      return {atoms,count:clamp(parseInt(c)||1,1,40)};
    }).filter(g=>g.atoms.length);
  }
  function molOffsets(atoms,r){
    const n=atoms.length,d=r*1.55;
    if(n===1) return [[0,0]];
    if(n===2) return [[-d/2,0],[d/2,0]];
    if(n===3){
      if(atoms[1]!==atoms[0]&&['O','S'].includes(atoms[1])){
        const a=52*Math.PI/180;return [[-d*Math.sin(a),d*Math.cos(a)*.85],[0,0],[d*Math.sin(a),d*Math.cos(a)*.85]];
      }
      return [[-d,0],[0,0],[d,0]];
    }
    const out=[[0,0]];
    for(let k=1;k<n;k++){const a=2*Math.PI*(k-1)/(n-1);out.push([Math.cos(a)*d,Math.sin(a)*d]);}
    return out;
  }
  function ball(x,y,r,c){
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c}" stroke="rgba(0,0,0,.4)" stroke-width="1"/><circle cx="${(x-r*.33).toFixed(1)}" cy="${(y-r*.33).toFixed(1)}" r="${(r*.3).toFixed(1)}" fill="#fff" opacity=".55"/>`;
  }
  function particlesSVG(spec,layout='gas'){
    const groups=parseSpec(spec);
    const W=200,H=160,pad=9;
    const nAtoms=groups.reduce((t,g)=>t+g.atoms.length*g.count,0)||1;
    const frac=(layout==='liquid'||layout==='solid')?.3:.17;
    const r=clamp(Math.sqrt(frac*(W-2*pad)*(H-2*pad)/(Math.PI*nAtoms)),5,10.5);
    const rand=rng(hashStr(spec+'|'+layout));
    const shapes=[];
    groups.forEach(g=>{for(let k=0;k<g.count;k++){const offs=molOffsets(g.atoms,r);shapes.push({atoms:g.atoms,offs,R:Math.max(...offs.map(o=>Math.hypot(o[0],o[1])))+r});}});
    const order=shuffleSeeded(shapes,rand);
    const placed=[];
    const top=layout==='liquid'?52:pad;
    if(layout==='solid'){
      const maxR=Math.max(r,...order.map(s=>s.R));const cell=maxR*2+1;
      const cols=Math.max(1,Math.floor((W-2*pad)/cell));
      const ox=(W-cols*cell)/2;
      order.forEach((s,i)=>{const row=Math.floor(i/cols),col=i%cols;placed.push({...s,x:ox+cell*col+cell/2,y:H-pad-cell*row-cell/2,rot:0});});
    } else {
      const gap=layout==='liquid'?.5:6;
      order.forEach(s=>{
        let best=null,bestD=-Infinity;
        for(let t=0;t<400;t++){
          const x=pad+s.R+rand()*(W-2*pad-2*s.R);
          const yr=(H-pad-top-2*s.R);
          const y=layout==='liquid'? top+s.R+(1-Math.pow(rand(),1.6))*yr : top+s.R+rand()*yr;
          let minD=Infinity;for(const p of placed){const d=Math.hypot(p.x-x,p.y-y)-(p.R+s.R);if(d<minD) minD=d;}
          if(minD>=gap){best={x,y};break;}
          if(minD>bestD){bestD=minD;best={x,y};}
        }
        placed.push({...s,x:best.x,y:best.y,rot:rand()*360});
      });
    }
    let svg=`<svg viewBox="0 0 ${W} ${H}" class="v-particles">`;
    svg+=`<rect x="3" y="3" width="${W-6}" height="${H-6}" rx="14" style="fill:var(--sv-fill);stroke:var(--sv-ink)" stroke-opacity=".7" stroke-width="2.5"/>`;
    if(layout==='liquid') svg+=`<path d="M5 ${top-6} Q 30 ${top-11} 55 ${top-6} T 105 ${top-6} T 155 ${top-6} T 195 ${top-6} V ${H-5} H5Z" fill="rgba(56,189,248,.16)"/>`;
    placed.sort((a,b)=>a.y-b.y).forEach(m=>{
      if(layout==='gas'||layout==='mix'){
        const a=rand()*Math.PI*2,cx=Math.cos(a),cy=Math.sin(a),nx=-cy*4,ny=cx*4;
        svg+=`<g style="stroke:var(--sv-ink)" stroke-opacity=".35" stroke-width="2" stroke-linecap="round">`;
        [-1,1].forEach(sg=>{svg+=`<line x1="${(m.x-cx*(m.R+3)+nx*sg).toFixed(1)}" y1="${(m.y-cy*(m.R+3)+ny*sg).toFixed(1)}" x2="${(m.x-cx*(m.R+11)+nx*sg).toFixed(1)}" y2="${(m.y-cy*(m.R+11)+ny*sg).toFixed(1)}"/>`;});
        svg+='</g>';
      }
      svg+=`<g transform="translate(${m.x.toFixed(1)} ${m.y.toFixed(1)}) rotate(${m.rot.toFixed(0)})">`;
      const idx=m.atoms.map((_,i)=>i);
      if(m.atoms.length>=4){idx.shift();idx.push(0);}
      idx.forEach(i=>{svg+=ball(m.offs[i][0],m.offs[i][1],r,atomColor(m.atoms[i]));});
      svg+='</g>';
    });
    svg+='</svg>';
    return svg;
  }

  /* ---- Orbital diyagramı ----
     spec: "1s=ud 2s=ud 2p=u.u.0"  (u=↑, d=↓, 0=boş, nokta orbital ayırır)
     veya "Z=7" / "Z=26 e=24" (doğru temel hâl dizilimini kendisi çizer) */
  function hundFill(k,m){const o=Array.from({length:m},()=>[]);for(let i=0;i<k;i++){if(i<m) o[i].push('u'); else o[i-m].push('d');}return o;}
  function parseOrbitalSpec(spec){
    spec=String(spec||'').trim();
    const zm=spec.match(/^Z\s*=\s*(\d+)(?:\s+e\s*=\s*(\d+))?$/i);
    if(zm){
      const p=clamp(+zm[1],1,36), e=zm[2]!=null?clamp(+zm[2],0,40):p;
      return electronConfig(p,e).map(x=>({label:x.n+LCHAR[x.l],orbs:hundFill(x.e,2*x.l+1)}));
    }
    return spec.split(/\s+/).filter(Boolean).map(tok=>{
      const eq=tok.indexOf('=');if(eq<0) return null;
      const lab=tok.slice(0,eq), vals=tok.slice(eq+1);
      const m=lab.match(/^(\d)([spdf])$/i);if(!m) return null;
      const orbs=vals.split('.').map(v=>v.toLowerCase().split('').filter(c=>c==='u'||c==='d'));
      return {label:lab.toLowerCase(),orbs};
    }).filter(Boolean);
  }
  function orbArrows(o,bx,y,B){
    let s='';
    o.forEach((sp,i)=>{
      const x=o.length===1?bx+B/2:bx+B*(0.32+0.36*i/Math.max(1,o.length-1));
      const top=y+5,bot=y+B-5;
      if(sp==='u') s+=`<path d="M${x.toFixed(1)} ${bot} V${top+2} M${(x-4.5).toFixed(1)} ${top+7} L${x.toFixed(1)} ${top} L${(x+4.5).toFixed(1)} ${top+7}" style="stroke:var(--sv-up)" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      else s+=`<path d="M${x.toFixed(1)} ${top} V${bot-2} M${(x-4.5).toFixed(1)} ${bot-7} L${x.toFixed(1)} ${bot} L${(x+4.5).toFixed(1)} ${bot-7}" style="stroke:var(--sv-down)" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    });
    return s;
  }
  function orbitalSVG(spec,compact){
    const groups=parseOrbitalSpec(spec);
    if(!groups.length) return '<div class="v-empty">Orbital tanımı yok</div>';
    const B=30,G=14,LH=18,maxW=compact?4*B+G+2:9*B+3*G;
    const rows=[[]];let w=0;
    groups.forEach(g=>{const gw=g.orbs.length*B;if(w>0&&w+G+gw>maxW){rows.push([]);w=0;}rows[rows.length-1].push(g);w+=(w?G:0)+gw;});
    const rowW=rows.map(r=>r.reduce((t,g,i)=>t+(i?G:0)+g.orbs.length*B,0));
    const W=Math.max(...rowW)+8, H=rows.length*(B+LH+8)+2;
    let s=`<svg viewBox="0 0 ${W} ${H}" class="v-orbital">`;
    rows.forEach((r,ri)=>{
      let x=(W-rowW[ri])/2;const y=4+ri*(B+LH+8);
      r.forEach(g=>{
        g.orbs.forEach((o,k)=>{
          const bx=x+k*B;
          s+=`<rect x="${bx}" y="${y}" width="${B}" height="${B}" style="fill:var(--sv-fill);stroke:var(--sv-ink)" stroke-width="2"/>`;
          s+=orbArrows(o,bx,y,B);
        });
        const cnt=g.orbs.reduce((t,o)=>t+o.length,0);
        s+=`<text x="${(x+g.orbs.length*B/2).toFixed(1)}" y="${y+B+15}" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="600" font-size="14" style="fill:var(--sv-ink)">${g.label}${cnt?supNum(cnt):'⁰'}</text>`;
        x+=g.orbs.length*B+G;
      });
    });
    return s+'</svg>';
  }
  function shuffleSeeded(a,rand){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

  /* ---- Denklem molekülü (formülden) ---- */
  function moleculeSVG(counts){
    let list=[];for(const [el,c] of Object.entries(counts)) for(let i=0;i<c;i++) list.push(el);
    if(list.length>24) list=list.slice(0,24);
    const total=list.length;
    const r=total>12?5.5:total>6?7:9;
    let offs;
    if(total===1) offs=[[0,0]];
    else if(total===2) offs=[[-r*.8,0],[r*.8,0]];
    else{
      const singles=Object.entries(counts).filter(([e,c])=>c===1).map(([e])=>e).filter(e=>!['Na','K','Li'].includes(e));
      if(total<=7&&singles.length){
        const center=singles[0];
        const rest=list.slice();rest.splice(rest.indexOf(center),1);
        list=[...rest,center];
        const bent=rest.length===2&&['O','S'].includes(center);
        offs=rest.map((_,k)=>{const a=rest.length===2?(bent?[Math.PI*.8,Math.PI*.2][k]:[Math.PI,0][k]):2*Math.PI*k/rest.length-Math.PI/2;return [Math.cos(a)*r*1.6,Math.sin(a)*r*1.6];});
        offs.push([0,0]);
      } else {
        offs=list.map((_,i)=>{const rr=r*1.25*Math.sqrt(i+.35);const a=i*2.39996;return [Math.cos(a)*rr,Math.sin(a)*rr];});
        list=list.slice().reverse();offs=offs.slice().reverse();
      }
    }
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    offs.forEach(([x,y])=>{minX=Math.min(minX,x-r);minY=Math.min(minY,y-r);maxX=Math.max(maxX,x+r);maxY=Math.max(maxY,y+r);});
    const w=maxX-minX,h=maxY-minY,sz=Math.max(w,h)+4;
    const vx=minX-(sz-w)/2,vy=minY-(sz-h)/2;
    let s=`<svg viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${sz.toFixed(1)} ${sz.toFixed(1)}">`;
    list.forEach((el,i)=>{s+=ball(offs[i][0],offs[i][1],r,atomColor(el));});
    return s+'</svg>';
  }

  /* ---- GHS güvenlik işaretleri ---- */
  function ghsSVG(code){
    const k='#111';
    const flame=(tx=0,ty=0,sc=1)=>`<path transform="translate(${tx} ${ty}) scale(${sc})" d="M100 50c10 16 30 28 28 58c-1 16-13 28-28 28s-28-11-28-27c0-14 8-22 14-30c1 9 4 14 9 17c-3-17 1-31 5-46z" fill="${k}"/>`;
    let sym='';
    switch(code){
      case 'flame': sym=flame()+`<rect x="64" y="141" width="72" height="7" rx="2" fill="${k}"/>`;break;
      case 'exclamation': sym=`<rect x="89" y="52" width="22" height="62" rx="9" fill="${k}"/><circle cx="100" cy="135" r="12" fill="${k}"/>`;break;
      case 'skull': sym=`<g fill="${k}"><ellipse cx="100" cy="84" rx="27" ry="25"/><rect x="85" y="96" width="30" height="18" rx="5"/></g><g fill="#fff"><circle cx="90" cy="84" r="7.5"/><circle cx="110" cy="84" r="7.5"/><path d="M100 93l-4 8h8z"/><rect x="92" y="107" width="3" height="7"/><rect x="99" y="107" width="3" height="7"/><rect x="106" y="107" width="3" height="7"/></g><g stroke="${k}" stroke-width="9" stroke-linecap="round"><line x1="66" y1="122" x2="134" y2="146"/><line x1="134" y1="122" x2="66" y2="146"/></g>`;break;
      case 'corrosive': sym=`<g fill="${k}"><rect x="58" y="50" width="15" height="36" rx="4" transform="rotate(-38 65 68)"/><rect x="127" y="50" width="15" height="36" rx="4" transform="rotate(38 135 68)"/><circle cx="78" cy="96" r="4.5"/><circle cx="78" cy="108" r="3.2"/><circle cx="122" cy="96" r="4.5"/><circle cx="122" cy="108" r="3.2"/><path d="M56 122h34l-4 8 6 4-4 10H56z"/><path d="M106 120h40v9h-9v6h-9v7h-22z"/></g><rect x="52" y="146" width="96" height="6" fill="${k}"/>`;break;
      case 'explosive':{
        let pts='';for(let i=0;i<16;i++){const rr=i%2?16:34;const a=i*Math.PI/8;pts+=`${(100+Math.cos(a)*rr).toFixed(1)},${(108+Math.sin(a)*rr).toFixed(1)} `;}
        sym=`<polygon points="${pts}" fill="${k}"/><g fill="${k}"><rect x="62" y="62" width="9" height="9" transform="rotate(20 66 66)"/><rect x="128" y="60" width="10" height="8" transform="rotate(-25 133 64)"/><rect x="58" y="128" width="8" height="10"/><rect x="136" y="130" width="9" height="9" transform="rotate(30 140 134)"/><circle cx="100" cy="62" r="5"/></g>`;break;
      }
      case 'oxidizer': sym=flame(30,-6,.7)+`<circle cx="100" cy="118" r="20" fill="none" stroke="${k}" stroke-width="10"/><rect x="64" y="144" width="72" height="7" rx="2" fill="${k}"/>`;break;
      case 'gas': sym=`<g transform="rotate(-22 100 104)"><rect x="56" y="90" width="84" height="30" rx="15" fill="${k}"/><rect x="138" y="97" width="10" height="16" rx="2" fill="${k}"/><rect x="146" y="92" width="6" height="26" rx="2" fill="${k}"/></g>`;break;
      case 'environment': sym=`<g stroke="${k}" stroke-width="5" stroke-linecap="round" fill="none"><path d="M78 140 L74 62"/><path d="M76 92 L58 76"/><path d="M76 82 L92 66"/><path d="M75 110 L60 100"/></g><path d="M64 142 H140" stroke="${k}" stroke-width="5"/><ellipse cx="114" cy="126" rx="18" ry="9" fill="${k}"/><path d="M130 126 l14 -9 v18z" fill="${k}"/><path d="M106 122 l6 6 M112 122 l-6 6" stroke="#fff" stroke-width="2"/>`;break;
      case 'health': {
        let st='';for(let i=0;i<10;i++){const rr=i%2?6:15;const a=i*Math.PI/5-Math.PI/2;st+=`${(100+Math.cos(a)*rr).toFixed(1)},${(122+Math.sin(a)*rr).toFixed(1)} `;}
        sym=`<circle cx="100" cy="66" r="15" fill="${k}"/><path d="M62 150 Q62 92 100 88 Q138 92 138 150Z" fill="${k}"/><polygon points="${st}" fill="#fff"/>`;break;
      }
      default: sym=`<text x="100" y="122" text-anchor="middle" font-size="60" fill="${k}">?</text>`;
    }
    return `<svg viewBox="0 0 200 200" class="v-ghs"><polygon points="100,10 190,100 100,190 10,100" fill="#fff" stroke="#dc2626" stroke-width="12" stroke-linejoin="round"/>${sym}</svg>`;
  }

  return {render,caption,nuclideHTML,atomSVG,particlesSVG,moleculeSVG,ghsSVG,parseSpec,orbitalSVG,parseOrbitalSpec,hundFill};
})();

/* =========================================================
   Maskot: "Mol" — tepki veren erlenmayer karakteri
   ========================================================= */
const Mascot = {
  svg(cls='think'){
    const sub=(typeof App!=='undefined'&&App.subject)?App.subject().id:'kimya';
    if(sub==='matematik') return Mascot.mathSVG(cls);
    return `<svg class="mascot ${cls}" viewBox="0 0 120 140" aria-hidden="true">
      <defs><linearGradient id="mliq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5eead4"/><stop offset="1" stop-color="#0e7490"/></linearGradient></defs>
      <ellipse cx="60" cy="134" rx="34" ry="5" fill="rgba(0,0,0,.35)"/>
      <g class="m-body">
        <path d="M51 14 V46 L16 106 Q10 122 26 124 H94 Q110 122 104 106 L69 46 V14Z" style="fill:var(--sv-fill)" fill-opacity=".6"/>
        <path d="M35 74 Q47 69 60 74 T85 74 L102 106 Q107 119 93 120 H27 Q13 119 18 106Z" fill="url(#mliq)"/>
        <circle class="bub" cx="55" cy="60" r="3" fill="#a5f3fc"/><circle class="bub bub2" cx="64" cy="64" r="2.2" fill="#a5f3fc"/><circle class="bub bub3" cx="59" cy="56" r="1.8" fill="#a5f3fc"/>
        <path d="M51 14 V46 L16 106 Q10 122 26 124 H94 Q110 122 104 106 L69 46 V14" fill="none" style="stroke:var(--sv-ink)" stroke-width="4" stroke-linejoin="round"/>
        <rect x="45" y="6" width="30" height="10" rx="4" style="fill:var(--sv-ink)"/>
        <g class="eyes"><circle cx="49" cy="92" r="6.5" fill="#0b1026"/><circle cx="71" cy="92" r="6.5" fill="#0b1026"/><circle cx="51" cy="90" r="2.2" fill="#fff"/><circle cx="73" cy="90" r="2.2" fill="#fff"/></g>
        <g class="eyelid"><rect x="41" y="84" width="17" height="15" rx="7" fill="#22b8c9"/><rect x="63" y="84" width="17" height="15" rx="7" fill="#22b8c9"/></g>
        <circle class="cheek" cx="40" cy="103" r="5" fill="#f472b6"/><circle class="cheek" cx="80" cy="103" r="5" fill="#f472b6"/>
        <path class="mouth m-think" d="M53 105 Q60 110 67 105" stroke="#0b1026" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path class="mouth m-happy" d="M49 104 Q60 117 71 104 Z" fill="#0b1026" stroke="#0b1026" stroke-width="2" stroke-linejoin="round"/>
        <path class="mouth m-sad" d="M51 111 Q60 102 69 111" stroke="#0b1026" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path class="tear" d="M44 99 q-3 6 0 8 q3 -2 0 -8z" fill="#bae6fd"/>
      </g>
    </svg>`;
  },
  mathSVG(cls){
    return `<svg class="mascot ${cls}" viewBox="0 0 120 140" aria-hidden="true">
      <defs><linearGradient id="pbody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#ea580c"/></linearGradient></defs>
      <ellipse cx="60" cy="134" rx="34" ry="5" fill="rgba(0,0,0,.35)"/>
      <g class="m-body">
        <text class="bub" x="18" y="40" font-family="Nunito, sans-serif" font-weight="700" font-size="16" fill="#67e8f9">+</text>
        <text class="bub bub2" x="92" y="36" font-family="Nunito, sans-serif" font-weight="700" font-size="15" fill="#f9a8d4">×</text>
        <text class="bub bub3" x="54" y="22" font-family="Nunito, sans-serif" font-weight="700" font-size="14" fill="#86efac">÷</text>
        <rect x="18" y="46" width="84" height="80" rx="24" fill="url(#pbody)" stroke="#fde68a" stroke-width="4"/>
        <text x="60" y="76" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="700" font-size="22" fill="#7c2d12" opacity=".55">π</text>
        <g class="eyes"><circle cx="49" cy="92" r="6.5" fill="#0b1026"/><circle cx="71" cy="92" r="6.5" fill="#0b1026"/><circle cx="51" cy="90" r="2.2" fill="#fff"/><circle cx="73" cy="90" r="2.2" fill="#fff"/></g>
        <g class="eyelid"><rect x="41" y="84" width="17" height="15" rx="7" fill="#f59e0b"/><rect x="63" y="84" width="17" height="15" rx="7" fill="#f59e0b"/></g>
        <circle class="cheek" cx="36" cy="103" r="5" fill="#f472b6"/><circle class="cheek" cx="84" cy="103" r="5" fill="#f472b6"/>
        <path class="mouth m-think" d="M53 105 Q60 110 67 105" stroke="#0b1026" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path class="mouth m-happy" d="M49 104 Q60 117 71 104 Z" fill="#0b1026" stroke="#0b1026" stroke-width="2" stroke-linejoin="round"/>
        <path class="mouth m-sad" d="M51 111 Q60 102 69 111" stroke="#0b1026" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path class="tear" d="M44 99 q-3 6 0 8 q3 -2 0 -8z" fill="#bae6fd"/>
      </g>
    </svg>`;
  },
  set(state){$$('.mascot').forEach(m=>{m.classList.remove('think','happy','sad');void m.getBoundingClientRect();m.classList.add(state);});},
  say(text,ms=4200){
    const sp=$('#speech');if(!sp) return;
    sp.innerHTML=text;sp.classList.add('show');
    clearTimeout(Mascot._t);Mascot._t=setTimeout(()=>sp.classList.remove('show'),ms);
  }
};
