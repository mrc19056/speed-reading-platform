# Speed Reading Platform 🚀

[![Production Ready](https://img.shields.io/badge/production-ready-green.svg)](https://github.com/mrc19056/speed-reading-platform)
[![Node.js](https://img.shields.io/badge/node.js-18%2B-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-5.0%2B-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Modern, güvenli ve yüksek performanslı hızlı okuma eğitim platformu. cPanel hosting ortamında production deployment için tam optimizasyonlu.

## ✨ Özellikler

### 🎯 Eğitim Özellikleri
- **Etkileşimli Okuma Alıştırmaları**: Çeşitli zorluk seviyelerinde metinler
- **İlerleme Takibi**: Detaylı analitik ve grafikler
- **Kişiselleştirilmiş Hedefler**: Bireysel gelişim planları
- **Anlama Testleri**: Çoktan seçmeli değerlendirmeler
- **Okuma Hızı Ölçümü**: WPM (Words Per Minute) takibi

### 🛡️ Güvenlik Özellikleri
- **HTTPS Zorlaması**: SSL/TLS şifreleme
- **CORS Koruması**: Cross-origin güvenlik
- **Rate Limiting**: DDoS koruması
- **Input Sanitization**: XSS/Injection koruması
- **JWT Authentication**: Güvenli oturum yönetimi
- **Security Headers**: Helmet.js ile kapsamlı güvenlik

### 🚀 Performance Özellikleri
- **Webpack Optimizasyonu**: Production build optimizasyonu
- **Gzip Sıkıştırma**: Hızlı yükleme
- **CDN Ready**: Static asset optimizasyonu
- **Database Connection Pooling**: MongoDB performans optimizasyonu
- **PM2 Cluster Mode**: Multi-core CPU kullanımı

### 🔧 Production Özellikleri
- **cPanel Uyumluluğu**: Kolay deployment
- **Otomatik Backup**: Zamanlanmış yedekleme
- **Health Monitoring**: Sistem durumu izleme
- **Error Logging**: Kapsamlı log yönetimi
- **Docker Support**: Container deployment opsiyonu

## 📋 Sistem Gereksinimleri

### Minimum Gereksinimler
```
- Node.js 16.x veya üzeri
- NPM 8.x veya üzeri
- MongoDB Atlas hesabı
- 512MB RAM
- 1GB disk alanı
- SSL sertifikası
```

### Önerilen Gereksinimler
```
- Node.js 18.x LTS
- 1GB+ RAM
- 2GB+ disk alanı
- CDN entegrasyonu
- Otomatik backup sistemi
```

## 🚀 Hızlı Başlangıç

### 1. Repository'i İndirin
```bash
git clone https://github.com/mrc19056/speed-reading-platform.git
cd speed-reading-platform
```

### 2. Dependencies'leri Yükleyin
```bash
npm install
```

### 3. Environment Variables'ı Ayarlayın
```bash
cp .env.production .env
# .env dosyasını kendi bilgilerinizle düzenleyin
```

### 4. Build Edin
```bash
npm run build
```

### 5. Production'a Deploy Edin
```bash
./scripts/deploy.sh
```

## 📁 Proje Yapısı

```
speed-reading-platform/
├── 📁 config/              # Konfigürasyon dosyaları
│   ├── .htaccess           # Apache konfigürasyonu
│   ├── apache.conf         # Virtual host örneği
│   └── db-config.js        # Veritabanı konfigürasyonu
├── 📁 middleware/          # Express middleware'leri
│   ├── security.js         # Güvenlik middleware'i
│   └── cors.js             # CORS konfigürasyonu
├── 📁 scripts/             # Deployment scriptleri
│   ├── build.sh            # Production build
│   ├── deploy.sh           # Deployment scripti
│   ├── backup.sh           # Otomatik backup
│   ├── install-cpanel.sh   # cPanel kurulum
│   ├── migration.js        # Veritabanı migrationları
│   └── seed.js             # Örnek veri yükleyici
├── 📁 src/                 # Frontend kaynak kodları
├── 📁 public/              # Public assets
├── 📁 docs/                # Dokümantasyon
├── 📄 server.js            # Ana server dosyası
├── 📄 package.json         # Dependencies ve scriptler
├── 📄 ecosystem.config.js  # PM2 konfigürasyonu
├── 📄 webpack.config.prod.js # Production webpack
├── 📄 Dockerfile           # Docker konfigürasyonu
└── 📄 docker-compose.yml   # Docker compose
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Development server başlat
npm run build:dev        # Development build

# Production
npm run build            # Production build oluştur
npm run start            # Production server başlat
npm run production       # PM2 ile production'da çalıştır

# Database
npm run migrate          # Database migration'ları çalıştır
npm run seed             # Örnek verileri yükle

# Deployment
npm run deploy           # Production'a deploy et
npm run backup           # Backup oluştur

# Monitoring
npm run logs             # PM2 loglarını görüntüle
npm run stop             # Uygulamayı durdur
npm run restart          # Uygulamayı yeniden başlat
```

## 📊 API Endpoints

### Sistem Durumu
```
GET /health              # Sistem durumu kontrolü
GET /api/v1/status       # API durumu
```

### Kullanıcı Yönetimi
```
POST /api/v1/auth/login    # Kullanıcı girişi
POST /api/v1/auth/register # Kullanıcı kaydı
GET  /api/v1/users/profile # Kullanıcı profili
```

### Okuma Metinleri
```
GET  /api/v1/texts         # Okuma metinlerini listele
GET  /api/v1/texts/:id     # Belirli bir metni getir
POST /api/v1/texts         # Yeni metin ekle (admin)
```

### Okuma Oturumları
```
POST /api/v1/sessions      # Yeni okuma oturumu başlat
PUT  /api/v1/sessions/:id  # Okuma oturumunu güncelle
GET  /api/v1/sessions      # Kullanıcının oturumları
```

## 🔧 cPanel Deployment

### Adım 1: cPanel'e Dosya Yükleme
1. Build scriptini çalıştırın: `./scripts/build.sh`
2. Oluşan zip dosyasını cPanel File Manager'a yükleyin
3. public_html dizinine extract edin

### Adım 2: Node.js App Konfigürasyonu
```
Node.js Version: 18.x
Application Mode: Production
Application Root: public_html
Startup File: server.js
```

### Adım 3: Environment Variables
cPanel Node.js Apps bölümünde aşağıdaki değişkenleri ekleyin:
```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
DOMAIN=yourdomain.com
```

### Adım 4: SSL Konfigürasyonu
1. cPanel > SSL/TLS
2. Let's Encrypt sertifikası oluşturun
3. Force HTTPS Redirect aktif edin

Detaylı deployment kılavuzu: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 🛡️ Güvenlik

### Security Headers
- **HSTS**: HTTP Strict Transport Security
- **CSP**: Content Security Policy
- **X-Frame-Options**: Clickjacking koruması
- **X-XSS-Protection**: XSS koruması
- **X-Content-Type-Options**: MIME sniffing koruması

### Rate Limiting
- **API Endpoints**: 100 request/15 dakika
- **Auth Endpoints**: 5 request/15 dakika
- **Password Reset**: 3 request/saat

### Input Validation
- **Express Validator**: Server-side validation
- **Mongoose Schemas**: Database validation
- **Sanitization**: XSS ve injection koruması

## 📊 Monitoring

### Health Checks
```bash
# Application health
curl https://yourdomain.com/health

# API status
curl https://yourdomain.com/api/v1/status
```

### Log Monitoring
```bash
# PM2 logs
pm2 logs

# Application logs
tail -f logs/app.log

# Error logs
tail -f logs/error.log
```

### Performance Monitoring
```bash
# PM2 monitoring
pm2 monit

# System resources
pm2 status
```

## 🔄 Backup ve Recovery

### Otomatik Backup
```bash
# Daily backup (cron job)
0 2 * * * /path/to/scripts/backup.sh

# Manual backup
./scripts/backup.sh
```

### Recovery
```bash
# Database restore
mongorestore --uri="mongodb_uri" backup/database/

# File restore
tar -xzf backup.tar.gz
rsync -av backup/files/ ./
```

## 🚨 Troubleshooting

### Yaygın Sorunlar

#### Application Başlatılamıyor
```bash
# Log kontrolü
pm2 logs

# Node.js version kontrolü
node --version

# Dependencies kontrolü
npm list
```

#### Database Bağlantı Sorunu
```bash
# MongoDB connection test
node -e "require('./config/db-config').connectDB()"
```

#### SSL Sorunları
```bash
# SSL certificate kontrol
openssl x509 -in cert.pem -text -noout
```

Detaylı troubleshooting: [docs/TECHNICAL.md](docs/TECHNICAL.md)

## 📖 Dokümantasyon

- **[Deployment Guide](docs/DEPLOYMENT.md)**: Detaylı deployment kılavuzu
- **[Technical Documentation](docs/TECHNICAL.md)**: Teknik dokümantasyon
- **[API Documentation](docs/API.md)**: API referansı (gelecekte eklenecek)

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'i push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında dağıtılmaktadır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🆘 Destek

- **GitHub Issues**: Bug report ve feature request
- **Documentation**: Kapsamlı dokümantasyon
- **Email**: destek@speedreading.com

## 🏆 Teşekkürler

- Express.js ekibine
- MongoDB ekibine
- React ekibine
- Açık kaynak topluluğuna

---

**Made with ❤️ for speed reading education**

⭐ Bu projeyi beğendiyseniz star vermeyi unutmayın!