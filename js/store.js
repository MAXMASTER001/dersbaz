'use strict';
/* Yerel depolama (tarayıcı localStorage) */
const Store = (()=>{
  const P='ko_';
  const clone=o=>JSON.parse(JSON.stringify(o));
  // Bazı ortamlarda (ör. Android'de dosyadan açılan sayfa) localStorage kapalıdır: bellekte tutarız.
  const LS=(()=>{try{const t='__ko_test';localStorage.setItem(t,'1');localStorage.removeItem(t);return localStorage;}catch(e){return null;}})();
  const mem={};
  function raw(k){return LS?LS.getItem(P+k):(P+k in mem?mem[P+k]:null);}
  function get(k,d){try{const v=raw(k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
  function set(k,v){
    const s=JSON.stringify(v);
    if(!LS){mem[P+k]=s;return true;}
    try{LS.setItem(P+k,s);return true;}
    catch(e){UI.toast('⚠️ Kaydedilemedi: tarayıcı depolama alanı dolmuş olabilir. Büyük görselleri küçültmeyi deneyin.','bad',5000);return false;}
  }
  function del(k){if(!LS){delete mem[P+k];return;}try{LS.removeItem(P+k);}catch(e){}}
  return {
    get,set,del,clone,persistent:!!LS,
    questions(){
      const q=get('questions',null);
      if(!q) return clone(DEFAULT_QUESTIONS);
      const seen=get('seenDefaults',null)||DEFAULT_V1_IDS;
      const have=new Set(q.map(x=>x.id));
      const missing=DEFAULT_QUESTIONS.filter(d=>!seen.includes(d.id)&&!have.has(d.id));
      if(missing.length){q.push(...clone(missing));set('questions',q);set('seenDefaults',DEFAULT_QUESTIONS.map(d=>d.id));}
      return q;
    },
    saveQuestions(a){set('seenDefaults',DEFAULT_QUESTIONS.map(d=>d.id));return set('questions',a);},
    equations(){return get('equations',null)||clone(DEFAULT_EQUATIONS);},
    saveEquations(a){return set('equations',a);},
    profile(){
      const def={name:'',avatar:'🧑‍🔬',xp:0,badges:[],best:0,balance:{},atomDone:[],phDone:[],orbital:{},levels:{},games:{},bestBy:{},gasDone:[],
        stats:{answered:0,correct:0,games:0,bestCombo:0}};
      const p=Object.assign(def,get('profile',{}));
      p.stats=Object.assign(def.stats,p.stats||{});
      return p;
    },
    saveProfile(p){set('profile',p);},
    settings(){return Object.assign({pin:'1234',sound:true,subject:null},get('settings',{}));},
    saveSettings(s){set('settings',s);},
  };
})();
