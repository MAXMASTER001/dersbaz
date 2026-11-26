'use strict';
/* =========================================================
   Çizgi ikon seti (24×24, currentColor) — emojilerin yerine.
   Kullanım: I('flask')  ·  I('star', 20)
   ========================================================= */
const ICONS = {
  home:'<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-6h4v6"/>',
  book:'<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19"/><path d="M9 7h6"/>',
  volume:'<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  mute:'<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M16 10l4 4M20 10l-4 4"/>',
  expand:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  palette:'<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10.5" cy="7" r="1.2"/><circle cx="15.5" cy="7.5" r="1.2"/>',
  flask:'<path d="M9 3h6"/><path d="M10 3v6.5L4.8 18.2A1.8 1.8 0 0 0 6.3 21h11.4a1.8 1.8 0 0 0 1.5-2.8L14 9.5V3"/><path d="M7.5 15h9"/>',
  ruler:'<path d="M4 4v16h16z"/><path d="M8 12v4h4z"/><path d="M4 8h2M4 12h2M4 16h2"/>',
  atom:'<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)"/>',
  scale:'<path d="M12 4v16M8 20h8M5 7h14"/><path d="M5 7l-2.8 6a2.8 2.8 0 0 0 5.6 0z"/><path d="M19 7l-2.8 6a2.8 2.8 0 0 0 5.6 0z"/><circle cx="12" cy="4" r="1"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  orbit:'<rect x="2.5" y="8" width="9" height="9" rx="1"/><rect x="12.5" y="8" width="9" height="9" rx="1"/><path d="M5.5 15V10M4 11.5l1.5-1.5 1.5 1.5M8.5 10v5M7 13.5l1.5 1.5 1.5-1.5M17 15v-5M15.5 11.5l1.5-1.5 1.5 1.5"/>',
  drop:'<path d="M12 3c3.2 4.2 6 7.4 6 11a6 6 0 0 1-12 0c0-3.6 2.8-6.8 6-11z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5"/>',
  balloon:'<ellipse cx="12" cy="9" rx="6" ry="7"/><path d="M11 16h2l-1 1.6z"/><path d="M12 17.6c-1.4 1.4 1.2 2.4 0 4"/>',
  sliders:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  pizza:'<path d="M12 3l9 17H3z"/><path d="M5.2 15.8a16 16 0 0 1 13.6 0"/><circle cx="10.5" cy="12" r="1"/><circle cx="13.5" cy="16.5" r="1"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  chart:'<path d="M4 4v16h16"/><path d="M7 15l4-5 3 3 5-6"/>',
  equals:'<path d="M5 9h14M5 15h14"/>',
  star:'<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8z"/>',
  heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
  bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.8 10.6c.6.6.8 1.4.8 2.4h6c0-1 .2-1.8.8-2.4A6 6 0 0 0 12 3z"/>',
  scissors:'<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8.2 8.4L20 17M8.2 15.6L20 7"/>',
  hourglass:'<path d="M6 3h12M6 21h12"/><path d="M7 3c0 5 10 4.5 10 9s-10 4-10 9"/><path d="M17 3c0 5-10 4.5-10 9s10 4 10 9"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  refresh:'<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8.5 20h7M10 17h4"/>',
  medal:'<circle cx="12" cy="15" r="5"/><path d="M8.5 11L6 3h4l2 5 2-5h4l-2.5 8"/><path d="M12 13v4"/>',
  bars:'<path d="M5 20V12M12 20V5M19 20v-9"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  play:'<path d="M7 4.5v15l12-7.5z"/>',
  fire:'<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.4 1.3-3.8 2.4-5 .3 1.6 1 2.6 2 3-.6-3.1.2-5.6.6-8z"/>',
  sparkle:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
  undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  eraser:'<path d="M4 16l9-9 6 6-6 6H8z"/><path d="M13 19h7M9 11l6 6"/>',
  brain:'<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3h0V4z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3V4z"/>',
  skull:'<path d="M12 3a7 7 0 0 0-7 7c0 2.4 1.2 4.4 3 5.6V19h8v-3.4c1.8-1.2 3-3.2 3-5.6a7 7 0 0 0-7-7z"/><circle cx="9.3" cy="10.5" r="1.4"/><circle cx="14.7" cy="10.5" r="1.4"/><path d="M10.5 19v2M13.5 19v2"/>',
  leaf:'<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19l7-7"/>',
  bolt:'<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
  shield:'<path d="M12 3l7 3v5c0 5-3.2 8.5-7 10-3.8-1.5-7-5-7-10V6z"/>',
  magnet:'<path d="M6 4v8a6 6 0 0 0 12 0V4"/><path d="M6 8h4M14 8h4M10 4v8a2 2 0 0 0 4 0V4"/>',
  dice:'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.1"/><circle cx="15" cy="15" r="1.1"/><circle cx="15" cy="9" r="1.1"/><circle cx="9" cy="15" r="1.1"/>',
  root:'<path d="M3 13h3l3 7 4-16h8"/>',
  shapes:'<path d="M7 3l4.5 8h-9z"/><rect x="13" y="13" width="8" height="8" rx="1"/><circle cx="7" cy="17" r="4"/>',
  hash:'<path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  goggles:'<path d="M3 10h18v4a3 3 0 0 1-3 3h-2.5l-1.5-2h-4l-1.5 2H6a3 3 0 0 1-3-3z"/><path d="M3 10l2-3h14l2 3"/>',
  recycle:'<path d="M7 19H4.5l2.6-4.5M9 7l1.7-3h2.6l2.5 4.4"/><path d="M17 19l2.5-4.4-1.3-2.2M13.7 19H9l-1.5-2.6"/><path d="M6 12.5l-2-3.5M18.5 9l1 3"/>',
  cube:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
  moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  edit:'<path d="M4 20h4l11-11-4-4L4 16z"/><path d="M14 6l4 4"/>',
  eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  save:'<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
  download:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  upload:'<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  coin:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><path d="M12 9.5v5"/>',
  alert:'<path d="M12 3.5L2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.3"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><ellipse cx="12" cy="12" rx="4" ry="9"/>',
  thermo:'<path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',
  snow:'<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5"/>',
  diamond:'<path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18M9 4l3 16 3-16"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.3"/>',
  stairs:'<path d="M3 20h5v-4h4v-4h4V8h5"/><path d="M3 20V8"/>',
  ban:'<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
  bus:'<rect x="4" y="4" width="16" height="13" rx="2.5"/><path d="M4 11h16M9 4v7M15 4v7"/><circle cx="8" cy="19" r="1.6"/><circle cx="16" cy="19" r="1.6"/>',
  flag:'<path d="M5 21V4M5 4h12l-2.5 4L17 12H5"/>',
};
function I(name,size){
  const p=ICONS[name]||ICONS.sparkle;
  return `<svg class="ic" viewBox="0 0 24 24" ${size?`width="${size}" height="${size}"`:''} fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}

/* =========================================================
   Iconify — arayüzdeki emojileri ekrana basılırken çizgi ikona çevirir.
   İçerik emojilerine (soru şıkları, maskot, pizza müşterileri,
   sayma nesneleri, avatarlar, formlar) dokunmaz.
   ========================================================= */
const Iconify = (()=>{
  const MAP={
    '🎯':'target','⚖️':'scale','⚛️':'atom','🌀':'orbit','🧪':'flask','⚗️':'flask','📐':'ruler','🎈':'balloon','🛠️':'sliders',
    '📚':'book','📖':'book','📘':'book','🍕':'pizza','⏰':'clock','⏱️':'clock','📈':'chart','🧒':'user','🎓':'book','🌟':'sparkle',
    '💡':'bulb','✂️':'scissors','⏳':'hourglass','🔥':'fire','❤️':'heart','⭐':'star','🏆':'trophy','🔁':'refresh','↺':'refresh',
    '🏠':'home','✅':'check','❌':'x','✔':'check','✔️':'check','🔬':'eye','📊':'bars','🏅':'medal','🔐':'lock','🔒':'lock','📝':'edit',
    '👁️':'eye','✏️':'edit','🗑️':'trash','➕':'plus','➖':'minus','🔍':'search','💾':'save','⬇️':'download','⬆️':'upload',
    '♻️':'recycle','⚙️':'settings','🎮':'play','🦸':'user','🧘':'leaf','💀':'skull','🌈':'sparkle','🔢':'hash','🎲':'dice',
    '🔷':'shapes','🔗':'link','🥽':'goggles','🧊':'cube','💨':'layers','⚡':'bolt','🧽':'eraser','↶':'undo','🏁':'flag',
    '🛵':'arrow','🛎️':'bell','🪙':'coin','🆙':'bolt','👋':'sparkle','👤':'user','🎉':'sparkle','💪':'fire','👍':'check',
    '⚠️':'alert','🧮':'root','🧬':'layers','🧲':'magnet','💎':'diamond','💧':'drop','🌡️':'thermo','📦':'cube','❄️':'snow',
    '🗂️':'layers','🔊':'volume','🔇':'mute','⛶':'expand','🎨':'palette','🌿':'leaf','🌍':'globe','🔴':null,'🔵':null,
    '🗓️':'clock','🧠':'brain','🛡️':'shield','💥':'bolt','✨':'sparkle','🥇':'medal','🔙':'back','🚀':'arrow','🛑':'x','🪜':'stairs','🚫':'ban','🚌':'bus',
  };
  const keys=Object.keys(MAP).filter(k=>MAP[k]).sort((a,b)=>b.length-a.length);
  const pat=keys.map(k=>k.replace(/️/g,'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
  const reTest=new RegExp('(?:'+pat+')');
  const reAll=new RegExp('('+pat+')\\uFE0F?','g');
  const keyOf=m=>MAP[m]||MAP[m+'️'];
  const SKIP='svg,option,select,textarea,input,script,style,title,.vis,.q-stem,.pz-face,.cloud,.v-emoji,.v-count,.avatar,.avatar-pick,.q-text,.fb-body,.cap,.bal-context,.pz-bubble,.no-ic,.review-item h4,.review-item p,.facts,.mascot';
  function fix(n){
    const v=n.nodeValue;if(!v||!reTest.test(v)) return;
    const p=n.parentElement;if(!p||p.closest(SKIP)) return;
    const tmp=document.createElement('span');
    tmp.innerHTML=esc(v).replace(reAll,m=>{const k=keyOf(m.replace(/️$/,''));return k?I(k):m;});
    n.replaceWith(...tmp.childNodes);
  }
  function run(root){
    if(!root) return;
    if(root.nodeType===3) return fix(root);
    if(root.nodeType!==1) return;
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const list=[];while(w.nextNode()) list.push(w.currentNode);
    list.forEach(fix);
  }
  function start(){
    run(document.body);
    new MutationObserver(recs=>{
      for(const r of recs){
        if(r.type==='characterData') fix(r.target);
        else r.addedNodes.forEach(run);
      }
    }).observe(document.body,{childList:true,subtree:true,characterData:true});
  }
  return {run,start,MAP};
})();
