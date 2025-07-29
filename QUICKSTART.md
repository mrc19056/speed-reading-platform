# Speed Reading Platform - Quick Start Guide

## 🚀 Hızlı Kurulum (5 Dakika)

### 1. Dosyaları İndirin
```bash
git clone https://github.com/mrc19056/speed-reading-platform.git
cd speed-reading-platform
```

### 2. cPanel Otomatik Kurulum
```bash
chmod +x scripts/install-cpanel.sh
./scripts/install-cpanel.sh
```

### 3. Environment Ayarlarını Yapın
`.env.production` dosyasını düzenleyin:
```bash
MONGODB_URI=your_mongodb_atlas_connection
JWT_SECRET=your_strong_secret_key
DOMAIN=yourdomain.com
```

### 4. cPanel'de Node.js App Oluşturun
- **Node.js Version**: 18.x
- **Application Root**: public_html  
- **Startup File**: server.js
- **Environment Variables**: .env.production'dan kopyalayın

### 5. Uygulamayı Başlatın
cPanel Node.js Apps bölümünde "Start App" butonuna tıklayın.

## ✅ Test Edin
- Health Check: `https://yourdomain.com/health`
- Uygulama: `https://yourdomain.com`

## 📞 Destek
Sorun yaşıyorsanız:
1. `docs/DEPLOYMENT.md` dosyasını kontrol edin
2. `docs/TECHNICAL.md` troubleshooting bölümüne bakın
3. Log dosyalarını kontrol edin: `pm2 logs`

---
**Kurulum süresi: ~5 dakika | Hazır şablonlarla hızlı başlangıç!**