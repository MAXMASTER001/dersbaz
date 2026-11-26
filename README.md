# Dersbaz — Dersi oyuna çevir! (Kimya ve Matematik, Maarif Modeli)

Kurulum gerektirmeyen, tarayıcıda çalışan oyun tabanlı öğrenme uygulaması. Açılışta ders seçilir (Kimya, Matematik); her dersin kendi oyunları, maskotu, soruları ve rozetleri vardır.
Akıllı tahta, bilgisayar, tablet ve telefonda çalışır.

## Çalıştırma

En kolayı: klasörde bir yerel sunucu başlatıp tarayıcıda açmak.

```bash
cd /Users/m4/cd/KimyaOyun && python3 -m http.server 8781
```

Sonra tarayıcıda `http://localhost:8781` adresini açın.
(`index.html` dosyasına çift tıklayarak da açılabilir.)

## Temalar

Üst çubuktaki palet düğmesinden üç görünüm arasında geçilir; seçim cihazda saklanır, ilerleme etkilenmez:

| Tema | Görünüm |
|---|---|
| Okul defteri (varsayılan) | Kareli kâğıt, kenar çizgisi, mürekkep mavisi; doğru cevap kırmızı kalemle daire içine alınır. |
| Kara tahta | Ahşap çerçeve, tebeşir yazısı, renkli tebeşir vurguları. |
| Düz ve cesur | Kalın siyah çizgiler, düz renk blokları, sert gölgeler. |

Yazı tipleri (`fonts/` klasörü: Caveat, Patrick Hand, Bricolage Grotesque, Nunito; SIL Open Font License) projenin içindedir; uygulama internet olmadan da aynı görünür. Tek dosyalı sürümde fontlar dosyanın içine gömülüdür.

Tüm renkler `css/style.css` başındaki tema değişkenlerinden gelir; yeni tema eklemek için bir `[data-theme="..."]` bloğu yazıp `js/app.js` içindeki `THEMES` listesine eklemek yeterlidir. Arayüz ikonları `js/icons.js` içindeki çizgi ikon setidir.

## USB / Android / tablet ile kullanım

Android ve bazı tabletler, USB'den açılan `index.html` dosyasının yanındaki `css/` ve `js/` klasörlerini okuyamaz. Bu yüzden sayfa boş ya da bozuk görünür. Bunun için **tek dosyalı sürümü** kullanın:

1. `dist/Dersbaz.html` dosyasını USB'ye veya telefona kopyalayın. Yalnızca bu dosya yeterlidir.
2. Dosyaya dokunun ve **Chrome** ile açın.

Kodda değişiklik yaptıktan sonra tek dosyayı yeniden üretmek için:

```bash
cd /Users/m4/cd/KimyaOyun && python3 tek-dosya-yap.py
```

Not: Bazı Android tarayıcıları dosyadan açılan sayfalarda kayıt yapılmasına izin vermez. Bu durumda oyun çalışır, ama ilerleme ve eklenen sorular sayfa kapanınca silinir (ekranda uyarı çıkar). Kalıcı kullanım için uygulamanın bir web adresinden açılması gerekir.

## Matematik oyunları

| Oyun | Seviye | Ne yapar |
|---|---|---|
| 🎈 Balon Patlat | İlkokul 1–4 | Doğru cevaplı balonu kaçmadan patlat. Toplama, çıkarma, 100'e kadar işlemler, çarpım tablosu, bölme, karışık (eksik sayıyı bul). Seri yaptıkça hızlanır; klavyeden cevap yazılabilir. |
| 🍕 Kesir Pizzacısı | İlkokul 3–4 | Müşterinin istediği kesir kadar dilim hazırla. İlerledikçe denk kesir siparişleri (½ isteniyor, pizza 8 dilim) ve "hangisi daha çok?" karşılaştırmaları gelir. Sabır çubuğu, kasa, 3 can. |
| ⏰ Saat Ustası | İlkokul 1–3 | Akrep ve yelkovanı sürükleyerek saati kur ya da gösterilen saati oku. Tam saat, buçuk, çeyrek, 5 dakika seviyeleri; "Dokuzu çeyrek geçiyor" gibi Türkçe ifadeler. |
| 📈 Grafik Nişancısı | Lise 9–11 | y = mx + n ve y = a(x − h)² + k katsayılarını ayarla, "Ateş!" de; top eğri boyunca uçup yıldızları toplar. 12 seviye; uzman seviyelerde önizleme yok. |
| ⚖️ Denklem Terazisi | Lise 9 | ax + b = cx + d denklemini terazi üzerinde x kutuları ve birim küplerle çöz; iki tarafa aynı işlemi uygula. 10 seviye, ipucu, sağlama. |
| 🎯 Soru Arenası | Hepsi | 19 matematik sorusu: kesir pastası, analog saat, fonksiyon grafiği, geometrik şekil ve sayma nesneli görsel şıklar. |

## Kimya bölümleri

| Bölüm | Ne yapar |
|---|---|
| 🎯 Soru Arenası | Büyük, görsel şıklı (A–E) sorular. Doğruda konfeti + puan, yanlışta çatlayan kart + kalp kaybı. Kombo, süre, can, 3 joker (yarı yarıya, ipucu, +15 sn), 3 mod (Klasik, Antrenman, Ani Ölüm), sonuçta yıldız ve “hatalarından öğren” ekranı. |
| ⚖️ Denkleştirme Lab. | Katsayıları ▲▼ ile değiştir; atom sayacı ve kütle terazisi (Lavoisier) anlık güncellenir. 15 seviye, günlük hayat bağlamlı. |
| ⚛️ Atom Kurucu | Proton/nötron/elektron ekle; element, izotop, iyon, elektron dizilimi, grup/periyot, kararlılık. 12 görev. |
| 🌀 Orbital Yerleşimi | Elektronları enerji merdivenindeki orbitallere ↑/↓ spinle yerleştir. Her hamlede Aufbau, Pauli ve Hund kuralları denetlenir; ihlal edilen kural kartı kırmızı yanar. H'den Br'ye 17 seviye + Cr ve Cu istisnaları, köşegen kuralı şeması, ipucu ve geri al. |
| 💎 Küresel Simetri (9. sınıf) | **Keşfet:** tablodan element seç, yükünü değiştirip iyon yap; orbital kutuları ve elektron "küresi" gösterilir (simetrikse kusursuz küre). **Avcı:** her turda 6 karttan s¹, s², p³, p⁶, d⁵, d¹⁰ ile bitenlerin hepsini seç. 4 seviye: dizilimli kartlar, Z 1–20, d orbitali (Z 1–36), iyonlar. |
| 🔍 Grup Bul (9. sınıf) | İpucundan (katman dizilimi, orbital dizilimi, atom numarası ya da [Ar] kısaltması) periyot ve grubu bul, boş tablodaki hücreye dokun. Her cevaptan sonra "en büyük n → periyot, s/p → A grubu, s+d → B grubu" adım adım açıklanır. 4 seviye. |
| 🧪 pH Laboratuvarı | Büretlerden HCl/NaOH damlat, 5 indikatör, pH metre, canlı titrasyon eğrisi, ev maddeleri. |
| 🎈 Gaz Simülatörü | Çarpışan tanecikler; sıcaklık, hacim (piston), tanecik sayısı, gaz türü; basınç göstergesi, hız dağılımı grafiği, PV = nRT. |
| 🛠️ Öğretmen Paneli | Soru ekle/düzenle/kopyala/sil, canlı önizleme, denklem ekleme (otomatik çözümlü), JSON yedekleme/paylaşma, PIN. |

Oyuncu profili, XP/seviye ve 13 rozet tüm bölümlere bağlıdır.

## Öğretmen paneli

- İlk PIN: **1234** — “Ayarlar & Yedek” sekmesinden değiştirin.
- Panelin üstünden ders seçilir; sorular derse göre listelenir.
- Şık türleri: metin/formül, emoji + etiket, resim (yükle veya bağlantı), atom modeli, tanecik modeli, orbital diyagramı, güvenlik (GHS) işareti; matematik için kesir modeli, analog saat, fonksiyon grafiği, geometrik şekil, sayma nesneleri.
- Matematik yazımı: `$3/4$` → kesir, `$x^2$` → üs, `$sqrt(2)$` → kök, `$<=$` → ≤.
- Grafik: `2x-3`, `x^2-4`, `-(x-1)^2+3`, `abs(x)`, `sqrt(x)` gibi yazılır.
- Orbital diyagramı: `1s=ud 2s=ud 2p=u.u.0` (u = ↑, d = ↓, 0 = boş; kurala aykırı çeldirici de yazılabilir: `2s=uu`) ya da `Z=7` (doğru temel hâl diyagramı otomatik çizilir; iyon için `Z=26 e=24`).
- Formül yazımı: `{H2O}` → H₂O, `{Na^+}` → Na⁺, `{SO4^2-}` → SO₄²⁻, `{^14_6C}` → izotop gösterimi, `**kalın**`.
- Tanecik modeli: `XX*3, XY*2` (her büyük harf bir atom, `*sayı` adet). Gerçek elementler kendi rengindedir: `HOH*6` su.
- Denklem: `Fe + O2 -> Fe2O3` yazın; sistem en küçük tam sayı katsayıları kendisi bulur.

## Önemli not: veriler nerede?

Sorular ve öğrenci ilerlemesi **o tarayıcının yerel deposunda** (localStorage) tutulur.
Başka bir bilgisayara/akıllı tahtaya taşımak için panelden **Dışa aktar** → diğer cihazda **İçe aktar**.
Tarayıcı verileri silinirse içerik de silinir; düzenli yedek alın.

## Dosya yapısı

```
index.html        giriş
css/style.css     tüm görünüm, temalar ve animasyonlar
css/fonts.css     yerel yazı tipi tanımları
fonts/            yazı tipi dosyaları (woff2, Latin + Türkçe karakterler)
js/mathcore.js    matematik çözümleyici, yazım, saat ifadeleri, kesir/saat/grafik/şekil görselleri
js/math-data.js   matematik örnek soruları ve bilgi kartları
js/m-*.js         matematik oyunları (balon, pizza, saat, grafik, denklem)
js/chem.js        element verisi, formül/denklem çözümleyici, elektron dizilimi
js/data.js        örnek sorular, denklemler, bilgi kartları
js/render.js      görsel motor (atom, tanecik, GHS, molekül SVG) + maskot
js/quiz.js        Soru Arenası
js/balance.js     Denkleştirme Laboratuvarı
js/atom.js        Atom Kurucu
js/orbital.js     Orbital Yerleşimi (Aufbau, Pauli, Hund)
js/k-simetri.js   Küresel Simetri (Keşfet + Avcı)
js/k-grup.js      Grup Bul (periyodik sistemde yer bulma)
js/ph.js          pH Laboratuvarı
js/gas.js         Gaz Simülatörü
js/admin.js       Öğretmen Paneli
js/icons.js       çizgi ikon seti ve arayüz emojilerini ikona çeviren katman
js/app.js         temalar, dersler, profil/XP/rozetler, ders seçimi, menüler, yönlendirme
```

## Güncelleme yaparken

`index.html` içindeki `?v=10` sürüm numarasını her güncellemede bir artırın; böylece tarayıcılar eski dosyaları önbellekten kullanmaz.
