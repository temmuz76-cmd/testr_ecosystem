"""Import the current testr.com.tr content and media into the local database.

    uv run python seed.py            # first run: creates tables, admin user, content
    uv run python seed.py --reset    # wipe content tables and import again

Media files are downloaded once into uploads/seed/ and registered in the media
library. The admin password is generated on first run and stored in .env.
"""

import secrets
import sys
import urllib.parse
import urllib.request
from datetime import date

from sqlmodel import Session, SQLModel, select

from app.auth import hash_password
from app.config import BASE_DIR, UPLOAD_DIR
from app.db import engine, init_db
from app.models import AdminUser, Experience, Feature, Media, Message, Page, Post, Project, Service, Setting

SOURCE = "https://www.testr.com.tr/wp-content/uploads/"

# local name -> path under the old WordPress uploads dir
MEDIA = {
    "logo.png": "2026/03/testr_logo_v1.pdf-2.png",
    "logo-footer.png": "2026/03/TESTR.png",
    "hero.mp4": "2025/09/Bir-başlik-ekleyin.mp4",
    "hero-poster.jpeg": "revslider/video-media/Bir-basCCA7lik-ekleyin_10.jpeg",
    "page-header.jpg": "2025/09/inline-header.jpg",
    "about-side.jpg": "2025/09/Adsiz-tasarim-5.jpg",
    "about-photo.jpg": "2025/09/about-photo.jpg",
    "icon.png": "2025/09/icon.png",
    "service-1.png": "2025/09/1.png",
    "service-2.png": "2025/09/2.png",
    "service-4.png": "2025/09/4.png",
    "service-5.png": "2025/09/5.png",
    "service-6.png": "2025/09/6.png",
    "service-7.png": "2025/09/7.png",
    "service-8.png": "2025/09/8.png",
    "engineering.jpg": "2025/09/swapnil-modak-2iSNhAObsZQ-unsplash-scaled-e1761040604693.jpg",
    "system-solutions.jpg": "2025/10/augustin-foto-jonas-augustin-f5mEhUKOucY-unsplash-scaled-e1761197486190.jpg",
    "rail-night.jpg": "2025/10/balazs-busznyak-El5zuQAtfeo-unsplash-scaled-e1761197132134.jpg",
    "construction.jpg": "2025/10/giuseppe-famiani-F4Iz71IznP4-unsplash-scaled-e1761196936228.jpg",
    "gallery-site.jpeg": "2025/11/WhatsApp-Image-2025-11-07-at-20.02.54-1.jpeg",
    "gallery-1.png": "2016/09/Ekran-Resmi-2025-09-20-19.19.27.png",
    "gallery-2.png": "2016/09/Ekran-Resmi-2025-09-20-19.19.45.png",
}


def m(name: str) -> str:
    return f"/uploads/seed/{name}"


def download_media(session: Session) -> None:
    target = UPLOAD_DIR / "seed"
    target.mkdir(parents=True, exist_ok=True)
    for name, remote in MEDIA.items():
        path = target / name
        if not path.exists():
            url = SOURCE + urllib.parse.quote(remote)
            print(f"  indiriliyor {name}")
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "testr-seed/1.0"})
                with urllib.request.urlopen(req, timeout=60) as resp:
                    path.write_bytes(resp.read())
            except Exception as exc:  # keep going; a missing image is not fatal
                print(f"  ! {name} indirilemedi: {exc}")
                continue
        if not session.exec(select(Media).where(Media.url == m(name))).first():
            ctype = "video/mp4" if name.endswith(".mp4") else f"image/{name.rsplit('.', 1)[-1]}"
            session.add(Media(filename=name, url=m(name), content_type=ctype, size=path.stat().st_size))
    session.commit()


def ensure_admin(session: Session) -> None:
    if session.exec(select(AdminUser)).first():
        return
    env_path = BASE_DIR / ".env"
    env = env_path.read_text() if env_path.exists() else ""
    lines = [line for line in env.splitlines() if line.strip()]
    values = dict(line.split("=", 1) for line in lines if "=" in line and not line.startswith("#"))
    email = values.get("ADMIN_EMAIL", "admin@testr.com.tr")
    password = values.get("ADMIN_PASSWORD") or secrets.token_urlsafe(12)
    for key, value in (("ADMIN_EMAIL", email), ("ADMIN_PASSWORD", password), ("JWT_SECRET", secrets.token_urlsafe(48))):
        if key not in values:
            lines.append(f"{key}={value}")
    env_path.write_text("\n".join(lines) + "\n")
    session.add(AdminUser(email=email, name="Yönetici", password_hash=hash_password(password)))
    session.commit()
    print(f"  admin kullanıcısı oluşturuldu: {email} (şifre: backend/.env)")


SITE = {
    "site_title": "Testr - Sinyalizasyon Sistemleri",
    "logo": m("logo.png"),
    "logo_footer": m("logo-footer.png"),
    "hero_video": m("hero.mp4"),
    "hero_poster": m("hero-poster.jpeg"),
    "hero_line1_tr": "Tek Partner",
    "hero_line1_en": "One Partner",
    "hero_line2_tr": "birden Fazla Uzmanlık",
    "hero_line2_en": "Multiple Areas of Expertise",
    "page_header_image": m("page-header.jpg"),
    "home_about_title_tr": "Hakkımızda",
    "home_about_title_en": "About Us",
    "footer_text_tr": "Raylı sistemlerde; güvenliği, teknolojiyi ve sürdürülebilirliği bir araya getiren mühendislik.",
    "footer_text_en": "Engineering that brings together safety, technology and sustainability in rail systems.",
    "phone": "+90 (530) 148 71 65",
    "phone_es": "+34 (653) 478 132",
    "email": "info@testr.com.tr",
    "address": "Zühtüpaşa mahallesi Şefikbey Sok. No:3/3 Kadıköy/ Istanbul",
    "linkedin": "https://www.linkedin.com/",
    "map_embed": "",
    "footer_gallery": [
        m("gallery-site.jpeg"),
        m("service-5.png"),
        m("service-6.png"),
        m("service-8.png"),
        m("gallery-1.png"),
        m("gallery-2.png"),
    ],
    "copyright_tr": "© 2025. Tüm Hakları Saklıdır.",
    "copyright_en": "© 2025. All Rights Reserved.",
    "credit_name": "Novexino",
    "credit_url": "",
    "references_heading_projects": "TESTR PROJECT EXPERIENCE",
    "references_heading_experience": "MANAGEMENT EXPERIENCE",
    "references_flow": "FIELD EXPERIENCE → INSTALLATION → TESTING & COMMISSIONING → TECHNICAL MANAGEMENT → PROJECT MANAGEMENT",
    "cookie_banner_enabled": True,
}

ABOUT_BODY = """**Tek Partner. Birden Fazla Uzmanlık.**

TESTR, demiryolu sektörüne odaklanan bir mühendislik ve proje çözümleri şirketidir.

Demiryolu projelerinin farklı aşamalarında; mühendislik, inşaat ve montajdan test & devreye alma çalışmalarına, özel imalat, teknik tedarik, bakım ve elektronik ekipman onarımına kadar sistemden bağımsız destek sağlıyoruz.

Yapımız; demiryolu mühendisliği bilgi birikimi, saha deneyimi, atölye imkânları ve uzman iş ortağı ağını bir araya getirerek, her projenin özel gereksinimlerine uygun esnek ekipler ve çözümler oluşturmamıza olanak tanır.

Belirli bir teknolojiye, üreticiye veya uzmanlık alanına bağlı kalmak yerine, tek bir hedefe odaklanıyoruz: gereksinimi doğru şekilde anlamak ve çözümü sunmak için doğru teknik kaynakları bir araya getirmek."""

ABOUT_SUMMARY = """**Tek Partner. Birden Fazla Uzmanlık.**

TESTR, demiryolu sektörüne odaklanan bir mühendislik ve proje çözümleri şirketidir.

Demiryolu projelerinin farklı aşamalarında; mühendislik, inşaat ve montajdan test & devreye alma çalışmalarına, özel imalat, teknik tedarik, bakım ve elektronik ekipman onarımına kadar sistemden bağımsız destek sağlıyoruz."""

SERVICE_INTRO = """Testr, raylı sistemler için güvenilir, yenilikçi ve sürdürülebilir çözümler geliştirmek amacıyla kurulmuş bir mühendislik firmasıdır. Planlama ve tasarımdan başlayarak proje yönetimi, malzeme üretimi, sistem entegrasyonu, montaj, test ve devreye alma süreçlerine kadar uçtan uca hizmet sunar.

Raylı ulaşımda güvenliği, verimliliği ve teknolojiyi bir araya getiren Testr, sinyalizasyon, elektrifikasyon ve haberleşme sistemlerinde uzmanlaşmış güçlü kadrosuyla sektöre yön vermektedir. Uluslararası standartlarla uyumlu çözümler üretirken yerli mühendislik gücünü de ön plana çıkararak katma değer yaratır.

Yurt içi ve yurt dışındaki projelerde edindiği deneyimi her yeni çalışmaya aktararak, müşteri memnuniyetini en üst seviyede tutmayı hedefler. Ar-Ge odaklı yaklaşımı sayesinde yalnızca bugünün değil, geleceğin raylı sistem ihtiyaçlarını da karşılayan çözümler geliştirir.

Testr, güvenliği öncelik, teknolojiyi araç, sürdürülebilirliği ise vizyon olarak benimseyerek; raylı ulaşımda fark yaratan bir marka olmayı sürdürmektedir."""

SERVICES = [
    {
        "slug": "proje-yonetimi-ve-saha-koordinasyonu",
        "title_tr": "Proje Yönetimi ve Saha Koordinasyonu",
        "image": m("service-2.png"),
        "show_on_home": True,
        "summary_tr": "TESTR, büyük ölçekli raylı sistem projelerinde etkin proje yönetimi ve saha koordinasyonu sağlamaktadır. Zaman, bütçe ve kalite odaklı yaklaşımımız sayesinde projelerin sorunsuz, planlı ve verimli bir şekilde ilerlemesi garanti edilir.",
        "body_tr": """TESTR, büyük ölçekli raylı sistem projelerinde etkin proje yönetimi ve saha koordinasyonu sağlamaktadır. Zaman, bütçe ve kalite odaklı yaklaşımımız sayesinde projelerin sorunsuz, planlı ve verimli bir şekilde ilerlemesi garanti edilir.

Kurucularımız, 20 yıla yakın demiryolu tecrübesi ile farklı ülkelerde ve farklı teknoloji altyapılarına sahip projelerde üstlendikleri yöneticilik görevleri sayesinde, uluslararası düzeyde güçlü proje yönetim becerilerine sahiptir.

Proje yönetimi hizmetlerimiz kapsamında:

- Planlama ve zaman yönetimi,
- Bütçe takibi ve maliyet kontrolü,
- Saha yönetimi ve ekip koordinasyonu,
- Kalite kontrol ve süreç denetimleri,
- Risk yönetimi ve çözüm geliştirme

başlıklarında bütüncül bir hizmet sunuyoruz.

TESTR için proje yönetimi, yalnızca takvim ve bütçe hedeflerini tutturmak değil, aynı zamanda müşteri memnuniyetini, güvenliği ve sürdürülebilir kaliteyi garanti altına almaktır.""",
    },
    {
        "slug": "anahtar-teslim-uygulama-projeleri",
        "title_tr": "Anahtar Teslim Uygulama Projeleri",
        "image": m("service-1.png"),
        "show_on_home": True,
        "summary_tr": "Testr, raylı sistem projelerinde planlama aşamasından devreye almaya kadar tüm süreci üstlenir. Anahtar teslim yaklaşımımız sayesinde müşterilerimiz tek bir noktadan güvenilir, hızlı ve standartlara uygun çözümlere ulaşır.",
        "body_tr": "Testr, raylı sistem projelerinde planlama aşamasından devreye almaya kadar tüm süreci üstlenir. Anahtar teslim yaklaşımımız sayesinde müşterilerimiz tek bir noktadan güvenilir, hızlı ve standartlara uygun çözümlere ulaşır.",
    },
    {
        "slug": "muhendislik-ve-danismanlik-hizmetleri",
        "title_tr": "Mühendislik ve Danışmanlık Hizmetleri",
        "image": m("engineering.jpg"),
        "show_on_home": True,
        "summary_tr": "TESTR, proje yürütme ve test süreçlerinde uluslararası sistem mühendisliği standartlarında tanımlanan 5V Tekniği (V-Model) prensibini uygular. Bu yaklaşım, her mühendislik adımının bir doğrulama (verification) ve geçerleme (validation) adımıyla eşleştirilmesini esas alır.",
        "body_tr": """TESTR, proje yürütme ve test süreçlerinde uluslararası sistem mühendisliği standartlarında tanımlanan 5V Tekniği (V-Model) prensibini uygular. Bu yaklaşım, her mühendislik adımının bir doğrulama (verification) ve geçerleme (validation) adımıyla eşleştirilmesini esas alır.

V-Model’in sol tarafı sistemin tasarım sürecini, sağ tarafı ise test ve devreye alma aşamalarını temsil eder. TESTR’in farkı, bu teorik yapıyı saha gerçekleriyle birleştirmesidir. Şirket, her V seviyesinde planlanan doğrulama adımlarını yalnızca belgelerde değil, sahadaki uygulama, test ve devreye alma süreçlerinde izlenebilir biçimde yürütür.""",
    },
    {
        "slug": "kurulum-montaj-ve-devreye-alma",
        "title_tr": "Kurulum, Montaj ve Devreye Alma",
        "image": m("service-6.png"),
        "show_on_home": True,
        "summary_tr": "TESTR, demiryolu projelerinin sahadaki en kritik aşamalarından olan kurulum, montaj ve devreye alma süreçlerini uzman ekibiyle titizlikle yürütmektedir. Tüm uygulamalar, uluslararası standartlar çerçevesinde gerçekleştiriliyor; devreye alma öncesinde gerekli testler yapılarak kesintisiz bir işletme garanti edilmektedir.",
        "body_tr": """TESTR, demiryolu projelerinin sahadaki en kritik aşamaları olan **kurulum, montaj ve devreye alma** süreçlerini uzman ekibiyle titizlikle yürütür. Tüm uygulamalar **uluslararası standartlara** uygun olarak gerçekleştirilir; devreye alma öncesinde gerekli **test ve kontroller** yapılarak **güvenli, sorunsuz ve kesintisiz** işletme garanti edilir.

#### Trackside sistemler

- Sinyal sistemleri, makas motorları, ray devreleri, axle counter kurulumları
- Sinyal odaları (SER) ve telekomünikasyon odaları (COM) montajları
- Donanım montajları, enerji dağıtımı ve planlı bakım hizmetleri

#### On-board tren sistemleri

- Elektronik donanım montajı, kablolama
- Bakım ve periyodik test prosedürleri

#### Elektrik işleri

- Enerji altyapısı, kablo kanalları, dağıtım panoları
- UPS ve jeneratör entegrasyonları

#### Telekomünikasyon

- CCTV ve IP tabanlı güvenlik çözümleri
- MPLS, SDH, VoIP ve fiber optik ağ kurulumu
- SCADA ve uzaktan izleme entegrasyonları
- Yolcu bilgilendirme ve güvenlik sistemleri (anons sistemleri, dijital bilgilendirme panoları)
- Acil durum haberleşme ve kontrol altyapıları

#### Taahhüdümüz

TESTR, tüm saha kurulumlarında yalnızca güvenliği değil, aynı zamanda **zamanında teslimi**, **uluslararası standartlara uyumu** ve **yüksek operasyonel verimliliği** ön planda tutar.""",
    },
    {
        "slug": "bakim-onarim-ve-teknik-servis",
        "title_tr": "Bakım, Onarım ve Teknik Servis",
        "image": m("service-7.png"),
        "show_on_home": True,
        "summary_tr": "TESTR, kurulum sonrasında da projelerine sahip çıkarak süreklilik, güvenilirlik ve teknik mükemmeliyet sağlar. Yönetim ekibimiz, 20 yıla yakın demiryolu tecrübesi ile farklı ülkelerde çok sayıda sinyalizasyon projesinde görev almış; ERTMS Level 1 – Level 2, CBTC ve CTC sistemlerinin çalışma prensiplerine, arayüzlerine ve bakım prosedürlerine derinlemesine hâkimdir.",
        "body_tr": """TESTR, kurulum sonrasında da projelerine sahip çıkar; süreklilik, güvenilirlik ve teknik mükemmeliyet sağlar. Yönetim ekibimiz, 20 yıla yakın demiryolu tecrübesiyle farklı ülkelerde çok sayıda sinyalizasyon projesinde görev almış; ERTMS Level 1–2, CBTC ve CTC sistemlerinin çalışma prensiplerine, arayüzlerine ve bakım prosedürlerine derinlemesine hâkimdir.

#### Neleri garanti ediyoruz?

- Sistemlerin kesintisiz çalışması
- Arızalara hızlı müdahale ve kök neden analizi
- Güvenli işletme sürekliliği ve düzenli raporlama

#### Hizmet kapsamımız:

- Geçici bakım (DLP – Defect Liability Period) yönetimi
- Kalıcı bakım ve periyodik servis planları
- Önleyici bakım, kestirimci kontroller ve yedek parça stratejisi
- Uzaktan izleme, alarm yönetimi ve yerinde müdahale
- Bakım dokümantasyonu, eğitim ve yetkinlik aktarımı

TESTR, her bakım faaliyetinde önleyici yaklaşımı benimser; böylece sistemlerin ömrünü uzatır, arıza oranlarını minimize eder ve operasyonel verimliliği en üst seviyede tutar.""",
    },
    {
        "slug": "malzeme-tedarigi",
        "title_tr": "Malzeme Tedariği",
        "image": m("service-8.png"),
        "show_on_home": True,
        "summary_tr": "TESTR, projelerde kullanılan tüm ekipman ve malzemelerin uluslararası standartlara uygun şekilde tedarikini sağlamaktadır. Güvenilir tedarik zincirimiz sayesinde projeler, kesintisiz ve yüksek kalite standartlarıyla yürütülmektedir.",
        "body_tr": """TESTR, projelerde kullanılan tüm ekipman ve malzemelerin uluslararası standartlara uygun şekilde tedarikini sağlamaktadır. Güvenilir tedarik zincirimiz sayesinde projeler, kesintisiz ve yüksek kalite standartlarıyla yürütülmektedir.

Sunduğumuz malzeme tedarik hizmetleri kapsamında:

- Demiryolu projelerinde kullanılan spesifik el aletleri,
- Konnektörler ve bağlantı elemanları,
- Kablolar (sinyalizasyon, güç ve haberleşme kabloları),
- Sarf malzemeleri (ekipman kurulum ve bakım süreçlerinde),
- Demiryolu standartlarına uygun metal destek ve montaj elemanları

tedarik edilmektedir.

TESTR, her malzeme tedarik sürecinde izlenebilirlik, kalite güvencesi ve uluslararası normlara uygunluğu garanti eder.""",
    },
    {
        "slug": "sistem-cozumleri-ve-ozel-entegrasyon-projeleri",
        "title_tr": "Sistem Çözümleri ve Özel Entegrasyon Projeleri",
        "image": m("system-solutions.jpg"),
        "show_on_home": False,
        "summary_tr": "TESTR, geliştirilen sistem çözümlerini sahada en etkin ve güvenilir şekilde hayata geçiren çözüm ortağıdır.",
        "body_tr": "TESTR, geliştirilen sistem çözümlerini sahada en etkin ve güvenilir şekilde hayata geçiren çözüm ortağıdır. Farklı bileşenlerin entegrasyonunu tek bir merkezden yöneterek, projelerin verimli, güvenli ve sürdürülebilir biçimde işletilmesini sağlar.",
    },
    {
        "slug": "insaat-ust-yapi-isleri",
        "title_tr": "İnşaat Üst Yapı İşleri",
        "image": m("construction.jpg"),
        "show_on_home": False,
        "summary_tr": "TESTR, yalnızca sinyalizasyon ve elektromekanik alanlarda değil, aynı zamanda inşaat sektöründe de faaliyet göstermektedir.",
        "body_tr": """TESTR, yalnızca sinyalizasyon ve elektromekanik alanlarda değil, aynı zamanda inşaat sektöründe de faaliyet göstermektedir.

Raylı sistem projelerinin tamamlayıcı unsuru olan altyapı ve üstyapı inşaat işlerini, kalite ve güvenlik standartlarına bağlı kalarak hayata geçirmektedir.""",
    },
]

POSTS = [
    {
        "slug": "ixl",
        "title_tr": "IXL",
        "excerpt_tr": "Interlocking Sistemleri: Mantıksal Güvenliğin Kalbi",
        "image": m("service-7.png"),
        "tags": "ato, cbtc",
        "published_at": date(2025, 11, 4),
        "views": 52,
        "body_tr": """## Interlocking Sistemleri: Mantıksal Güvenliğin Kalbi

Demiryolu sinyalizasyonunda “interlocking”, tüm sistemin güvenli mantığını yöneten merkezdir. Amacı basit ama kritiktir: bir tren hareketi başka bir trenin güvenliğini tehlikeye atamaz.

Interlocking, makaslar, sinyaller ve hat bölümleri arasındaki ilişkileri mantıksal kurallarla yönetir. Bu kurallar, olası çakışma ve çarpışmaları önlemek için yüzlerce kombinasyonun matematiksel olarak tanımlanması anlamına gelir. Geleneksel sistemlerde röle tabanlı donanımlar kullanılırken, günümüzde elektronik interlocking (EIXL) sistemleri devreye girmiştir. Bu dijital yapı, yüksek hız, uzaktan izleme ve bakım kolaylığı sağlar.

Ancak interlocking yalnızca teknik bir modül değil, güvenliğin kalbidir. Hatalı bir konfigürasyon, tüm hattı etkileyebilir. Bu nedenle tasarım, validasyon ve test aşamaları CENELEC standartlarıyla tanımlanan sıkı bir disiplin içinde yürütülür.

Doğru kurgulanmış bir interlocking sistemi, tren hareketinin yalnızca planlandığı biçimde gerçekleşmesini garanti eder. Yani, demiryolu güvenliğinin görünmeyen beyni aslında interlocking mantığıdır.

**TESTR Yaklaşımı:** TESTR interlocking sistemlerinin montajı, kablolaması ve fonksiyonel testlerinde uzmanlaşmıştır. Üretici firmalarla koordineli çalışarak, saha kurulumlarının tasarım mantığıyla birebir uyumlu olmasını garanti eder. Her proje, interlocking mantığının sahada bozulmadan uygulanması prensibiyle yönetilir.""",
    },
    {
        "slug": "tc",
        "title_tr": "T&C",
        "excerpt_tr": "Test & Commissioning: Doğrulamanın Sahadaki Gerçek Yüzü",
        "image": m("service-8.png"),
        "tags": "ato, cbtc, demiryolu, rams, siberguvenlik, SIL",
        "published_at": date(2025, 11, 2),
        "views": 42,
        "body_tr": """## Test & Commissioning: Doğrulamanın Sahadaki Gerçek Yüzü

Bir sinyalizasyon sisteminin laboratuvarda mükemmel görünmesi yeterli değildir; asıl doğrulama sahada yapılır. Test & Commissioning (T&C) süreci, tasarımın gerçeğe dönüşme anıdır.

Bu aşamada ekipmanların montajı, kablolama, interlocking testleri, haberleşme senaryoları, enerji sistemleri ve operasyonel fonksiyonlar tek tek kontrol edilir. Her sinyal, her makas, her modül, hem teknik olarak hem de güvenlik açısından test edilir. Amaç yalnızca sistemin “çalışması” değil, doğru ve güvenli şekilde çalıştığının kanıtlanmasıdır.

T&C süreci; Factory Acceptance Test (FAT), Site Acceptance Test (SAT), Integration Test, Pre-Operation ve Final Commissioning gibi adımlardan oluşur. Her biri, sahada oluşabilecek en küçük hatayı bile erken yakalamak için tasarlanmıştır.

Başarılı bir T&C, mühendisliğin doğrulanmasıdır. Çünkü bir proje, tasarlandığı gibi değil, test edildiği kadar güvenilirdir.

**TESTR Yaklaşımı:** TESTR, Test & Commissioning aşamalarında uluslararası tedarikçiler ve yerel müşteriler arasındaki uygulama köprüsüdür. Fonksiyonel testler, entegrasyon kontrolleri ve devreye alma senaryoları, üretici standartlarına uygun şekilde sahada yürütülür. Rhossus ekibi, teknik problemleri hızlı analiz edip sahada çözüme ulaştırma kabiliyetiyle fark yaratır.""",
    },
    {
        "slug": "cbtc-ve-ato",
        "title_tr": "CBTC ve ATO: Aynı Altyapıyla Daha Fazla Yolcu Nasıl Taşınır?",
        "excerpt_tr": "CBTC (Communication-Based Train Control), tren–saha–merkez arasında gerçek zamanlı veri alışverişiyle hareket yetkisini dinamik...",
        "image": m("service-4.png"),
        "tags": "ato, cbtc",
        "published_at": date(2024, 8, 5),
        "views": 162,
        "body_tr": """## CBTC – ATO: Aynı Altyapıyla Daha Fazla Yolcu Nasıl Taşınır?

Modern şehir içi ulaşım sistemlerinde artan yolcu talebine karşı en verimli çözüm, mevcut altyapıyı daha akıllı hale getirmektir. CBTC (Communication Based Train Control) ve ATO (Automatic Train Operation) sistemleri tam olarak bu noktada devreye girer.

CBTC, trenler arası mesafeyi sabit bloklar yerine gerçek zamanlı konum bilgisiyle yönetir. Bu sayede hat kapasitesi önemli ölçüde artar; trenler birbirine çok daha yakın ve güvenli biçimde hareket edebilir. ATO ise bu sistemin üzerinde çalışan otomasyon katmanıdır. Sürüş, hızlanma, frenleme ve duruş işlemlerini optimize ederek hem enerji tasarrufu sağlar hem de insan hatasını en aza indirir.

Sonuç olarak, aynı ray hattı üzerinde daha sık sefer, daha kısa bekleme süresi ve daha yüksek yolcu taşıma kapasitesi mümkün hale gelir. Üstelik tüm bunlar yeni altyapı yatırımı gerektirmeden, yalnızca mevcut sinyalizasyonun dijitalleştirilmesiyle sağlanır.

Geleceğin metro sistemleri, CBTC ve ATO entegrasyonunun sunduğu bu esnek, güvenli ve verimli işleyiş üzerine inşa ediliyor. Akıllı sinyalizasyonun gücüyle, şehirler daha fazla yolcuyu aynı hat üzerinden taşımayı başarıyor.""",
    },
    {
        "slug": "etcs-seviye",
        "title_tr": "ETCS Seviye 1–2–3: Hangi Hat İçin Hangisi Doğru?",
        "excerpt_tr": "ETCS seviye seçimi “en yeni olanı kur” meselesi değildir; hat profili, hedef kapasite, RF altyapısı ve yaşam döngüsü maliyetlerinin...",
        "image": m("service-2.png"),
        "tags": "",
        "published_at": date(2024, 7, 26),
        "views": 180,
        "body_tr": """## ETCS Seviye 1–2–3: Hangi Hat İçin Hangisi Doğru?

Avrupa Tren Kontrol Sistemi (ETCS), demiryolu trafiğini güvenli, standart ve sınır ötesi çalışabilir hale getirmek için geliştirilen bir sinyalizasyon sistemidir. Ancak ETCS tek bir sistem değildir; hat yapısına, trafik yoğunluğuna ve modernizasyon seviyesine göre farklı uygulama düzeyleri —Seviye 1, 2 ve 3— bulunur.

ETCS Seviye 1, mevcut hatlara kolayca entegre edilebilen versiyondur. Balizler aracılığıyla tren konumu belirlenir, sinyaller sahada kalır. Bu seviye genellikle konvansiyonel hatlar için uygundur; düşük maliyetli bir modernizasyon sağlar.

ETCS Seviye 2 ise sürekli haberleşme (GSM-R) altyapısıyla çalışır. Yol kenarındaki sinyaller ortadan kalkar, sürücüye tüm talimatlar kabin içi ekran üzerinden iletilir. Bu seviye, yüksek hızlı hatlarda standart haline gelmiştir; kapasiteyi artırır ve güvenliği üst seviyeye taşır.

ETCS Seviye 3 ise geleceğin vizyonudur: Hat blokları tamamen sanal hale gelir, trenler konumlarını sürekli iletir, hat doluluğu dijital olarak hesaplanır. Bu yaklaşım, fiziksel sinyal veya tespit ekipmanına gerek bırakmadan maksimum kapasite ve esneklik sunar.

Hangi seviyenin doğru olduğuna karar vermek; hat uzunluğu, mevcut altyapı, işletme sıklığı ve bakım stratejileri gibi etkenlerin bütünsel değerlendirilmesini gerektirir.

**TESTR Yaklaşımı:** TESTR, farklı ETCS seviyelerinin sahadaki uyumluluğunu ve entegrasyonunu yönetir. Donanım montajından saha testlerine kadar tüm süreçlerde, sistem üreticileri ve altyapı işletmecileri arasında teknik köprü rolü üstlenir. Her hat için en uygun çözümün sorunsuz şekilde devreye alınmasını, yerel sinyalizasyon unsurlarıyla çakışma olmadan sağlar.""",
    },
    {
        "slug": "rams-sil",
        "title_tr": "RAMS ve SIL: Güvenlik Bir Belge Değil, Süreçtir",
        "excerpt_tr": "RAMS; güvenilirlik, bulunabilirlik, bakım yapılabilirlik ve emniyeti proje başlangıcından ömür sonuna kadar yöneten çatı...",
        "image": m("service-7.png"),
        "tags": "rams, SIL",
        "published_at": date(2024, 7, 11),
        "views": 160,
        "body_tr": """## RAMS ve SIL: Güvenlik Bir Belge Değil, Süreçtir

Demiryolu sistemlerinde güvenlik, yalnızca tasarımın sonunda alınan bir onay belgesi değildir; sistemin her aşamasına entegre edilmiş dinamik bir süreçtir. RAMS (Reliability, Availability, Maintainability, Safety) yaklaşımı ve SIL (Safety Integrity Level) kavramı, bu anlayışın temelini oluşturur.

RAMS, bir sistemin ne kadar güvenilir çalıştığını, arıza durumlarında nasıl davrandığını ve bakım sürecinde ne kadar erişilebilir olduğunu ölçer. Bu yaklaşım, yalnızca teknik performansı değil, işletme sürekliliğini de garanti altına alır.

SIL ise işin nicel tarafını temsil eder: Bir fonksiyonun güvenlik bütünlüğü seviyesini sayısal olarak tanımlar. Ancak bir SIL seviyesi, yalnızca hesaplanan olasılıklardan ibaret değildir; tasarım, test, validasyon ve yaşam döngüsü boyunca tutarlı bir güvenlik kültürünü gerektirir.

Sonuçta, RAMS ve SIL birer belge ya da kontrol listesi değil, mühendislik disiplininin süreklilik gerektiren iki yönüdür. Güvenli bir sistem, test raporlarıyla değil, tasarım aşamasından devreye almaya kadar izlenen bilinçli bir süreçle oluşur.

**TESTR Yaklaşımı:** TESTR, RAMS ve SIL gerekliliklerinin yalnızca teorik dokümanlarda kalmaması için çalışır. Saha uygulamalarında, güvenlik bütünlüğünü tehdit edebilecek her durumu erken fark etmek ve raporlamak önceliğidir. Böylece sistem entegratörleri ve üretici firmalar, sahadan gelen doğrulanmış verilerle güvenlik süreçlerini destekler.""",
    },
    {
        "slug": "demiryolu-siber-guvenlik",
        "title_tr": "Demiryolu Siber Güvenliği: Emniyeti Bozmadan Güvence",
        "excerpt_tr": "Modern sinyalizasyon ve SCADA ağları IT ile iç içe; bu da saldırı yüzeyini büyütür. Tehdit modeli radyo mesaj bütünlüğü, uzaktan...",
        "image": m("service-8.png"),
        "tags": "demiryolu, siberguvenlik",
        "published_at": date(2024, 7, 7),
        "views": 177,
        "body_tr": """## Demiryolu Siber Güvenliği: Emniyeti Bozmadan Güvence

Demiryolu sistemleri artık yalnızca mekanik veya elektriksel bileşenlerden oluşmuyor; karmaşık yazılımlar, ağ bağlantıları ve veri paylaşımı, sinyalizasyondan bakım planlamasına kadar her noktada devrede. Bu dijitalleşme, verimliliği artırırken beraberinde yeni bir sorumluluk getiriyor: siber güvenlik.

Ancak demiryolu siber güvenliği, klasik IT güvenliğinden farklıdır. Burada amaç, sistemi kilitlemek değil, emniyet fonksiyonlarının sürekliliğini koruyarak güvenliği sağlamaktır. Bir trenin yanlış durması, yanlış çalışmasından çok daha tehlikeli olabilir. Bu nedenle güvenlik önlemleri, operasyonel emniyeti bozmayacak şekilde tasarlanmalıdır.

Modern standartlar —örneğin IEC 62443 ve CENELEC EN 50701— demiryolu altyapısında tehdit analizi, risk değerlendirmesi, erişim kontrolü ve yazılım güncelleme politikalarını tanımlar. Ancak en etkili koruma, teknolojiden önce insan faktörüyle başlar: farkındalık, prosedür ve disiplin.

Kısacası, demiryolu siber güvenliği yalnızca ağları korumak değil, emniyetle güvenlik arasında denge kurma sanatıdır. Çünkü ray üzerindeki en küçük veri bile, bir sistemin kaderini belirleyebilir.

**TESTR Yaklaşımı:** TESTR, siber güvenliği sahada uygulanan prosedürlerle destekler. Ekipman konfigürasyonları, ağ bağlantıları ve erişim izinleri, üretici yönergeleri doğrultusunda ama yerel saha şartlarına uyarlanarak yürütülür. Firma, siber güvenlik gerekliliklerinin emniyet operasyonlarını aksatmadan uygulanmasını sağlar.""",
    },
]

PROJECTS = [
    ("TCDD TAŞIMACILIK A.Ş.", "On-Board Signalling Equipment Repair", "Railway Electronics Repair & Testing — Completed"),
    ("TCDD", "Trackside Electronic Module Repair", "Railway Electronics Repair & Testing — Completed"),
    ("TKT GLOBAL CONSULTING S.L. — SPAIN", "Chiller Support Structures", "Custom Manufacturing Mechanical Supply — Completed"),
    ("BHS GLOBAL TRADE PARTNERS S.L. — SPAIN", "Transformer Supports & Rubber Components", "Custom Manufacturing Mechanical Rubber Components — Completed"),
]

EXPERIENCES = [
    ("🇹🇷", "Türkiye", "Turkey", "Major Railway & High-Speed Rail Projects",
     "Experience gained on major railway projects including Ankara-Konya, Kadikoy-Kartal Metro, Marmaray, Istanbul Metro, Samsun-Kalin, and Yerköy–Sivas High-Speed Railway, covering installation, testing & commissioning, site coordination and management responsibilities.",
     "Railway Systems · Installation · Testing & Commissioning · Management"),
    ("🇭🇷", "Hırvatistan", "Croatia", "Križevci–Koprivnica Railway Project",
     "International railway project experience covering field activities, installation coordination, testing & commissioning and project/site management.",
     "Railway Infrastructure · Installation · T&C · Project Management"),
    ("🇪🇸", "İspanya", "Spain", "Railway Systems & Technical Management",
     "Technical and management experience within an international railway environment, including engineering coordination, field activities, installation and testing & commissioning management.",
     "Technical Management · Engineering · Installation · T&C"),
    ("🇱🇾", "Libya", "Libya", "Construction & Infrastructure Projects",
     "International construction and site experience covering civil works, construction activities, site execution and multidisciplinary field coordination.",
     "Construction · Civil Works · Site Execution · Field Management"),
]

FEATURES = [
    ("Güvenlik Önceliğimiz", "Projelerimizi uluslararası standartlara uygun şekilde tasarlıyor, raylı sistemlerde en yüksek güvenlik seviyesini garanti altına alıyoruz."),
    ("Uzman Kadro", "Deneyimli mühendislerimiz ve teknik ekibimiz, her projede en doğru çözümleri üretir ve tüm süreçleri profesyonelce yönetir."),
    ("Uluslararası Deneyim", "Yurt içi ve yurt dışındaki projelerimizle edindiğimiz bilgi birikimini, her yeni projede daha verimli ve kaliteli hizmete dönüştürüyoruz."),
    ("Yenilikçi Teknolojiler", "Geliştirdiğimiz yerli ve rekabetçi ürünler ile hem maliyet avantajı sağlıyor hem de modern, sürdürülebilir çözümler sunuyoruz."),
]


def seed_content(session: Session) -> None:
    session.merge(Setting(key="site", value=SITE))
    session.merge(Page(
        key="about", title_tr="Hakkımızda", title_en="About Us",
        subtitle_tr="Tek Partner. Birden Fazla Uzmanlık.", subtitle_en="One Partner. Multiple Areas of Expertise.",
        body_tr=ABOUT_BODY, image=m("about-photo.jpg"),
    ))
    session.merge(Page(key="home_about", title_tr="Hakkımızda", title_en="About Us", body_tr=ABOUT_SUMMARY, image=m("about-photo.jpg")))
    session.merge(Page(key="service_intro", title_tr="Fark Yaratıyoruz", title_en="Making a Difference", body_tr=SERVICE_INTRO))
    session.merge(Page(key="services", title_tr="Hizmetlerimiz", title_en="Our Services"))
    session.merge(Page(key="references", title_tr="Projeler & Referanslar", title_en="Projects & References"))
    session.merge(Page(key="blog", title_tr="Blog", title_en="Blog"))
    session.merge(Page(key="contact", title_tr="İletişim", title_en="Contact", subtitle_tr="İLETİŞİM BİLGİLERİMİZ", subtitle_en="CONTACT INFORMATION"))
    for i, data in enumerate(SERVICES):
        session.add(Service(sort_order=i, **data))
    for data in POSTS:
        session.add(Post(**data))
    for i, (client, title, category) in enumerate(PROJECTS):
        session.add(Project(client=client, title_tr=title, title_en=title, category_tr=category, category_en=category, sort_order=i))
    for i, (flag, ctr, cen, title, desc, tags) in enumerate(EXPERIENCES):
        session.add(Experience(flag=flag, country_tr=ctr, country_en=cen, title_tr=title, title_en=title,
                               description_tr=desc, description_en=desc, tags_tr=tags, tags_en=tags, sort_order=i))
    for i, (title, text) in enumerate(FEATURES):
        session.add(Feature(title_tr=title, text_tr=text, icon=m("icon.png"), sort_order=i))
    session.commit()


def main() -> None:
    reset = "--reset" in sys.argv
    init_db()
    with Session(engine) as session:
        if reset:
            for model in (Service, Post, Project, Experience, Feature, Page, Setting):
                for row in session.exec(select(model)).all():
                    session.delete(row)
            session.commit()
        ensure_admin(session)
        print("Medya indiriliyor…")
        download_media(session)
        if session.exec(select(Service)).first():
            print("İçerik zaten var; yeniden yüklemek için --reset kullanın.")
            return
        print("İçerik aktarılıyor…")
        seed_content(session)
        print("Tamamlandı.")


if __name__ == "__main__":
    main()
