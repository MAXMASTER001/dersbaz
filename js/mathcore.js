'use strict';
/* =========================================================
   Matematik çekirdeği: güvenli ifade çözümleyici (eval yok),
   matematik yazımı, Türkçe saat ifadeleri, matematik görselleri
   ========================================================= */
const MathX = (()=>{
  /* ---------- İfade çözümleyici: 2x-3, x^2-4, 3(x+1), sqrt(x), abs(x) ---------- */
  function tokenize(src){
    const s=String(src).replace(/\s+/g,'').replace(/−/g,'-').replace(/[·×]/g,'*').replace(/÷/g,'/').toLowerCase();
    const t=[];let i=0;
    while(i<s.length){
      const c=s[i];
      if(/[0-9.]/.test(c)){let j=i;while(j<s.length&&/[0-9.]/.test(s[j]))j++;t.push({k:'num',v:parseFloat(s.slice(i,j))});i=j;continue;}
      if(/[a-z]/.test(c)){
        let j=i;while(j<s.length&&/[a-z]/.test(s[j]))j++;
        const w=s.slice(i,j);
        if(w==='pi') t.push({k:'num',v:Math.PI});
        else if(['sqrt','abs','sin','cos','tan'].includes(w)) t.push({k:'fn',v:w});
        else for(const ch of w){if(ch==='x') t.push({k:'x'}); else throw new Error('Bilinmeyen sembol: '+ch);}
        i=j;continue;
      }
      if('+-*/^()'.includes(c)){t.push({k:c});i++;continue;}
      throw new Error('Geçersiz karakter: '+c);
    }
    const out=[];
    for(const b of t){
      const a=out[out.length-1];
      if(a&&['num','x',')'].includes(a.k)&&['num','x','(','fn'].includes(b.k)) out.push({k:'*'});
      out.push(b);
    }
    return out;
  }
  function compile(expr){
    const t=tokenize(expr);let p=0;
    if(!t.length) throw new Error('Boş ifade');
    const peek=()=>t[p];
    const eat=k=>{if(t[p]&&t[p].k===k){p++;return true;}return false;};
    function E(){let f=T();while(peek()&&(peek().k==='+'||peek().k==='-')){const op=t[p++].k,a=f,b=T();f=op==='+'?x=>a(x)+b(x):x=>a(x)-b(x);}return f;}
    function T(){let f=U();while(peek()&&(peek().k==='*'||peek().k==='/')){const op=t[p++].k,a=f,b=U();f=op==='*'?x=>a(x)*b(x):x=>a(x)/b(x);}return f;}
    function U(){if(eat('-')){const a=U();return x=>-a(x);}if(eat('+')) return U();return P();}
    function P(){const a=A();if(eat('^')){const b=U();return x=>Math.pow(a(x),b(x));}return a;}
    function A(){
      const tk=t[p++];if(!tk) throw new Error('İfade yarım kaldı');
      if(tk.k==='num'){const v=tk.v;return ()=>v;}
      if(tk.k==='x') return x=>x;
      if(tk.k==='('){const f=E();if(!eat(')')) throw new Error('Parantez kapanmadı');return f;}
      if(tk.k==='fn'){if(!eat('(')) throw new Error(tk.v+' sonrasında ( gerekli');const f=E();if(!eat(')')) throw new Error('Parantez kapanmadı');const fn=Math[tk.v];return x=>fn(f(x));}
      throw new Error('Beklenmeyen işaret: '+tk.k);
    }
    const f=E();
    if(p<t.length) throw new Error('Fazladan karakter var');
    return f;
  }

  /* ---------- Matematik yazımı: $3/4$, $x^2$, $sqrt(2)$, $<=$ ---------- */
  function format(src){
    let t=esc(String(src).replace(/-/g,'−'));
    t=t.replace(/&lt;=/g,'≤').replace(/&gt;=/g,'≥').replace(/!=/g,'≠').replace(/\bpi\b/g,'π').replace(/\*/g,'·');
    for(let k=0;k<3;k++) t=t.replace(/sqrt\(([^()]*)\)/g,'√<span class="ovl">$1</span>');
    t=t.replace(/\^\(([^()]*)\)/g,'<sup>$1</sup>').replace(/\^(−?[0-9a-zπ.]+)/g,'<sup>$1</sup>');
    t=t.replace(/(−?[0-9a-zπ.]+)\/([0-9a-zπ.]+)/g,'<span class="frac"><span>$1</span><span>$2</span></span>');
    return '<span class="mth">'+t+'</span>';
  }
  function num(v){ // ondalık sayıyı Türkçe ve eksi işaretiyle yaz
    const s=Number.isInteger(v)?String(v):String(+v.toFixed(2)).replace('.',',');
    return s.replace('-','−');
  }

  /* ---------- Türkçe saat ifadeleri ---------- */
  const HN=['on iki','bir','iki','üç','dört','beş','altı','yedi','sekiz','dokuz','on','on bir'];
  const ACC={'bir':'biri','iki':'ikiyi','üç':'üçü','dört':'dördü','beş':'beşi','altı':'altıyı','yedi':'yediyi','sekiz':'sekizi','dokuz':'dokuzu','on':'onu','on bir':'on biri','on iki':'on ikiyi'};
  const DAT={'bir':'bire','iki':'ikiye','üç':'üçe','dört':'dörde','beş':'beşe','altı':'altıya','yedi':'yediye','sekiz':'sekize','dokuz':'dokuza','on':'ona','on bir':'on bire','on iki':'on ikiye'};
  const MW={5:'beş',10:'on',15:'çeyrek',20:'yirmi',25:'yirmi beş'};
  const cap=s=>s.charAt(0).toLocaleUpperCase('tr')+s.slice(1);
  function timePhrase(h,m){
    const H=HN[h%12];
    if(m===0) return 'Saat '+H;
    if(m===30) return cap(H+' buçuk');
    if(m<30) return cap(ACC[H]+' '+(MW[m]||m)+' geçiyor');
    const H2=HN[(h+1)%12];
    return cap(DAT[H2]+' '+(MW[60-m]||(60-m))+' var');
  }
  const digital=(h,m)=>`${h===0?12:h}:${String(m).padStart(2,'0')}`;

  /* ---------- Görseller ---------- */
  function pieSlice(cx,cy,r,a0,a1){
    const x0=cx+r*Math.cos(a0),y0=cy+r*Math.sin(a0),x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1);
    return `M${cx} ${cy} L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1-a0>Math.PI?1:0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}Z`;
  }
  function fractionSVG({n=1,d=2,style='pie'}={}){
    d=clamp(+d||1,1,24);n=clamp(+n||0,0,d);
    const on='var(--sv-accent)',off='var(--sv-fill)',st='var(--sv-ink)';
    if(style==='bar'){
      const w=180/d;let s=`<svg viewBox="0 0 200 90" class="v-frac">`;
      for(let i=0;i<d;i++) s+=`<rect x="${(10+i*w).toFixed(2)}" y="20" width="${w.toFixed(2)}" height="50" style="fill:${i<n?on:off};stroke:${st}" stroke-width="2.5"/>`;
      return s+'</svg>';
    }
    let s=`<svg viewBox="0 0 200 200" class="v-frac">`;
    if(d===1) s+=`<circle cx="100" cy="100" r="86" style="fill:${n?on:off};stroke:${st}" stroke-width="3"/>`;
    else for(let i=0;i<d;i++){const a0=-Math.PI/2+i*2*Math.PI/d,a1=a0+2*Math.PI/d;s+=`<path d="${pieSlice(100,100,86,a0,a1)}" style="fill:${i<n?on:off};stroke:${st}" stroke-width="3" stroke-linejoin="round"/>`;}
    return s+'</svg>';
  }
  function clockSVG({h=3,m=0}={},opts={}){
    h=+h||0;m=clamp(+m||0,0,59);
    const ha=((h%12)+m/60)*30,ma=m*6;
    let s=`<svg viewBox="0 0 200 200" class="v-clock">`;
    s+=`<circle cx="100" cy="100" r="92" fill="#fffbeb" stroke="#f59e0b" stroke-width="8"/>`;
    for(let i=0;i<60;i++){const a=i*6*Math.PI/180,r1=i%5?82:76;s+=`<line x1="${(100+Math.sin(a)*r1).toFixed(1)}" y1="${(100-Math.cos(a)*r1).toFixed(1)}" x2="${(100+Math.sin(a)*86).toFixed(1)}" y2="${(100-Math.cos(a)*86).toFixed(1)}" stroke="#78350f" stroke-width="${i%5?1.2:3}"/>`;}
    for(let i=1;i<=12;i++){const a=i*30*Math.PI/180;s+=`<text x="${(100+Math.sin(a)*63).toFixed(1)}" y="${(100-Math.cos(a)*63+7).toFixed(1)}" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="600" font-size="19" fill="#1e1b4b">${i}</text>`;}
    s+=`<g class="hand-h" style="transform-origin:100px 100px;transform:rotate(${ha}deg)"><line x1="100" y1="108" x2="100" y2="52" stroke="#1e1b4b" stroke-width="8" stroke-linecap="round"/></g>`;
    s+=`<g class="hand-m" style="transform-origin:100px 100px;transform:rotate(${ma}deg)"><line x1="100" y1="112" x2="100" y2="24" stroke="#dc2626" stroke-width="5" stroke-linecap="round"/></g>`;
    s+=`<circle cx="100" cy="100" r="7" fill="#1e1b4b"/>`;
    return s+'</svg>';
  }
  function graphSVG({expr='x',range=6}={}){
    const R=+range||6,S=200,P=10,W=S-2*P;
    const X=x=>P+(x+R)/(2*R)*W, Y=y=>P+(R-y)/(2*R)*W;
    let s=`<svg viewBox="0 0 ${S} ${S}" class="v-graph"><rect x="${P}" y="${P}" width="${W}" height="${W}" rx="6" style="fill:var(--sv-panel)"/>`;
    for(let i=-R;i<=R;i++){s+=`<line x1="${X(i)}" y1="${P}" x2="${X(i)}" y2="${S-P}" style="stroke:var(--sv-ink)" stroke-opacity=".12"/><line x1="${P}" y1="${Y(i)}" x2="${S-P}" y2="${Y(i)}" style="stroke:var(--sv-ink)" stroke-opacity=".12"/>`;}
    s+=`<line x1="${P}" y1="${Y(0)}" x2="${S-P}" y2="${Y(0)}" style="stroke:var(--sv-ink)" stroke-opacity=".8" stroke-width="1.8"/><line x1="${X(0)}" y1="${P}" x2="${X(0)}" y2="${S-P}" style="stroke:var(--sv-ink)" stroke-opacity=".8" stroke-width="1.8"/>`;
    for(let i=-R;i<=R;i+=2){if(!i) continue;
      s+=`<text x="${X(i)}" y="${Y(0)+12}" text-anchor="middle" font-size="9" style="fill:var(--sv-ink)" fill-opacity=".75" font-family="Nunito" font-weight="800">${num(i)}</text><text x="${X(0)-4}" y="${Y(i)+3}" text-anchor="end" font-size="9" style="fill:var(--sv-ink)" fill-opacity=".75" font-family="Nunito" font-weight="800">${num(i)}</text>`;}
    s+=`<text x="${S-P-4}" y="${Y(0)-5}" text-anchor="end" font-size="11" style="fill:var(--sv-ink)" font-style="italic">x</text><text x="${X(0)+5}" y="${P+11}" font-size="11" style="fill:var(--sv-ink)" font-style="italic">y</text>`;
    try{
      const f=compile(expr);let d='',pen=false;
      for(let i=0;i<=400;i++){
        const x=-R+i*2*R/400,y=f(x);
        if(!isFinite(y)||Math.abs(y)>R*4){pen=false;continue;}
        d+=(pen?'L':'M')+X(x).toFixed(1)+' '+Y(y).toFixed(1);pen=true;
      }
      const id='gc'+Math.random().toString(36).slice(2,8);
      s+=`<clipPath id="${id}"><rect x="${P}" y="${P}" width="${W}" height="${W}"/></clipPath><path d="${d}" clip-path="url(#${id})" fill="none" style="stroke:var(--sv-line)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    }catch(e){s+=`<text x="100" y="105" text-anchor="middle" fill="#fca5a5" font-size="11">${esc(e.message)}</text>`;}
    return s+'</svg>';
  }
  const SHAPES={triangle:'Üçgen',square:'Kare',rectangle:'Dikdörtgen',circle:'Daire',pentagon:'Beşgen',hexagon:'Altıgen',octagon:'Sekizgen',rhombus:'Eşkenar dörtgen',trapezoid:'Yamuk',right:'Dik üçgen'};
  function regular(n,r=78,rot=-90){let p='';for(let i=0;i<n;i++){const a=(rot+i*360/n)*Math.PI/180;p+=`${(100+Math.cos(a)*r).toFixed(1)},${(104+Math.sin(a)*r).toFixed(1)} `;}return p;}
  function shapeSVG({shape='triangle'}={}){
    const C={triangle:'#f43f5e',square:'#3b82f6',rectangle:'#10b981',circle:'#f59e0b',pentagon:'#8b5cf6',hexagon:'#06b6d4',octagon:'#ec4899',rhombus:'#84cc16',trapezoid:'#fb923c',right:'#e11d48'}[shape]||'#94a3b8';
    const st=`fill="${C}" fill-opacity=".85" style="stroke:var(--sv-ink)" stroke-width="3" stroke-linejoin="round"`;
    let body;
    switch(shape){
      case 'square': body=`<rect x="34" y="34" width="132" height="132" rx="4" ${st}/>`;break;
      case 'rectangle': body=`<rect x="16" y="56" width="168" height="94" rx="4" ${st}/>`;break;
      case 'circle': body=`<circle cx="100" cy="100" r="78" ${st}/>`;break;
      case 'rhombus': body=`<polygon points="100,18 170,100 100,182 30,100" ${st}/>`;break;
      case 'trapezoid': body=`<polygon points="58,50 142,50 186,156 14,156" ${st}/>`;break;
      case 'right': body=`<polygon points="32,168 32,36 172,168" ${st}/><rect x="32" y="148" width="20" height="20" fill="none" style="stroke:var(--sv-ink)" stroke-width="2.5"/>`;break;
      case 'pentagon': body=`<polygon points="${regular(5)}" ${st}/>`;break;
      case 'hexagon': body=`<polygon points="${regular(6,80,0)}" ${st}/>`;break;
      case 'octagon': body=`<polygon points="${regular(8,80,-67.5)}" ${st}/>`;break;
      default: body=`<polygon points="${regular(3,86)}" ${st}/>`;
    }
    return `<svg viewBox="0 0 200 200" class="v-shape">${body}</svg>`;
  }
  function parseCount(items){
    return String(items||'').split(',').map(x=>x.trim()).filter(Boolean).map(p=>{
      const i=p.lastIndexOf('*');
      return i<0?{e:p,n:1}:{e:p.slice(0,i).trim(),n:clamp(parseInt(p.slice(i+1))||1,1,30)};
    }).filter(g=>g.e);
  }
  function countHTML({items=''}={}){
    const g=parseCount(items);const total=g.reduce((t,x)=>t+x.n,0);
    if(!total) return '<div class="v-empty">Nesne yok</div>';
    const fs=total<=4?46:total<=8?36:total<=12?30:total<=20?24:19;
    return `<div class="v-count" style="font-size:${fs}px">${g.map(x=>Array(x.n).fill(`<span>${esc(x.e)}</span>`).join('')).join('')}</div>`;
  }
  return {compile,format,num,timePhrase,digital,fractionSVG,clockSVG,graphSVG,shapeSVG,countHTML,parseCount,SHAPES,pieSlice};
})();
