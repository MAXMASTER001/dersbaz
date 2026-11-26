'use strict';
/* =========================================================
   Öğretmen Paneli — soru, şık, denklem yönetimi ve yedekleme
   ========================================================= */
const Admin = (()=>{
  let app=null,tab='q',draft=null,editIdx=-1,filter={text:'',topic:''},pvTimer=null;
  const OPT_TYPES={text:'📝 Metin / Formül',emoji:'😀 Emoji + etiket',image:'🖼️ Resim',atom:'⚛️ Atom modeli',particles:'🔵 Tanecik modeli',orbital:'🌀 Orbital diyagramı',ghs:'⚠️ Güvenlik işareti',fraction:'🍕 Kesir modeli',clock:'⏰ Analog saat',graph:'📈 Fonksiyon grafiği',shape:'🔷 Geometrik şekil',count:'🍎 Sayma nesneleri'};
  let memAuth=false;
  const isAuthed=()=>{if(memAuth) return true;try{return sessionStorage.getItem('ko_admin')==='1';}catch(e){return false;}};

  function mount(a){
    app=a;
    if(!isAuthed()) return login();
    shell();
  }
  function login(){
    app.innerHTML=`<section class="screen"><div class="panel login-box">
      <div style="font-size:60px">🔐</div><h2>Öğretmen Paneli</h2>
      <p class="muted">Devam etmek için PIN kodunu girin.</p>
      <input class="inp" id="pin" type="password" inputmode="numeric" maxlength="12" autocomplete="off" placeholder="••••">
      <div style="margin-top:14px"><button class="btn btn-big btn-primary" id="enter">Giriş ▶</button></div>
      <p class="muted" style="font-size:12px;margin-top:16px">İlk kurulum PIN'i <b>1234</b>'tür. Giriş yaptıktan sonra “Ayarlar” sekmesinden değiştirin.</p>
    </div></section>`;
    const go=()=>{
      if($('#pin').value===Store.settings().pin){memAuth=true;try{sessionStorage.setItem('ko_admin','1');}catch(e){}FX.sfx.correct();shell();}
      else{FX.sfx.wrong();FX.shake($('.login-box'));$('#pin').value='';}
    };
    $('#enter').onclick=go;$('#pin').onkeydown=e=>{if(e.key==='Enter') go();};
    $('#pin').focus();
  }
  function shell(){
    app.innerHTML=`<section class="screen admin">
      <div class="admin-head"><h1 class="screen-title" style="margin:0">🛠️ Öğretmen Paneli</h1>
        <select class="inp" id="asubj" style="width:auto">${Object.values(SUBJECTS).map(x=>`<option value="${x.id}" ${x.id===App.subject().id?'selected':''}>${x.icon} ${x.name}</option>`).join('')}</select>
        <div class="tabs"><button class="tab" data-t="q">📝 Sorular</button>${App.subject().id==='kimya'?'<button class="tab" data-t="eq">⚖️ Denklemler</button>':''}<button class="tab" data-t="set">⚙️ Ayarlar & Yedek</button></div>
        <button class="btn btn-sm btn-ghost" id="logout">🔒 Çıkış</button></div>
      <div id="abody"></div></section>`;
    $$('.tab',app).forEach(b=>b.onclick=()=>{tab=b.dataset.t;draft=null;renderTab();});
    $('#asubj').onchange=e=>{App.setSubject(e.target.value);draft=null;filter.topic='';if(tab==='eq') tab='q';shell();};
    $('#logout').onclick=()=>{memAuth=false;try{sessionStorage.removeItem('ko_admin');}catch(e){}Router.nav('menu');};
    renderTab();
  }
  function renderTab(){
    $$('.tab',app).forEach(b=>b.classList.toggle('active',b.dataset.t===tab));
    if(tab==='q') draft?renderEditor():renderList();
    else if(tab==='eq') renderEquations();
    else renderSettings();
  }

  /* ---------------- Soru listesi ---------------- */
  function renderList(){
    const S=App.subject();
    const qs=Store.questions();
    const topics=[...new Set(qs.filter(q=>subjOf(q)===S.id).map(q=>q.topic))];
    const body=$('#abody');
    body.innerHTML=`<div class="toolbar">
        <input class="inp" id="fq" placeholder="🔍 Soru ara..." value="${esc(filter.text)}">
        <select class="inp" id="ft" style="max-width:280px"><option value="">Tüm konular</option>${topics.map(t=>`<option ${t===filter.topic?'selected':''}>${esc(t)}</option>`).join('')}</select>
        <button class="btn btn-good" id="newq">➕ Yeni Soru</button>
      </div>
      <div class="muted" style="font-weight:800;margin-bottom:10px" id="qcount"></div>
      <div id="qlist"></div>`;
    const draw=()=>{
      const t=filter.text.toLocaleLowerCase('tr');
      const list=qs.map((q,i)=>({q,i})).filter(({q})=>subjOf(q)===S.id&&(!filter.topic||q.topic===filter.topic)&&(!t||(q.text+' '+q.topic).toLocaleLowerCase('tr').includes(t)));
      $('#qcount').textContent=`${S.icon} ${S.name}: ${list.length} / ${qs.filter(q=>subjOf(q)===S.id).length} soru`;
      $('#qlist').innerHTML=list.map(({q,i})=>`<div class="q-row">
        <div class="num">${i+1}</div>
        <div><div class="qt">${richText(q.text)}</div>
          <div class="qi"><span class="tag">${topicIcon(q.topic)} ${esc(q.topic)}</span><span class="tag">${q.grade}. sınıf</span><span class="tag diff">${'★'.repeat(q.difficulty||1)}</span>
          <span class="muted" style="font-size:12px;font-weight:800">${q.options.map((o,k)=>`<span style="${k===q.answer?'color:#4ade80':''}">${LETTERS[k]}:${(OPT_TYPES[o.type]||'').split(' ')[0]}</span>`).join(' ')}</span></div></div>
        <div class="acts">
          <button class="btn btn-sm btn-cyan" data-a="pv" data-i="${i}" title="Önizle">👁️</button>
          <button class="btn btn-sm btn-primary" data-a="ed" data-i="${i}" title="Düzenle">✏️</button>
          <button class="btn btn-sm btn-ghost" data-a="cp" data-i="${i}" title="Kopyala">⧉</button>
          <button class="btn btn-sm btn-danger" data-a="rm" data-i="${i}" title="Sil">🗑️</button>
        </div></div>`).join('')||'<div class="panel muted">Soru bulunamadı.</div>';
    };
    draw();
    $('#fq').oninput=e=>{filter.text=e.target.value;draw();};
    $('#ft').onchange=e=>{filter.topic=e.target.value;draw();};
    $('#newq').onclick=()=>{draft=blankQuestion();editIdx=-1;renderEditor();};
    $('#qlist').onclick=e=>{
      const b=e.target.closest('[data-a]');if(!b) return;
      const i=+b.dataset.i;const all=Store.questions();
      if(b.dataset.a==='pv') Quiz.preview(all[i]);
      if(b.dataset.a==='ed'){draft=Store.clone(all[i]);editIdx=i;renderEditor();}
      if(b.dataset.a==='cp'){const c=Store.clone(all[i]);c.id=uid();all.splice(i+1,0,c);Store.saveQuestions(all);UI.toast('Soru kopyalandı.','good');renderList();}
      if(b.dataset.a==='rm') UI.confirm(`${i+1}. soru silinecek. Bu işlem geri alınamaz.`,()=>{all.splice(i,1);Store.saveQuestions(all);UI.toast('Soru silindi.','good');renderList();},{yes:'Sil',danger:true});
    };
  }
  function blankQuestion(){
    const S=App.subject();
    return {id:uid(),subject:S.id,topic:filter.topic||S.topics()[0],grade:S.grades[0],difficulty:1,text:'',stem:{type:'none'},image:'',
      options:[{type:'text',value:'',label:''},{type:'text',value:'',label:''},{type:'text',value:'',label:''},{type:'text',value:'',label:''},{type:'text',value:'',label:''}],
      answer:0,hint:'',explanation:''};
  }

  /* ---------------- Soru editörü ---------------- */
  function renderEditor(){
    const q=draft;
    if(!q.stem) q.stem={type:'none'};
    const S=App.subject();
    const topics=[...new Set([...S.topics(),...Store.questions().filter(x=>subjOf(x)===S.id).map(x=>x.topic)])];
    $('#abody').innerHTML=`<div class="editor">
      <div class="panel">
        <h3>${editIdx>=0?'✏️ Soruyu düzenle (#'+(editIdx+1)+')':'➕ Yeni soru'}</h3>
        <div class="f3">
          <div class="field"><label>Konu / Ünite</label><input class="inp" list="topiclist" data-k="topic" value="${esc(q.topic)}"><datalist id="topiclist">${topics.map(t=>`<option value="${esc(t)}">`).join('')}</datalist></div>
          <div class="field"><label>Sınıf</label><select class="inp" data-k="grade" data-num>${S.grades.map(g=>`<option value="${g}" ${+q.grade===g?'selected':''}>${g}. sınıf</option>`).join('')}</select></div>
          <div class="field"><label>Zorluk</label><select class="inp" data-k="difficulty" data-num>${[1,2,3].map(d=>`<option value="${d}" ${+q.difficulty===d?'selected':''}>${'★'.repeat(d)}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label>Soru metni</label><textarea class="inp" data-k="text" rows="3" placeholder="Örn: {N2 + 3H2 -> 2NH3} tepkimesine göre...">${esc(q.text)}</textarea>
          <span class="help">Kimya formülü: {H2O} → H₂O · {Na^+} → Na⁺ · {^14_6C} izotop. Matematik: $3/4$ → kesir · $x^2$ → üs · $sqrt(2)$ → kök · $<=$ → ≤ · **kalın** yazı</span></div>
        <div class="field"><label>Soru kökü görseli (isteğe bağlı)</label>
          <div class="opt-editor" id="stemed">${optionEditor(q.stem,'stem',true)}</div>
        </div>
        <h3 style="margin-top:6px">Şıklar <span class="muted" style="font-size:13px;font-family:var(--font-b)">— doğru şıkkı işaretleyin</span></h3>
        <div id="opteds">${q.options.map((o,i)=>`<div class="opt-editor ${q.answer===i?'is-correct':''}" data-oi="${i}">${optionEditor(o,'options.'+i,false,i)}</div>`).join('')}</div>
        <div class="btn-row" style="margin-bottom:14px">
          <button class="btn btn-sm btn-ghost" id="addopt" ${q.options.length>=5?'disabled':''}>➕ Şık ekle</button>
          <button class="btn btn-sm btn-ghost" id="rmopt" ${q.options.length<=2?'disabled':''}>➖ Son şıkkı sil</button>
        </div>
        <div class="field"><label>💡 İpucu (maskot söyler)</label><input class="inp" data-k="hint" value="${esc(q.hint)}"></div>
        <div class="field"><label>📖 Çözüm / Açıklama (cevaptan sonra gösterilir)</label><textarea class="inp" data-k="explanation" rows="3">${esc(q.explanation)}</textarea></div>
        <div class="btn-row"><button class="btn btn-good btn-big" id="save">💾 Kaydet</button><button class="btn btn-ghost" id="cancel">Vazgeç</button><button class="btn btn-cyan" id="pvfull">👁️ Tam önizleme</button></div>
      </div>
      <div class="preview-pane"><div class="pv-title">CANLI ÖNİZLEME</div><div class="preview-scale quiz" id="pv"></div></div>
    </div>`;
    bindEditor();
    preview();
  }
  function optionEditor(o,path,isStem,i){
    const types=isStem?{none:'— Görsel yok —',image:OPT_TYPES.image,atom:OPT_TYPES.atom,particles:OPT_TYPES.particles,orbital:OPT_TYPES.orbital,ghs:OPT_TYPES.ghs,fraction:OPT_TYPES.fraction,clock:OPT_TYPES.clock,graph:OPT_TYPES.graph,shape:OPT_TYPES.shape,count:OPT_TYPES.count,emoji:OPT_TYPES.emoji}:OPT_TYPES;
    const head=isStem?`<div class="oe-head"><select class="inp" data-type="${path}">${Object.entries(types).map(([k,v])=>`<option value="${k}" ${o.type===k?'selected':''}>${v}</option>`).join('')}</select></div>`
      :`<div class="oe-head"><span class="oe-letter" style="--c:var(--o${LETTERS[i]})">${LETTERS[i]}</span>
        <select class="inp" data-type="${path}">${Object.entries(types).map(([k,v])=>`<option value="${k}" ${o.type===k?'selected':''}>${v}</option>`).join('')}</select>
        <label class="oe-correct"><input type="radio" name="correct" value="${i}" ${draft.answer===i?'checked':''}> Doğru cevap</label></div>`;
    return head+`<div class="oe-fields">${fieldsFor(o,path)}</div>`;
  }
  function fieldsFor(o,p){
    const lab=`<input class="inp" data-k="${p}.label" value="${esc(o.label||'')}" placeholder="Alt yazı (isteğe bağlı) — örn: Model I">`;
    switch(o.type){
      case 'text': return `<input class="inp" data-k="${p}.value" value="${esc(o.value||'')}" placeholder="Şık metni — formül için {CO2}">`;
      case 'emoji': return `<div class="row2"><input class="inp" data-k="${p}.value" value="${esc(o.value||'')}" placeholder="Emoji: 🍋" style="font-size:22px"><input class="inp" data-k="${p}.label" value="${esc(o.label||'')}" placeholder="Etiket: Limon suyu"></div>`;
      case 'image': return `<div class="drop-zone"><input type="file" accept="image/*" data-img="${p}"> <div style="margin-top:6px">veya bağlantı:</div><input class="inp" data-k="${p}.src" value="${o.src&&!o.src.startsWith('data:')?esc(o.src):''}" placeholder="https://...png">
          ${o.src?`<img class="oe-thumb" src="${esc(o.src)}" style="margin:8px auto 0">`:''}</div>${lab}`;
      case 'atom': return `<div class="g3"><label class="ck">Proton<input class="inp" type="number" min="1" max="36" data-k="${p}.p" data-num value="${o.p??1}"></label>
          <label class="ck">Nötron<input class="inp" type="number" min="0" max="60" data-k="${p}.n" data-num value="${o.n??0}"></label>
          <label class="ck">Elektron<input class="inp" type="number" min="0" max="40" data-k="${p}.e" data-num value="${o.e??1}"></label></div>
          <div class="btn-row"><label class="ck"><input type="checkbox" data-k="${p}.showLabel" ${o.showLabel?'checked':''}> Sembol gösterimini yaz (ᴬ_Z X)</label>
          <label class="ck"><input type="checkbox" data-k="${p}.hideNucleus" ${o.hideNucleus?'checked':''}> Çekirdeği gizle (?)</label></div>${lab}`;
      case 'particles': return `<input class="inp" data-k="${p}.spec" value="${esc(o.spec||'')}" placeholder="Örn: XX*3, XY*2 veya HOH*6">
          <span class="help">Her büyük harf bir atomdur (X, Y, Z, Q genel atomlar; H, O, N, C, Cl… gerçek renkler). *sayı = tanecik adedi. Virgülle ayırın.</span>
          <select class="inp" data-k="${p}.layout"><option value="gas" ${o.layout==='gas'?'selected':''}>Gaz düzeni (dağınık)</option><option value="liquid" ${o.layout==='liquid'?'selected':''}>Sıvı düzeni</option><option value="solid" ${o.layout==='solid'?'selected':''}>Katı düzeni (düzenli)</option></select>${lab}`;
      case 'fraction': return `<div class="g3"><label class="ck">Pay<input class="inp" type="number" min="0" max="24" data-k="${p}.n" data-num value="${o.n??1}"></label>
          <label class="ck">Payda<input class="inp" type="number" min="1" max="24" data-k="${p}.d" data-num value="${o.d??2}"></label>
          <label class="ck">Görünüm<select class="inp" data-k="${p}.style"><option value="pie" ${o.style!=='bar'?'selected':''}>Daire (pasta)</option><option value="bar" ${o.style==='bar'?'selected':''}>Şerit</option></select></label></div>${lab}`;
      case 'clock': return `<div class="g3"><label class="ck">Saat (1–12)<input class="inp" type="number" min="1" max="12" data-k="${p}.h" data-num value="${o.h??3}"></label>
          <label class="ck">Dakika<input class="inp" type="number" min="0" max="59" step="5" data-k="${p}.m" data-num value="${o.m??0}"></label></div>${lab}`;
      case 'graph': return `<input class="inp" data-k="${p}.expr" value="${esc(o.expr||'')}" placeholder="Örn: 2x-3 · x^2-4 · -(x-1)^2+3 · abs(x) · sqrt(x)">
          <span class="help">Değişken x. İşlemler: + − * / ^ ve parantez; 2x, 3(x+1) gibi yazımlar olur. Fonksiyonlar: sqrt(), abs(). Görünüm −6 ile 6 arası.</span>${lab}`;
      case 'shape': return `<select class="inp" data-k="${p}.shape">${Object.entries(MathX.SHAPES).map(([k,v])=>`<option value="${k}" ${o.shape===k?'selected':''}>${v}</option>`).join('')}</select>
          <label class="ck"><input type="checkbox" data-k="${p}.showName" ${o.showName?'checked':''}> Şeklin adını alt yazı olarak göster</label>${lab}`;
      case 'count': return `<input class="inp" data-k="${p}.items" value="${esc(o.items||'')}" placeholder="Örn: 🍎*7  ya da  🔴*3, 🔵*5" style="font-size:18px">
          <span class="help">emoji*adet; farklı nesneleri virgülle ayırın (en fazla 30 adet).</span>${lab}`;
      case 'orbital': return `<input class="inp" data-k="${p}.spec" value="${esc(o.spec||'')}" placeholder="Örn: 1s=ud 2s=ud 2p=u.u.0  veya  Z=7">
          <span class="help">u = ↑, d = ↓, 0 = boş orbital; orbitaller nokta ile ayrılır (2p=ud.u.0). Hatalı diyagram çizmek için kurala aykırı yazabilirsiniz (2s=uu). <b>Z=7</b> yazarsanız azotun doğru temel hâl diyagramı çizilir; iyon için <b>Z=26 e=24</b>.</span>${lab}`;
      case 'ghs': return `<select class="inp" data-k="${p}.code">${Object.entries(GHS_INFO).map(([k,v])=>`<option value="${k}" ${o.code===k?'selected':''}>${v.name}</option>`).join('')}</select>
          <label class="ck"><input type="checkbox" data-k="${p}.showName" ${o.showName?'checked':''}> İşaretin adını alt yazı olarak göster</label>`;
      default: return '';
    }
  }
  function getPath(obj,path){return path.split('.').reduce((o,k)=>o?.[k],obj);}
  function setPath(obj,path,val){const ks=path.split('.');const last=ks.pop();const t=ks.reduce((o,k)=>o[k],obj);t[last]=val;}
  function bindEditor(){
    const body=$('#abody');
    if(!body._bound){body.addEventListener('input',onField);body.addEventListener('change',onField);body._bound=true;}
    $('#addopt').onclick=()=>{if(draft.options.length<5){draft.options.push({type:'text',value:'',label:''});renderEditor();}};
    $('#rmopt').onclick=()=>{if(draft.options.length>2){draft.options.pop();if(draft.answer>=draft.options.length) draft.answer=0;renderEditor();}};
    $('#save').onclick=save;
    $('#cancel').onclick=()=>{draft=null;renderList();};
    $('#pvfull').onclick=()=>Quiz.preview(normalize(Store.clone(draft)));
  }
  function onField(e){
    const el=e.target;
    if(!draft) return;
    if(el.name==='correct'){draft.answer=+el.value;$$('#opteds .opt-editor').forEach((d,i)=>d.classList.toggle('is-correct',i===draft.answer));return schedulePreview();}
    if(el.dataset.type){
      if(e.type!=='change') return;
      const path=el.dataset.type;const old=getPath(draft,path)||{};
      const nt=el.value;
      const fresh={type:nt,label:old.label||''};
      if(nt==='atom') Object.assign(fresh,{p:6,n:6,e:6});
      if(nt==='particles') Object.assign(fresh,{spec:'XX*3, XY*3',layout:'gas'});
      if(nt==='ghs') Object.assign(fresh,{code:'flame'});
      if(nt==='emoji') Object.assign(fresh,{value:'🧪'});
      if(nt==='orbital') Object.assign(fresh,{spec:'Z=7'});
      if(nt==='fraction') Object.assign(fresh,{n:1,d:2,style:'pie'});
      if(nt==='clock') Object.assign(fresh,{h:3,m:0});
      if(nt==='graph') Object.assign(fresh,{expr:'2x-1'});
      if(nt==='shape') Object.assign(fresh,{shape:'triangle'});
      if(nt==='count') Object.assign(fresh,{items:'🍎*5'});
      if(nt==='text') Object.assign(fresh,{value:old.value&&typeof old.value==='string'&&old.type==='text'?old.value:''});
      setPath(draft,path,fresh);
      const box=el.closest('.opt-editor');
      const isStem=path==='stem';const i=isStem?0:+path.split('.')[1];
      box.innerHTML=optionEditor(fresh,path,isStem,i);
      return schedulePreview();
    }
    if(el.dataset.img){
      if(e.type!=='change'||!el.files[0]) return;
      readImage(el.files[0]).then(src=>{const p=el.dataset.img;setPath(draft,p+'.src',src);const box=el.closest('.opt-editor');const isStem=p==='stem';box.innerHTML=optionEditor(getPath(draft,p),p,isStem,isStem?0:+p.split('.')[1]);schedulePreview();})
        .catch(()=>UI.toast('Görsel okunamadı.','bad'));
      return;
    }
    const k=el.dataset.k;if(!k) return;
    let v=el.type==='checkbox'?el.checked:el.value;
    if(el.hasAttribute('data-num')) v=+v;
    setPath(draft,k,v);
    schedulePreview();
  }
  function readImage(file){
    return new Promise((res,rej)=>{
      const fr=new FileReader();
      fr.onerror=rej;
      fr.onload=()=>{
        const img=new Image();img.onerror=rej;
        img.onload=()=>{
          const max=640;let {width:w,height:h}=img;
          const s=Math.min(1,max/Math.max(w,h));w=Math.round(w*s);h=Math.round(h*s);
          const cv=document.createElement('canvas');cv.width=w;cv.height=h;
          const c=cv.getContext('2d');c.drawImage(img,0,0,w,h);
          const png=file.type==='image/png'||file.type==='image/svg+xml';
          let out=png?cv.toDataURL('image/png'):cv.toDataURL('image/jpeg',.85);
          if(png&&out.length>350000) out=cv.toDataURL('image/jpeg',.85);
          res(out);
        };
        img.src=fr.result;
      };
      fr.readAsDataURL(file);
    });
  }
  function schedulePreview(){clearTimeout(pvTimer);pvTimer=setTimeout(preview,150);}
  function preview(){
    const pv=$('#pv');if(!pv||!draft) return;
    try{pv.innerHTML=Quiz.buildQuestionHTML(normalize(Store.clone(draft)),{mascot:false});}
    catch(err){pv.innerHTML='<div class="muted">Önizleme hatası: '+esc(err.message)+'</div>';}
  }
  function normalize(q){
    if(q.stem&&q.stem.type==='none') delete q.stem;
    q.grade=+q.grade||9;q.difficulty=+q.difficulty||1;q.answer=+q.answer||0;
    return q;
  }
  function validate(q){
    if(!String(q.text||'').trim()) return 'Soru metni boş olamaz.';
    if(!String(q.topic||'').trim()) return 'Konu boş olamaz.';
    for(let i=0;i<q.options.length;i++){
      const o=q.options[i];const L=LETTERS[i];
      if(o.type==='text'&&!String(o.value||'').trim()) return L+' şıkkının metni boş.';
      if(o.type==='emoji'&&!String(o.value||'').trim()) return L+' şıkkında emoji yok.';
      if(o.type==='image'&&!o.src) return L+' şıkkı için görsel seçilmedi.';
      if(o.type==='particles'&&!Visual.parseSpec(o.spec).length) return L+' şıkkının tanecik tanımı geçersiz.';
      if(o.type==='orbital'&&!Visual.parseOrbitalSpec(o.spec).length) return L+' şıkkının orbital tanımı geçersiz.';
      if(o.type==='fraction'&&!(o.d>=1&&o.n>=0&&o.n<=o.d)) return L+' şıkkında pay 0 ile payda arasında olmalı.';
      if(o.type==='clock'&&!(o.h>=1&&o.h<=12&&o.m>=0&&o.m<=59)) return L+' şıkkında saat 1–12, dakika 0–59 olmalı.';
      if(o.type==='graph'){try{MathX.compile(o.expr);}catch(err){return L+' şıkkının fonksiyonu hatalı: '+err.message;}}
      if(o.type==='count'&&!MathX.parseCount(o.items).length) return L+' şıkkında sayılacak nesne yok.';
      if(o.type==='atom'&&!(o.p>=1&&o.p<=36)) return L+' şıkkında proton sayısı 1–36 olmalı.';
    }
    if(q.answer<0||q.answer>=q.options.length) return 'Doğru cevap seçilmedi.';
    return null;
  }
  function save(){
    const q=normalize(Store.clone(draft));
    const err=validate(q);
    if(err){UI.toast('⚠️ '+err,'bad');FX.sfx.wrong();return;}
    const all=Store.questions();
    if(editIdx>=0) all[editIdx]=q; else all.push(q);
    if(Store.saveQuestions(all)){FX.sfx.correct();UI.toast('✅ Soru kaydedildi.','good');draft=null;renderList();}
  }

  /* ---------------- Denklemler ---------------- */
  function renderEquations(){
    const list=Store.equations();
    $('#abody').innerHTML=`<div class="editor">
      <div class="panel"><h3>➕ Denklem ekle</h3>
        <div class="field"><label>Denkleştirilmemiş denklem</label><input class="inp" id="eqin" placeholder="Örn: Fe + O2 -> Fe2O3" style="font-size:20px"><span class="help">Ok için -> veya = kullanın. Parantez ve hidrat desteklenir: Ca(OH)2, CuSO4·5H2O</span></div>
        <div class="eq-check" id="eqchk">Bir denklem yazın…</div>
        <div class="f3" style="margin-top:12px">
          <div class="field"><label>Başlık</label><input class="inp" id="eqtitle" placeholder="Paslanma"></div>
          <div class="field"><label>Simge</label><input class="inp" id="eqicon" value="🧪" style="font-size:20px"></div>
          <div class="field"><label>Sınıf</label><select class="inp" id="eqgrade">${[9,10,11,12].map(g=>`<option value="${g}">${g}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label>Bağlam (günlük hayat)</label><input class="inp" id="eqctx" placeholder="Demirin nemli havada paslanması..."></div>
        <button class="btn btn-good" id="eqadd" disabled>💾 Denklemi ekle</button>
      </div>
      <div class="panel"><h3>⚖️ Seviyeler (${list.length})</h3><div id="eqlist">${list.map((L,i)=>{
          let ok='',sol=null;try{const p=parseEquation(L.eq);sol=solveEquation(p);ok=sol?formatFormula(equationString(p,sol)):'<span style="color:#fca5a5">Denkleştirilemedi</span>';}catch(e){ok='<span style="color:#fca5a5">'+esc(e.message)+'</span>';}
          return `<div class="q-row"><div class="num">${i+1}</div><div><div class="qt">${esc(L.icon||'')} ${esc(L.title||'')}</div><div class="fml" style="font-size:18px;margin-top:4px">${ok}</div><div class="muted" style="font-size:12px;font-weight:700">${esc(L.context||'')}</div></div>
            <div class="acts"><button class="btn btn-sm btn-ghost" data-up="${i}" ${i===0?'disabled':''}>▲</button><button class="btn btn-sm btn-danger" data-rm="${i}">🗑️</button></div></div>`;}).join('')}</div></div>
    </div>`;
    let parsed=null;
    $('#eqin').oninput=e=>{
      const box=$('#eqchk');parsed=null;
      const v=e.target.value.trim();
      if(!v){box.className='eq-check';box.textContent='Bir denklem yazın…';$('#eqadd').disabled=true;return;}
      try{const p=parseEquation(v);const s=solveEquation(p);
        if(!s) throw new Error('Bu denklem küçük katsayılarla denkleştirilemedi (en fazla 6 madde).');
        parsed=p;box.className='eq-check ok';box.innerHTML='✓ Çözüm: <span class="fml" style="font-size:18px">'+formatFormula(equationString(p,s))+'</span>';$('#eqadd').disabled=false;
      }catch(err){box.className='eq-check err';box.textContent='✗ '+err.message;$('#eqadd').disabled=true;}
    };
    $('#eqadd').onclick=()=>{
      if(!parsed) return;
      const all=Store.equations();
      all.push({id:uid(),eq:$('#eqin').value.trim(),title:$('#eqtitle').value.trim()||'Yeni denklem',icon:$('#eqicon').value.trim()||'🧪',grade:+$('#eqgrade').value,context:$('#eqctx').value.trim()});
      if(Store.saveEquations(all)){UI.toast('✅ Denklem eklendi.','good');renderEquations();}
    };
    $('#eqlist').onclick=e=>{
      const all=Store.equations();
      const rm=e.target.closest('[data-rm]'),up=e.target.closest('[data-up]');
      if(rm){const i=+rm.dataset.rm;UI.confirm('Bu denklem silinsin mi?',()=>{all.splice(i,1);Store.saveEquations(all);renderEquations();},{yes:'Sil',danger:true});}
      if(up){const i=+up.dataset.up;[all[i-1],all[i]]=[all[i],all[i-1]];Store.saveEquations(all);renderEquations();}
    };
  }

  /* ---------------- Ayarlar ---------------- */
  function renderSettings(){
    $('#abody').innerHTML=`<div class="editor">
      <div class="panel"><h3>💾 Yedekle / Paylaş</h3>
        <p class="muted">Soruların ve denklemlerin bu tarayıcıda saklanır. Başka bir bilgisayara (ör. akıllı tahtaya) taşımak veya meslektaşınla paylaşmak için dışa aktar.</p>
        <div class="btn-row"><button class="btn btn-primary" id="exp">⬇️ Dışa aktar (.json)</button>
          <label class="btn btn-cyan" style="cursor:pointer">⬆️ İçe aktar<input type="file" accept=".json,application/json" id="imp" hidden></label></div>
        <h3 style="margin-top:24px">♻️ Sıfırla</h3>
        <div class="btn-row"><button class="btn btn-gold" id="rstc">Örnek içeriğe dön</button><button class="btn btn-danger" id="rstp">Öğrenci ilerlemesini sıfırla</button></div>
      </div>
      <div class="panel"><h3>🔐 PIN değiştir</h3>
        <div class="field"><label>Yeni PIN (en az 4 karakter)</label><input class="inp" id="np" type="password" maxlength="12"></div>
        <div class="field"><label>Yeni PIN (tekrar)</label><input class="inp" id="np2" type="password" maxlength="12"></div>
        <button class="btn btn-primary" id="savepin">Kaydet</button>
        <p class="muted" style="font-size:12px;margin-top:14px">Not: Bu PIN yalnızca öğrencilerin paneli yanlışlıkla açmasını önleyen basit bir kilittir; veriler tarayıcıda saklandığı için gerçek bir güvenlik önlemi değildir.</p>
        <h3 style="margin-top:20px">📊 İçerik</h3>
        <div class="stats-list"><div class="mini-stat"><b>${Store.questions().length}</b><span>Soru</span></div><div class="mini-stat"><b>${Store.equations().length}</b><span>Denklem</span></div></div>
      </div></div>`;
    $('#exp').onclick=()=>{
      const data={app:'Dersbaz',version:1,exported:new Date().toISOString(),questions:Store.questions(),equations:Store.equations()};
      UI.download('dersbaz-yedek-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(data,null,1));
    };
    $('#imp').onchange=e=>{
      const f=e.target.files[0];if(!f) return;
      const fr=new FileReader();
      fr.onload=()=>{
        let d;try{d=JSON.parse(fr.result);}catch(err){UI.toast('Dosya okunamadı (geçersiz JSON).','bad');return;}
        if(!Array.isArray(d.questions)){UI.toast('Bu dosyada soru listesi yok.','bad');return;}
        UI.modal({title:'⬆️ İçe aktar',html:`<p>Dosyada <b>${d.questions.length}</b> soru ve <b>${(d.equations||[]).length}</b> denklem var.</p><p class="muted">“Ekle” mevcut içeriği korur, “Değiştir” mevcut içeriğin yerine koyar.</p>`,
          buttons:[{label:'Vazgeç',cls:'btn-ghost'},
            {label:'Ekle',cls:'btn-primary',onClick:()=>{Store.saveQuestions([...Store.questions(),...d.questions.map(q=>({...q,id:uid()}))]);if(d.equations) Store.saveEquations([...Store.equations(),...d.equations.map(x=>({...x,id:uid()}))]);UI.toast('İçe aktarıldı.','good');renderSettings();}},
            {label:'Değiştir',cls:'btn-danger',onClick:()=>{Store.saveQuestions(d.questions);if(d.equations) Store.saveEquations(d.equations);UI.toast('İçerik değiştirildi.','good');renderSettings();}}]});
      };
      fr.readAsText(f);
    };
    $('#rstc').onclick=()=>UI.confirm('Tüm sorular ve denklemler örnek içerikle değiştirilecek. Kendi eklediklerin silinir (önce dışa aktarmanı öneririz).',()=>{Store.del('questions');Store.del('equations');UI.toast('Örnek içerik yüklendi.','good');renderSettings();},{yes:'Sıfırla',danger:true});
    $('#rstp').onclick=()=>UI.confirm('Bu tarayıcıdaki oyuncu profili, XP, rozetler ve rekorlar silinecek.',()=>{Store.del('profile');Game.refreshHUD();UI.toast('İlerleme sıfırlandı.','good');},{yes:'Sıfırla',danger:true});
    $('#savepin').onclick=()=>{
      const a=$('#np').value,b=$('#np2').value;
      if(a.length<4) return UI.toast('PIN en az 4 karakter olmalı.','bad');
      if(a!==b) return UI.toast('PIN\'ler eşleşmiyor.','bad');
      const s=Store.settings();s.pin=a;Store.saveSettings(s);UI.toast('🔐 PIN güncellendi.','good');$('#np').value=$('#np2').value='';
    };
  }
  function unmount(){draft=null;app=null;clearTimeout(pvTimer);}
  return {mount,unmount};
})();
