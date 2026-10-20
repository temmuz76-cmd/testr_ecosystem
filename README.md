# TESTR Web Sitesi

testr.com.tr'nin admin panelli, dinamik sürümü.

```
frontend/  Next.js 16 (App Router, Tailwind 4) – site + /admin paneli
backend/   FastAPI + SQLModel + SQLite – REST API, görsel yükleme
```

Tarayıcı yalnızca Next.js ile konuşur: `/api/*` ve `/uploads/*` istekleri Next.js tarafından backend'e (varsayılan `http://127.0.0.1:8000`, `BACKEND_URL` ile değiştirilebilir) yönlendirilir.

## Kurulum

Gereken araçlar: Node.js 20+ ve [uv](https://docs.astral.sh/uv/) (Python 3.12'yi kendisi kurar).

```bash
cd backend
uv sync
uv run python seed.py          # tabloları, admin kullanıcısını ve mevcut site içeriğini oluşturur
uv run uvicorn app.main:app --port 8000 --reload
```

```bash
cd frontend
npm install
npm run dev                    # http://localhost:3000
```

`seed.py` ilk çalıştırmada:
- testr.com.tr'deki görselleri ve videoyu `backend/uploads/seed/` içine indirir,
- tüm hizmetleri, blog yazılarını, referansları ve sayfa metinlerini veritabanına (`backend/data/testr.db`) aktarır,
- **admin kullanıcısını oluşturur; e-posta ve rastgele şifre `backend/.env` dosyasına yazılır.** İlk girişten sonra şifreyi Admin → Site Ayarları'ndan değiştirin.

İçeriği sıfırdan yeniden yüklemek için `uv run python seed.py --reset` (admin kullanıcısı ve mesajlar korunur).

## Admin paneli — http://localhost:3000/admin

| Bölüm | Neyi yönetir |
|---|---|
| Gösterge Paneli | Özet sayılar, son mesajlar, en çok okunan yazılar |
| Hizmetler | Hizmet kartları ve detay sayfaları (sıralama, anasayfada göster, taslak) |
| Blog Yazıları | Yazılar, kapak görseli, etiketler, yayın tarihi |
| Projeler & Referanslar | Proje deneyimi satırları ve ülke bazlı yönetim deneyimi |
| Avantajlar | Hizmet detaylarının altındaki "Fark Yaratıyoruz" kartları |
| Sayfalar | Hakkımızda, anasayfa tanıtım kutusu, sayfa başlıkları ve arka planları |
| Mesajlar | İletişim formundan gelenler (okundu/okunmadı, sil, e-postayla yanıtla) |
| Medya | Görsel/video/PDF yükleme kütüphanesi (sürükle-bırak) |
| Site Ayarları | Logo, hero videosu ve başlıkları, iletişim bilgileri, footer, harita, çerez bildirimi, şifre değişikliği |

Metin alanları Markdown ile yazılır (araç çubuğu ve önizleme var). Çevrilebilir alanlarda TR/EN sekmesi bulunur; İngilizce boş bırakılırsa Türkçe gösterilir. Ziyaretçi dili sağ alttaki seçiciyle değiştirir.

## Eski URL'ler

`next.config.ts` eski WordPress adreslerini 301 ile yeni adreslere yönlendirir:
`/2025/11/04/ixl/` → `/blog/ixl`, `/proje-yonetimi-ve-saha-koordinasyonu/` → `/hizmetlerimiz/...`, `/services/*` → `/hizmetlerimiz`.

## Yayına alma notları

- Backend'i kalıcı diski olan bir sunucuda çalıştırın (VPS, Fly.io, Railway, Docker): SQLite dosyası ve `uploads/` klasörü kalıcı olmalı ve düzenli yedeklenmeli.
- `backend/.env` içinde `JWT_SECRET` seed tarafından rastgele üretilir; HTTPS altında `COOKIE_SECURE=true` ekleyin.
- Frontend: `npm run build && npm start`, `BACKEND_URL` ortam değişkeniyle.
- Trafik büyürse `DATABASE_URL` ile PostgreSQL'e geçilebilir (SQLModel kodu değişmez).
