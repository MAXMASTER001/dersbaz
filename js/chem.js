'use strict';
/* =========================================================
   Kimya çekirdeği: element verisi, formül çözümleyici,
   denklem denkleştirici, elektron dizilimi
   ========================================================= */
const ELEMENTS = [
  // Z, sembol, ad, atom kütlesi, sütun(1-18), periyot, kategori, en bol izotobun nötron sayısı
  [1,'H','Hidrojen',1.008,1,1,'ametal',0],
  [2,'He','Helyum',4.003,18,1,'soygaz',2],
  [3,'Li','Lityum',6.94,1,2,'alkali',4],
  [4,'Be','Berilyum',9.012,2,2,'toprak',5],
  [5,'B','Bor',10.81,13,2,'yarimetal',6],
  [6,'C','Karbon',12.011,14,2,'ametal',6],
  [7,'N','Azot',14.007,15,2,'ametal',7],
  [8,'O','Oksijen',15.999,16,2,'ametal',8],
  [9,'F','Flor',18.998,17,2,'halojen',10],
  [10,'Ne','Neon',20.18,18,2,'soygaz',10],
  [11,'Na','Sodyum',22.99,1,3,'alkali',12],
  [12,'Mg','Magnezyum',24.305,2,3,'toprak',12],
  [13,'Al','Alüminyum',26.982,13,3,'metal',14],
  [14,'Si','Silisyum',28.085,14,3,'yarimetal',14],
  [15,'P','Fosfor',30.974,15,3,'ametal',16],
  [16,'S','Kükürt',32.06,16,3,'ametal',16],
  [17,'Cl','Klor',35.45,17,3,'halojen',18],
  [18,'Ar','Argon',39.948,18,3,'soygaz',22],
  [19,'K','Potasyum',39.098,1,4,'alkali',20],
  [20,'Ca','Kalsiyum',40.078,2,4,'toprak',20],
  [21,'Sc','Skandiyum',44.956,3,4,'gecis',24],
  [22,'Ti','Titanyum',47.867,4,4,'gecis',26],
  [23,'V','Vanadyum',50.942,5,4,'gecis',28],
  [24,'Cr','Krom',51.996,6,4,'gecis',28],
  [25,'Mn','Mangan',54.938,7,4,'gecis',30],
  [26,'Fe','Demir',55.845,8,4,'gecis',30],
  [27,'Co','Kobalt',58.933,9,4,'gecis',32],
  [28,'Ni','Nikel',58.693,10,4,'gecis',30],
  [29,'Cu','Bakır',63.546,11,4,'gecis',34],
  [30,'Zn','Çinko',65.38,12,4,'gecis',34],
  [31,'Ga','Galyum',69.723,13,4,'metal',38],
  [32,'Ge','Germanyum',72.63,14,4,'yarimetal',42],
  [33,'As','Arsenik',74.922,15,4,'yarimetal',42],
  [34,'Se','Selenyum',78.971,16,4,'ametal',46],
  [35,'Br','Brom',79.904,17,4,'halojen',44],
  [36,'Kr','Kripton',83.798,18,4,'soygaz',48],
].map(([z,sym,name,mass,col,period,cat,n])=>({z,sym,name,mass,col,period,cat,n}));

const EL_BY_SYM = Object.fromEntries(ELEMENTS.map(e=>[e.sym,e]));
const EXTRA_MASS = {Rb:85.468,Sr:87.62,Ag:107.868,Sn:118.71,I:126.904,Ba:137.327,Pt:195.084,Au:196.967,Hg:200.592,Pb:207.2,U:238.029,Cs:132.905,Cd:112.414};

const CAT_INFO = {
  alkali:{name:'Alkali metal',color:'#f9a8d4'},
  toprak:{name:'Toprak alkali metal',color:'#fdba74'},
  gecis:{name:'Geçiş metali',color:'#fde047'},
  metal:{name:'Diğer metal',color:'#cbd5e1'},
  yarimetal:{name:'Yarı metal',color:'#5eead4'},
  ametal:{name:'Ametal',color:'#86efac'},
  halojen:{name:'Halojen',color:'#7dd3fc'},
  soygaz:{name:'Soy gaz',color:'#c4b5fd'},
};

// Kararlı izotopların nötron sayıları (Z = 1–20)
const STABLE_N = {1:[0,1],2:[1,2],3:[3,4],4:[5],5:[5,6],6:[6,7],7:[7,8],8:[8,9,10],9:[10],10:[10,11,12],11:[12],12:[12,13,14],13:[14],14:[14,15,16],15:[16],16:[16,17,18,20],17:[18,20],18:[18,20,22],19:[20,22],20:[20,22,23,24,26,28]};
const ISOTOPE_NAMES = {'1-0':'Protiyum','1-1':'Döteryum','1-2':'Trityum (radyoaktif)','6-8':'Karbon-14 (radyoaktif, yaş tayininde kullanılır)'};

// Tanecik modelleri ve molekül çizimleri için atom renkleri
const ATOM_COLORS = {
  H:'#f1f5f9',He:'#67e8f9',Li:'#c084fc',Be:'#a3e635',B:'#fda4af',C:'#475569',N:'#3b82f6',O:'#ef4444',F:'#86efac',Ne:'#fb923c',
  Na:'#a855f7',Mg:'#22c55e',Al:'#cbd5e1',Si:'#d4a373',P:'#f97316',S:'#facc15',Cl:'#4ade80',Ar:'#22d3ee',K:'#8b5cf6',Ca:'#84cc16',
  Fe:'#d97706',Cu:'#c2410c',Zn:'#94a3b8',Br:'#b91c1c',I:'#7e22ce',Ag:'#e5e7eb',Ba:'#10b981',Mn:'#9ca3af',Cr:'#8b9dc3',
  // genel (soyut) atom harfleri
  X:'#f59e0b',Y:'#14b8a6',Z:'#ec4899',Q:'#0ea5e9',A:'#f43f5e',D:'#eab308',E:'#6366f1',G:'#84cc16',T:'#06b6d4',M:'#d946ef',R:'#fb7185',L:'#a3e635',J:'#fde047'
};
function atomColor(sym){return ATOM_COLORS[sym] || '#94a3b8';}
function molarMassOf(sym){return EL_BY_SYM[sym]?.mass ?? EXTRA_MASS[sym] ?? null;}
function isKnownSymbol(s){return molarMassOf(s)!=null;}
function groupLabel(col){
  if(col<=2) return col+'A';
  if(col>=13) return (col-10)+'A';
  return ['3B','4B','5B','6B','7B','8B','8B','8B','1B','2B'][col-3];
}

/* ---------- Formül çözümleme ---------- */
function parseFormula(formula){
  const clean=String(formula).replace(/\((s|l|g|k|aq|suda)\)/g,'').replace(/\s/g,'');
  const parts=clean.split(/[·.]/);
  const total={};
  parts.forEach((part,pi)=>{
    let mult=1;
    let f=part;
    const m=f.match(/^(\d+)/);
    if(m){ if(pi>0) mult=parseInt(m[1]); f=f.slice(m[1].length); }
    let i=0;
    const readNum=()=>{let s='';while(i<f.length&&/\d/.test(f[i])){s+=f[i];i++;}return s?parseInt(s):1;};
    const group=()=>{
      const counts={};
      while(i<f.length){
        const ch=f[i];
        if(ch==='('||ch==='['){
          i++; const inner=group();
          if(f[i]!==')'&&f[i]!==']') throw new Error('Parantez kapanmamış: '+formula);
          i++; const n=readNum();
          for(const k in inner) counts[k]=(counts[k]||0)+inner[k]*n;
        } else if(ch===')'||ch===']'){ return counts; }
        else if(/[A-Z]/.test(ch)){
          let sym=ch;i++;
          while(i<f.length&&/[a-z]/.test(f[i])){sym+=f[i];i++;}
          const n=readNum();
          counts[sym]=(counts[sym]||0)+n;
        } else throw new Error('Geçersiz karakter "'+ch+'" : '+formula);
      }
      return counts;
    };
    const c=group();
    if(i<f.length) throw new Error('Fazla kapanan parantez: '+formula);
    for(const k in c) total[k]=(total[k]||0)+c[k]*mult;
  });
  if(!Object.keys(total).length) throw new Error('Boş formül');
  return total;
}
function formulaMass(counts){let m=0;for(const k in counts){m+=(molarMassOf(k)||0)*counts[k];}return m;}

/* Formülü HTML'e çevir: H2O → H₂O, Na^+ → Na⁺, -> → → */
function formatFormula(s){
  s=String(s);
  let out='',i=0,termStart=true;
  while(i<s.length){
    const ch=s[i];
    if(s.startsWith('<->',i)){out+=' ⇌ ';i+=3;termStart=true;continue;}
    if(s.startsWith('->',i)){out+=' → ';i+=2;termStart=true;continue;}
    if(ch==='^'){
      i++;let sup='';
      while(i<s.length&&/[0-9+\-]/.test(s[i])){sup+=s[i];i++;}
      out+='<sup>'+esc(sup).replace(/-/g,'−')+'</sup>';continue;
    }
    if(ch==='_'){
      i++;let sub='';
      while(i<s.length&&/\d/.test(s[i])){sub+=s[i];i++;}
      out+='<sub>'+sub+'</sub>';continue;
    }
    if(/\d/.test(ch)){
      let num='';while(i<s.length&&/\d/.test(s[i])){num+=s[i];i++;}
      out+= termStart? num : '<sub>'+num+'</sub>';
      continue;
    }
    if(ch==='('){
      const m=s.slice(i).match(/^\(([a-zçğıöşü]+)\)/);
      if(m){out+='<small>('+esc(m[1])+')</small>';i+=m[0].length;continue;}
    }
    if(ch===' '){out+=' ';termStart=true;i++;continue;}
    if(ch==='·'){out+='·';termStart=true;i++;continue;}
    if(ch==='+'){out+=' + ';termStart=true;i++;continue;}
    out+=esc(ch);termStart=false;i++;
  }
  return out.replace(/\s{2,}/g,' ');
}

/* Metin içindeki {formül} parçalarını biçimlendir, **kalın**, satır sonları */
function richText(t){
  if(t==null||t==='') return '';
  t=String(t);
  let out='',last=0;
  const re=/\{([^{}]+)\}|\$([^$]+)\$/g;let m;
  while((m=re.exec(t))){
    out+=esc(t.slice(last,m.index));
    out+=m[1]!=null?'<span class="fml">'+formatFormula(m[1])+'</span>':MathX.format(m[2]);
    last=m.index+m[0].length;
  }
  out+=esc(t.slice(last));
  return out.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>');
}

/* ---------- Denklemler ---------- */
function parseEquation(str){
  const s=String(str).replace(/→|⟶|=>|⇒/g,'->').replace(/=/g,'->');
  const parts=s.split('->');
  if(parts.length!==2) throw new Error('Denklemde tek bir ok ( -> ) olmalı.');
  const side=p=>p.split('+').map(x=>x.trim()).filter(Boolean).map(x=>{
    const formula=x.replace(/^\d+\s*/,'').replace(/\((s|l|g|k|aq|suda)\)/g,'').trim();
    const counts=parseFormula(formula);
    for(const k in counts) if(!isKnownSymbol(k)) throw new Error('Bilinmeyen element sembolü: '+k);
    return {formula,counts};
  });
  const left=side(parts[0]), right=side(parts[1]);
  if(!left.length||!right.length) throw new Error('Girenler ve ürünler boş olamaz.');
  const le=new Set(left.flatMap(x=>Object.keys(x.counts))), re=new Set(right.flatMap(x=>Object.keys(x.counts)));
  for(const e of le) if(!re.has(e)) throw new Error(e+' elementi ürünlerde yok.');
  for(const e of re) if(!le.has(e)) throw new Error(e+' elementi girenlerde yok.');
  return {left,right};
}
function eqElements(eq){return [...new Set([...eq.left,...eq.right].flatMap(x=>Object.keys(x.counts)))];}
function sideCount(sideArr,coefs,el){let s=0;sideArr.forEach((x,i)=>{s+=(x.counts[el]||0)*coefs[i];});return s;}
function isBalanced(eq,coefs){
  const L=coefs.slice(0,eq.left.length), R=coefs.slice(eq.left.length);
  return eqElements(eq).every(el=>sideCount(eq.left,L,el)===sideCount(eq.right,R,el));
}
function gcd(a,b){while(b){[a,b]=[b,a%b];}return a;}
function gcdArr(a){return a.reduce((g,x)=>gcd(g,x));}
/* Kaba kuvvetle en küçük tam sayı katsayıları bul */
function solveEquation(eq,maxC){
  const sp=[...eq.left.map(x=>({c:x.counts,s:1})),...eq.right.map(x=>({c:x.counts,s:-1}))];
  const n=sp.length;
  if(n>6) return null;
  maxC=maxC||(n<=4?16:n===5?12:9);
  const els=eqElements(eq);
  const M=els.map(e=>sp.map(x=>(x.c[e]||0)*x.s));
  const coef=new Array(n).fill(1);
  let found=null;
  const rec=k=>{
    if(found) return;
    if(k===n){
      for(const row of M){let sum=0;for(let j=0;j<n;j++) sum+=row[j]*coef[j];if(sum!==0) return;}
      found=coef.slice();return;
    }
    for(let v=1;v<=maxC&&!found;v++){coef[k]=v;rec(k+1);}
  };
  rec(0);
  if(found){const g=gcdArr(found);if(g>1) found=found.map(x=>x/g);}
  return found;
}
function equationString(eq,coefs){
  const fmt=(x,i)=>((coefs&&coefs[i]>1)?coefs[i]:'')+x.formula;
  const L=eq.left.map((x,i)=>fmt(x,i)).join(' + ');
  const R=eq.right.map((x,i)=>fmt(x,i+eq.left.length)).join(' + ');
  return L+' -> '+R;
}

/* ---------- Elektron dizilimi ---------- */
const SUBSHELLS=[[1,0],[2,0],[2,1],[3,0],[3,1],[4,0],[3,2],[4,1],[5,0],[4,2],[5,1],[6,0],[4,3],[5,2],[6,1]];
const LCHAR='spdf';
function aufbau(e){
  const res=[];let left=e;
  for(const [n,l] of SUBSHELLS){if(left<=0)break;const c=Math.min(left,2*(2*l+1));res.push({n,l,e:c});left-=c;}
  return res;
}
function electronConfig(p,e){
  if(e<=0) return [];
  if(e<=p){
    const conf=aufbau(p);
    if(p===24||p===29){ // Cr ve Cu istisnaları
      const s4=conf.find(x=>x.n===4&&x.l===0), d3=conf.find(x=>x.n===3&&x.l===2);
      if(s4&&d3){s4.e=1;d3.e+=1;}
    }
    let remove=p-e;
    while(remove>0){
      let pick=null;
      for(const x of conf){ if(x.e>0 && (!pick || x.n>pick.n || (x.n===pick.n && x.l>pick.l))) pick=x; }
      if(!pick) break;
      pick.e--;remove--;
    }
    return conf.filter(x=>x.e>0);
  }
  return aufbau(e);
}
const SUPS='⁰¹²³⁴⁵⁶⁷⁸⁹';
function supNum(n){return String(n).split('').map(d=>SUPS[+d]).join('');}
function configString(conf){return conf.map(x=>x.n+LCHAR[x.l]+supNum(x.e)).join(' ');}
function shellsOf(p,e){
  const conf=electronConfig(p,e);
  const sh=[];conf.forEach(x=>{sh[x.n-1]=(sh[x.n-1]||0)+x.e;});
  for(let i=0;i<sh.length;i++) if(!sh[i]) sh[i]=0;
  while(sh.length&&!sh[sh.length-1]) sh.pop();
  return sh;
}
function chargeStr(c){if(!c) return '';const a=Math.abs(c);return (a>1?a:'')+(c>0?'+':'−');}
