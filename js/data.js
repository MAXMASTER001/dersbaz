'use strict';
/* =========================================================
   Varsayılan içerik — öğretmen panelinden düzenlenebilir.
   Metinde {H2O} yazımı formülü biçimlendirir: H₂O
   {Na^+} → Na⁺ , {SO4^2-} → SO₄²⁻ , {^14_6C} → ¹⁴₆C
   ========================================================= */
const TOPICS = [
  'Atom ve Periyodik Sistem',
  'Elektron Dizilimi ve Orbitaller',
  'Madde ve Sınıflandırma',
  'Maddenin Halleri',
  'Kimyasal Türler Arası Etkileşimler',
  'Kimyasal Tepkimeler',
  'Asitler, Bazlar ve Tuzlar',
  'Laboratuvar Güvenliği',
  'Kimya ve Sürdürülebilirlik',
];

const T = (value,label)=>({type:'text',value,label:label||''});
const EM = (value,label)=>({type:'emoji',value,label});
const AT = (p,n,e,extra={})=>Object.assign({type:'atom',p,n,e,label:''},extra);
const PA = (spec,layout='gas',label='')=>({type:'particles',spec,layout,label});
const GH = (code,label='')=>({type:'ghs',code,label});
const OR = (spec,label='')=>({type:'orbital',spec,label});

const DEFAULT_QUESTIONS = [
{
  id:'q01',topic:'Atom ve Periyodik Sistem',grade:9,difficulty:2,
  text:'Aşağıdaki atom modellerinden hangisi {Na^+} iyonunu temsil eder? (Sodyumun atom numarası 11\'dir.)',
  options:[AT(11,12,11),AT(11,12,10),AT(10,10,10),AT(12,12,10),AT(11,12,12)],
  answer:1,
  hint:'Katyon, elektron vermiş atomdur. Proton sayısı asla değişmez!',
  explanation:'{Na^+} iyonunda proton sayısı 11, elektron sayısı 11 − 1 = 10\'dur. Elektron dizilimi 2, 8 olur ve soy gaz Ne\'nin düzenine benzer.'
},
{
  id:'q02',topic:'Madde ve Sınıflandırma',grade:9,difficulty:1,
  text:'Aşağıdaki tanecik modellerinden hangisi bir **bileşiği** temsil eder? (Farklı renkler farklı atom türlerini göstermektedir.)',
  options:[PA('XX*4'),PA('X*6'),PA('XY*5'),PA('XX*3,YY*3'),PA('XY*3,X*3')],
  answer:2,
  hint:'Bileşik: tek tür tanecik, ama o taneciğin içinde farklı atomlar var.',
  explanation:'Bileşikler, iki ya da daha fazla farklı atomun belirli oranlarda kimyasal bağlarla birleşmesiyle oluşur. C seçeneğinde tüm tanecikler aynı XY molekülleridir.'
},
{
  id:'q03',topic:'Maddenin Halleri',grade:9,difficulty:1,
  text:'Aynı maddenin farklı hâllerine ait tanecik modelleri verilmiştir. Hangisi **gaz** hâlini temsil eder?',
  options:[PA('HOH*9','liquid','Model I'),PA('HOH*9','gas','Model II'),PA('HOH*9','solid','Model III')],
  answer:1,
  hint:'Hangi modelde tanecikler kabın her yerine dağılmış?',
  explanation:'Gaz hâlinde tanecikler arası boşluk çok fazladır; tanecikler düzensiz ve hızlı hareket eder ve kabın tamamını doldurur.'
},
{
  id:'q04',topic:'Laboratuvar Güvenliği',grade:9,difficulty:1,
  text:'Etiketinde yukarıdaki güvenlik işareti bulunan bir madde ile çalışırken alınması gereken **en öncelikli** önlem hangisidir?',
  stem:GH('flame'),
  options:[T('Madde ısı, kıvılcım ve açık alevden uzak tutulmalıdır.'),T('Madde mutlaka suyla seyreltilerek kullanılmalıdır.'),T('Madde yalnızca buzdolabında saklanmalıdır.'),T('Madde kokusu koklanarak tanınmalıdır.'),T('Kullanılmayan madde lavaboya dökülmelidir.')],
  answer:0,
  hint:'Bu işaret alev sembolüdür.',
  explanation:'Alev sembolü maddenin **yanıcı** olduğunu gösterir. Yanıcı maddeler ısı, kıvılcım ve açık alevden uzak tutulmalıdır.'
},
{
  id:'q05',topic:'Laboratuvar Güvenliği',grade:9,difficulty:2,
  text:'Aşağıdaki güvenlik işaretlerinden hangisi **aşındırıcı (korozif)** maddeleri belirtir?',
  options:[GH('flame'),GH('skull'),GH('environment'),GH('corrosive'),GH('exclamation')],
  answer:3,
  hint:'Aşındırıcı maddeler deriye ve metal yüzeylere zarar verir.',
  explanation:'Aşındırıcı işaretinde iki kaptan dökülen damlaların bir yüzeyi ve eli aşındırdığı görülür. Derişik asit ve bazlar bu gruptadır.'
},
{
  id:'q06',topic:'Kimyasal Tepkimeler',grade:9,difficulty:2,
  text:'{N2 + 3H2 -> 2NH3} tepkimesine göre 6 tane {H2} molekülü yeterince {N2} ile tamamen tepkimeye girerse kaç tane {NH3} molekülü oluşur?',
  options:[T('2'),T('3'),T('4'),T('6'),T('9')],
  answer:2,
  hint:'3 tane H₂ ile 2 tane NH₃ oluşuyor. 6 tane H₂ bunun kaç katı?',
  explanation:'Katsayı oranı {H2} : {NH3} = 3 : 2\'dir. 6 tane {H2} kullanılırsa 6 × 2 / 3 = 4 tane {NH3} oluşur.'
},
{
  id:'q07',topic:'Asitler, Bazlar ve Tuzlar',grade:9,difficulty:1,
  text:'Aşağıdaki maddelerden hangisinin sulu çözeltisi kırmızı turnusol kâğıdını **maviye** çevirir?',
  options:[EM('🍋','Limon suyu'),EM('🍶','Sirke'),EM('🥤','Gazoz'),EM('💧','Saf su'),EM('🧼','Sabunlu su')],
  answer:4,
  hint:'Kırmızı turnusolü maviye çeviren maddeler bazik özellik gösterir.',
  explanation:'Sabunlu su baziktir (pH > 7). Bazlar kırmızı turnusol kâğıdını maviye çevirir. Limon suyu, sirke ve gazoz asidik; saf su nötrdür.'
},
{
  id:'q08',topic:'Asitler, Bazlar ve Tuzlar',grade:9,difficulty:1,
  text:'Aşağıdakilerden hangisinin pH değeri **en küçüktür**?',
  options:[EM('🥛','Süt'),EM('🍋','Limon suyu'),EM('🍅','Domates suyu'),EM('🧁','Kabartma tozu çözeltisi'),EM('🧴','Çamaşır suyu')],
  answer:1,
  hint:'pH küçüldükçe asitlik artar. En ekşi olan hangisi?',
  explanation:'Limon suyunun pH değeri yaklaşık 2–2,5\'tir. Domates suyu ~4, süt ~6,5, kabartma tozu çözeltisi ~8,5, çamaşır suyu ~12,5\'tir.'
},
{
  id:'q09',topic:'Kimyasal Türler Arası Etkileşimler',grade:9,difficulty:2,
  text:'Aşağıdaki bileşiklerden hangisinde **iyonik bağ** bulunur?',
  options:[T('{HCl}'),T('{H2O}'),T('{CO2}'),T('{NaCl}'),T('{CH4}')],
  answer:3,
  hint:'İyonik bağ çoğunlukla bir metal ile bir ametal arasında oluşur.',
  explanation:'Na (metal) bir elektron verip {Na^+}, Cl (ametal) bir elektron alıp {Cl^-} olur. Zıt yüklü iyonlar arasındaki çekim **iyonik bağdır**. Diğerlerinde kovalent bağ vardır.'
},
{
  id:'q10',topic:'Atom ve Periyodik Sistem',grade:9,difficulty:2,
  text:'Hangi atom modeli periyodik sistemin **3. periyot, 2A grubundaki** elementine aittir?',
  options:[AT(11,12,11,{hideNucleus:true}),AT(4,5,4,{hideNucleus:true}),AT(20,20,20,{hideNucleus:true}),AT(13,14,13,{hideNucleus:true}),AT(12,12,12,{hideNucleus:true})],
  answer:4,
  hint:'Periyot = katman sayısı, A grubu = son katmandaki elektron sayısı.',
  explanation:'3. periyot → 3 enerji katmanı; 2A grubu → değerlik katmanında 2 elektron. Dizilimi 2, 8, 2 olan atom magnezyumdur (Mg).'
},
{
  id:'q11',topic:'Atom ve Periyodik Sistem',grade:9,difficulty:2,
  text:'Aşağıdakilerden hangisi karbon-12 ({^12_6C}) atomunun bir **izotopudur**?',
  options:[AT(7,6,7,{showLabel:true}),AT(5,7,5,{showLabel:true}),AT(6,8,6,{showLabel:true}),AT(8,6,8,{showLabel:true}),AT(7,7,7,{showLabel:true})],
  answer:2,
  hint:'İzotoplarda proton sayısı aynıdır.',
  explanation:'İzotop atomların proton sayıları aynı, nötron sayıları farklıdır. {^14_6C} atomunda 6 proton ve 8 nötron bulunur; {^12_6C} ile izotoptur.'
},
{
  id:'q12',topic:'Kimya ve Sürdürülebilirlik',grade:10,difficulty:1,
  text:'Bir kimya fabrikası **yeşil kimya** ilkelerine uygun üretim yapmak istiyor. Aşağıdaki uygulamalardan hangisi bu amaca **en uygun** olandır?',
  options:[T('Atıkları arıtmadan nehre boşaltmak'),T('Zehirli organik çözücüler yerine su bazlı çözücüler kullanmak'),T('Enerji tasarrufu için güvenlik sistemlerini kapatmak'),T('Tek kullanımlık ambalaj miktarını artırmak'),T('Tepkimeleri gereğinden yüksek sıcaklıkta yürütmek')],
  answer:1,
  hint:'Yeşil kimya; tehlikeli madde ve atığı en aza indirmeyi hedefler.',
  explanation:'Yeşil kimya; daha güvenli çözücüler kullanmayı, atığı önlemeyi ve enerji verimliliğini hedefler. Su bazlı çözücüler insan sağlığı ve çevre için daha güvenlidir.'
},
{
  id:'q13',topic:'Kimyasal Tepkimeler',grade:9,difficulty:1,
  text:'Aşağıdaki olaylardan hangisi **kimyasal değişimdir**?',
  options:[EM('🧊','Buzun erimesi'),EM('💨','Suyun buharlaşması'),EM('✂️','Kâğıdın kesilmesi'),EM('🔥','Odunun yanması'),EM('🧂','Tuzun suda çözünmesi')],
  answer:3,
  hint:'Kimyasal değişimde maddenin kimliği değişir; yeni maddeler oluşur.',
  explanation:'Odun yandığında {CO2}, su buharı ve kül gibi yeni maddeler oluşur; bu bir **kimyasal değişimdir**. Diğerlerinde maddenin kimliği değişmez.'
},
{
  id:'q14',topic:'Kimyasal Tepkimeler',grade:9,difficulty:2,
  text:'Kapalı bir kapta 12 g karbon ile 32 g oksijen gazı artansız tepkimeye girerek {CO2} gazı oluşturuyor. Oluşan {CO2} kaç gramdır?',
  options:[T('12 g'),T('20 g'),T('32 g'),T('44 g'),T('64 g')],
  answer:3,
  hint:'Lavoisier: Kapalı kapta kütle korunur!',
  explanation:'Kütlenin korunumu yasasına göre girenlerin toplam kütlesi ürünlerin toplam kütlesine eşittir: 12 g + 32 g = 44 g {CO2}.'
},
{
  id:'q15',topic:'Maddenin Halleri',grade:9,difficulty:2,
  text:'Saf buz, normal basınçta erirken aşağıdakilerden hangisi **değişmez**?',
  options:[T('Sıcaklık'),T('Tanecikler arası uzaklık'),T('Maddenin hâli'),T('Taneciklerin hareketliliği'),T('Hacim')],
  answer:0,
  hint:'Hâl değişimi sırasında verilen ısı nereye harcanır?',
  explanation:'Saf maddeler hâl değiştirirken sıcaklık sabit kalır. Verilen ısı, tanecikler arası etkileşimleri zayıflatmak için kullanılır.'
},
{
  id:'q16',topic:'Kimyasal Türler Arası Etkileşimler',grade:10,difficulty:2,
  text:'Aşağıdaki maddelerin hangisinde molekülleri arasında **hidrojen bağı** bulunur?',
  options:[T('{CH4}'),T('{H2O}'),T('{H2S}'),T('{CO2}'),T('{HCl}')],
  answer:1,
  hint:'Hidrojen bağı için H atomu F, O veya N atomuna bağlı olmalıdır.',
  explanation:'{H2O} molekülünde H atomları çok elektronegatif O atomuna bağlıdır; moleküller arasında hidrojen bağı oluşur. Bu yüzden suyun kaynama noktası yüksektir.'
},
{
  id:'q17',topic:'Madde ve Sınıflandırma',grade:9,difficulty:2,
  text:'Yukarıdaki kapta bulunan madde ile ilgili aşağıdakilerden hangisi doğrudur?',
  stem:PA('XX*3,XY*3','gas'),
  options:[T('Saf bir elementtir.'),T('Saf bir bileşiktir.'),T('Element ve bileşikten oluşan bir karışımdır.'),T('İki farklı elementten oluşan bir karışımdır.'),T('Yalnızca atomlardan oluşan bir elementtir.')],
  answer:2,
  hint:'Kaç tane farklı tanecik türü görüyorsun?',
  explanation:'Kapta iki tür tanecik var: XX (element molekülü) ve XY (bileşik molekülü). Birden fazla tür tanecik içerdiği için **karışımdır**.'
},
{
  id:'q18',topic:'Madde ve Sınıflandırma',grade:9,difficulty:2,
  text:'Hangisi **iki farklı elementten oluşan bir karışımın** modelidir?',
  options:[PA('XY*5'),PA('XX*6'),PA('XY*3,XX*2'),PA('XX*3,YY*3'),PA('XXY*4')],
  answer:3,
  hint:'Her tanecik türü tek cins atomdan oluşmalı ama iki tür tanecik olmalı.',
  explanation:'D seçeneğinde XX ve YY olmak üzere iki farklı element molekülü vardır. Bunlar kimyasal bağla birleşmemiş, yalnızca karışmıştır.'
},
{
  id:'q19',topic:'Atom ve Periyodik Sistem',grade:9,difficulty:1,
  text:'Elektron dizilimi **2, 8, 7** olan nötr bir atom periyodik sistemin hangi grubunda yer alır?',
  stem:AT(17,18,17,{hideNucleus:true}),
  options:[T('1A (1. grup)'),T('2A (2. grup)'),T('5A (15. grup)'),T('7A (17. grup)'),T('8A (18. grup)')],
  answer:3,
  hint:'Son katmandaki elektron sayısına bak.',
  explanation:'Son katmanda 7 elektron bulunduğu için atom 7A (17.) grubundadır. Bu atom klordur (Cl) ve halojenler ailesindendir.'
},
{
  id:'q20',topic:'Laboratuvar Güvenliği',grade:9,difficulty:1,
  text:'Deney tüpünde bir sıvı ısıtılırken aşağıdaki uygulamalardan hangisi **doğrudur**?',
  options:[T('Tüpün ağzı kendimize doğru tutulur.'),T('Tüp ağzına kadar doldurulur.'),T('Tüpün ağzı kimsenin bulunmadığı bir yöne çevrilir ve tüp hafifçe sallanır.'),T('Isıtma sırasında tüpün içine eğilip bakılır.'),T('Sıcak tüp çıplak elle tutulur.')],
  answer:2,
  hint:'Sıvı aniden sıçrayabilir!',
  explanation:'Isıtılan sıvı ani kaynamayla sıçrayabilir. Tüpün ağzı kimseye doğru tutulmaz, tüp maşa ile tutulur ve hafifçe sallanarak ısıtılır.'
},
{
  id:'q21',topic:'Asitler, Bazlar ve Tuzlar',grade:10,difficulty:1,
  text:'Aşağıdaki maddelerden hangisi bir **bazdır**?',
  options:[T('{HNO3}'),T('{KOH}'),T('{CH3COOH}'),T('{H2SO4}'),T('{HCl}')],
  answer:1,
  hint:'Suda çözündüğünde {OH^-} iyonu veren madde hangisi?',
  explanation:'{KOH} suda çözündüğünde {K^+} ve {OH^-} iyonlarını oluşturur; kuvvetli bir bazdır. Diğerleri asittir.'
},
{
  id:'q22',topic:'Kimyasal Tepkimeler',grade:9,difficulty:2,
  text:'Aşağıdaki denklemlerden hangisi **denkleştirilmiştir**?',
  options:[T('{H2 + O2 -> H2O}'),T('{2Na + Cl2 -> 2NaCl}'),T('{CH4 + O2 -> CO2 + 2H2O}'),T('{Fe + O2 -> Fe2O3}'),T('{N2 + H2 -> 2NH3}')],
  answer:1,
  hint:'Her element için girenlerdeki ve ürünlerdeki atom sayısını say.',
  explanation:'{2Na + Cl2 -> 2NaCl} denkleminde her iki tarafta 2 Na ve 2 Cl atomu vardır. Diğerlerinde atom sayıları eşit değildir.'
},
{
  id:'q23',topic:'Kimya ve Sürdürülebilirlik',grade:9,difficulty:1,
  text:'Aşağıdaki gazlardan hangisi **sera etkisine** en fazla katkı yapan gazlardandır?',
  options:[T('{CO2}'),T('{N2}'),T('{O2}'),T('{Ar}'),T('{He}')],
  answer:0,
  hint:'Fosil yakıtların yanmasıyla atmosferdeki miktarı artan gaz.',
  explanation:'{CO2}, yeryüzünden yayılan ısıyı (kızılötesi ışınları) soğurarak sera etkisine katkı yapar. Fosil yakıt kullanımı atmosferdeki {CO2} miktarını artırır.'
},
{
  id:'q24',topic:'Elektron Dizilimi ve Orbitaller',grade:9,difficulty:2,
  text:'Azot ({_7N}) atomunun 2p orbitallerindeki elektronlardan hangisi **Hund kuralına** uygun yerleştirilmiştir?',
  options:[OR('2p=ud.u.0'),OR('2p=u.d.u'),OR('2p=u.u.u'),OR('2p=ud.0.u'),OR('2p=d.u.u')],
  answer:2,
  hint:'Eş enerjili orbitallere elektronlar önce birer birer ve aynı yönlü spinle yerleşir.',
  explanation:'Hund kuralına göre 2p\'deki 3 elektron üç orbitale **birer birer** ve **paralel spinle** yerleşir: ↑ ↑ ↑. Eşleşme ancak tüm orbitaller yarı dolduktan sonra başlar.'
},
{
  id:'q25',topic:'Elektron Dizilimi ve Orbitaller',grade:9,difficulty:1,
  text:'Aşağıdaki orbital gösterimlerinden hangisi **Pauli ilkesine** aykırıdır?',
  options:[OR('1s=ud'),OR('2p=u.u.0'),OR('3s=u'),OR('2s=uu'),OR('2p=ud.u.u')],
  answer:3,
  hint:'Aynı orbitaldeki iki elektronun spinlerine bak.',
  explanation:'Pauli ilkesine göre bir orbitalde en fazla iki elektron bulunur ve bu elektronların spinleri **zıt** olmalıdır (↑↓). D seçeneğinde iki elektron aynı yönlüdür (↑↑).'
},
{
  id:'q26',topic:'Elektron Dizilimi ve Orbitaller',grade:9,difficulty:2,
  text:'Karbon ({_6C}) atomunun **temel hâl** orbital diyagramı hangisidir?',
  options:[OR('1s=ud 2s=u 2p=u.u.u'),OR('1s=ud 2s=ud 2p=ud.0.0'),OR('1s=ud 2s=ud 2p=u.u.0'),OR('1s=u 2s=ud 2p=u.u.u'),OR('1s=ud 2s=ud 2p=u.d.0')],
  answer:2,
  hint:'Aufbau, Pauli ve Hund kurallarının üçüne birden uymalı.',
  explanation:'Temel hâlde önce 1s, sonra 2s dolar (Aufbau). Kalan 2 elektron 2p orbitallerine birer birer ve aynı spinle yerleşir (Hund): 1s² 2s² 2p². A ve D uyarılmış hâldir; B ve E Hund kuralına aykırıdır.'
},
{
  id:'q27',topic:'Elektron Dizilimi ve Orbitaller',grade:9,difficulty:1,
  text:'Aufbau ilkesine göre **3d** orbitallerinden hemen önce hangi orbital dolar?',
  options:[T('3p'),T('4s'),T('4p'),T('3s'),T('4d')],
  answer:1,
  hint:'Köşegen kuralını hatırla: n + ℓ değeri küçük olan önce dolar.',
  explanation:'4s orbitalinin enerjisi (n + ℓ = 4) 3d orbitalinden (n + ℓ = 5) düşüktür. Bu yüzden dolma sırası … 3p → **4s** → 3d → 4p şeklindedir.'
},
{
  id:'q28',topic:'Elektron Dizilimi ve Orbitaller',grade:9,difficulty:2,
  text:'Temel hâldeki klor ({_17Cl}) atomunda kaç tane **yarı dolu** orbital vardır?',
  stem:OR('Z=17'),
  options:[T('0'),T('1'),T('2'),T('3'),T('5')],
  answer:1,
  hint:'Son orbital 3p⁵. Beş elektron üç orbitale nasıl dağılır?',
  explanation:'Klorun dizilimi 1s² 2s² 2p⁶ 3s² 3p⁵\'tir. 3p\'deki 5 elektron ↑↓ ↑↓ ↑ şeklinde yerleşir; yalnızca **1** orbital yarı doludur.'
},
{
  id:'q29',topic:'Elektron Dizilimi ve Orbitaller',grade:10,difficulty:3,
  text:'Demir ({_26Fe}) atomunun 3d orbitallerindeki elektronların temel hâldeki yerleşimi hangisidir?',
  options:[OR('3d=ud.ud.u.u.0'),OR('3d=u.u.u.u.u'),OR('3d=ud.ud.ud.0.0'),OR('3d=ud.u.u.u.d'),OR('3d=ud.u.u.u.u')],
  answer:4,
  hint:'Fe: [Ar] 4s² 3d⁶. Altı elektronu beş orbitale Hund kuralıyla dağıt.',
  explanation:'3d⁶: beş orbitale önce birer tane aynı yönlü elektron yerleşir (↑↑↑↑↑), altıncı elektron ilk orbitalde eşleşir (↑↓). Böylece 4 yarı dolu orbital kalır.'
},
];

// Sürüm 1'de dağıtılan örnek soru kimlikleri (sonradan eklenen örnekleri mevcut kullanıcılara aktarmak için)
const DEFAULT_V1_IDS = Array.from({length:23},(_,i)=>'q'+String(i+1).padStart(2,'0'));

const DEFAULT_EQUATIONS = [
  {id:'e01',eq:'H2 + O2 -> H2O',title:'Roket yakıtı',context:'Hidrojenin yanmasıyla su oluşur. Uzay mekiklerinde yakıt olarak kullanılır.',icon:'🚀',grade:9},
  {id:'e02',eq:'Na + Cl2 -> NaCl',title:'Sofra tuzu',context:'Sodyum metali ile klor gazı tepkimeye girerek sofra tuzunu oluşturur.',icon:'🧂',grade:9},
  {id:'e03',eq:'N2 + H2 -> NH3',title:'Gübre üretimi',context:'Haber-Bosch yöntemiyle amonyak üretilir; amonyak gübre yapımında kullanılır.',icon:'🌾',grade:9},
  {id:'e04',eq:'CH4 + O2 -> CO2 + H2O',title:'Doğal gazın yanması',context:'Evlerimizde ısınmak için yaktığımız doğal gazın (metan) yanma tepkimesi.',icon:'🔥',grade:9},
  {id:'e05',eq:'Mg + O2 -> MgO',title:'Parlak ışık',context:'Magnezyum şerit yandığında göz kamaştırıcı beyaz bir ışık yayar.',icon:'✨',grade:9},
  {id:'e06',eq:'Fe + O2 -> Fe2O3',title:'Paslanma',context:'Demirin nemli havada oksijenle tepkimeye girmesi sonucu pas oluşur.',icon:'🔩',grade:9},
  {id:'e07',eq:'Al + O2 -> Al2O3',title:'Koruyucu tabaka',context:'Alüminyum yüzeyinde oluşan ince oksit tabakası metali korozyondan korur.',icon:'🛡️',grade:10},
  {id:'e08',eq:'Ca(OH)2 + HCl -> CaCl2 + H2O',title:'Nötralleşme',context:'Bir baz ile bir asit tepkimeye girerek tuz ve su oluşturur.',icon:'🧪',grade:10},
  {id:'e09',eq:'NaHCO3 -> Na2CO3 + CO2 + H2O',title:'Kekin kabarması',context:'Kabartma tozu (sodyum bikarbonat) ısıtılınca CO₂ gazı açığa çıkar ve hamur kabarır.',icon:'🧁',grade:10},
  {id:'e10',eq:'KClO3 -> KCl + O2',title:'Oksijen eldesi',context:'Potasyum klorat ısıtıldığında oksijen gazı açığa çıkar.',icon:'💨',grade:10},
  {id:'e11',eq:'C3H8 + O2 -> CO2 + H2O',title:'Tüp gaz (propan)',context:'Mangal ve ocak tüplerindeki propanın yanma tepkimesi.',icon:'🍳',grade:10},
  {id:'e12',eq:'Fe2O3 + CO -> Fe + CO2',title:'Yüksek fırın',context:'Demir cevheri yüksek fırında karbon monoksit ile indirgenerek demir elde edilir.',icon:'🏭',grade:10},
  {id:'e13',eq:'Al + HCl -> AlCl3 + H2',title:'Metal ve asit',context:'Alüminyum hidroklorik asitle tepkimeye girerek hidrojen gazı açığa çıkarır.',icon:'🫧',grade:10},
  {id:'e14',eq:'C6H12O6 + O2 -> CO2 + H2O',title:'Hücresel solunum',context:'Hücrelerimiz glikozu oksijenle tepkimeye sokarak enerji elde eder.',icon:'🫀',grade:10},
  {id:'e15',eq:'C2H6 + O2 -> CO2 + H2O',title:'Etanın yanması',context:'Zorlu seviye! Etan gazının tam yanma tepkimesi.',icon:'🏆',grade:11},
];

const FACTS = [
  'Bir bardak sudaki molekül sayısı, Dünya\'daki tüm okyanuslardaki bardak sayısından fazladır.',
  'Elmas ve grafit aynı elementten, karbondan oluşur. Farkları atomların diziliş biçimidir.',
  'Helyum, Dünya\'dan önce Güneş\'te keşfedildi (1868, Güneş ışığının tayf çizgileriyle).',
  'Mendeleyev 1869\'da periyodik tabloyu düzenlerken henüz keşfedilmemiş elementler için boşluk bıraktı.',
  'Mide öz suyunun pH değeri yaklaşık 1,5–3,5 arasındadır.',
  'Antoine Lavoisier, kapalı kaplarda yaptığı deneylerle kütlenin korunumu yasasını ortaya koydu.',
  'Soluduğumuz hava yaklaşık %78 azot ve %21 oksijenden oluşur.',
  'Buz suyun üzerinde yüzer çünkü katı su, sıvı sudan daha az yoğundur.',
  'Vücudumuzdaki atomların yaklaşık üçte ikisi hidrojen atomudur.',
  'Altın o kadar kolay işlenir ki 1 gramı yaklaşık 1 m²\'lik bir yaprak hâline getirilebilir.',
];
