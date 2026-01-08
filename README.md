# 🌟 AIShifts

AI destekli sosyal medya platformu - Instagram benzeri arayüz ile akıllı içerik keşfi ve AI chatbot entegrasyonu.

![AIShifts](assets/logo.png)

## ✨ Özellikler

### 📱 Kullanıcı Arayüzü
- **Stories Bölümü**: Kategori bazlı filtreleme için hikaye halkaları
- **Ana Feed**: Carousel destekli post kartları
- **Modern Tasarım**: Koyu tema, glassmorphism efektleri ve dinamik animasyonlar

### 🤖 AI Chatbot Entegrasyonu
- **Gemini + Fal.ai**: Her post için AI destekli görsel üretimi
- **Görsel Yükleme**: Resim, video ve dosya yükleme desteği
- **Özelleştirilebilir Botlar**: Her item için farklı prompt ve model ayarları

### 🔍 Arama ve Filtreleme
- **Canlı Arama**: Başlık ve açıklama üzerinde anlık filtreleme
- **Kategori Filtreleme**: Hikaye halkalarına tıklayarak filtreleme

### 💬 Yorum Sistemi
- **Firebase Entegrasyonu**: Yorumlar Firestore'a kaydedilir
- **Gerçek Zamanlı**: Yorum ekleme ve görüntüleme

### 📤 Paylaşım
- Link kopyalama
- WhatsApp paylaşımı
- LinkedIn paylaşımı

## 🛠️ Teknolojiler

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **Veritabanı**: Firebase Firestore
- **AI API'ler**: Google Gemini, Fal.ai
- **Hosting**: Cloudflare Tunnel

## 🚀 Kurulum

### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/azizamerikali/aishift.git
cd aishift
```

### 2. Backend Bağımlılıklarını Kurun

```bash
cd backend
npm install
```

### 3. Environment Variables

`.env` dosyası oluşturun:

```env
GEMINI_API_KEY=your_gemini_api_key
FAL_API_KEY=your_fal_api_key
```

### 4. Firebase Yapılandırması

`firebase-config.js` dosyasında Firebase credentials'larınızı güncelleyin.

## 💻 Çalıştırma

### Frontend'i Başlat (Port 3001)

```bash
npx serve . -l 3001
```

### Backend'i Başlat (Port 3002)

```bash
cd backend
npm start
```

**Uygulama**: http://localhost:3001

## 📁 Proje Yapısı

```
aishift/
├── index.html              # Ana HTML dosyası
├── app.js                  # Ana uygulama mantığı
├── style.css               # Tüm stiller
├── firebase-config.js      # Firebase yapılandırması
├── components/
│   ├── chat.js            # AI Chat modal
│   ├── feed.js            # Post kartları
│   ├── carousel.js        # Görsel carousel
│   └── stories.js         # Hikaye halkaları
├── backend/
│   ├── server.js          # Express API sunucusu
│   └── package.json       # Backend bağımlılıkları
├── data/
│   └── sample-data.js     # Örnek veri
└── assets/
    └── logo.png           # Logo
```

## 🔧 API Endpoints

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/generate` | POST | AI ile görsel üretimi |
| `/health` | GET | Sunucu durumu kontrolü |

## 📱 Cloudflare Tunnel ile Dağıtım

1. Cloudflare Tunnel kurun
2. Frontend ve backend için ayrı tunnel'lar yapılandırın
3. `chat.js` içindeki `BACKEND_URL`'i güncelleyin

## 🎯 Geliştirme Özeti

- ✅ Kategori filtreleme sistemi
- ✅ Yorum yazma ve Firebase kaydetme
- ✅ Paylaşım modalı (Link, WhatsApp, LinkedIn)
- ✅ AI Chatbot entegrasyonu (Gemini + Fal.ai)
- ✅ Görsel yükleme ve önizleme
- ✅ Arama özelliği
- ✅ Responsive tasarım

## 📄 Lisans

MIT License

## 👨‍💻 Geliştirici

Aziz Amerik Ali

---

**Live Demo**: [cpi.azizakal.org](https://cpi.azizakal.org)
