# Speed Reading Platform - Production Deployment Guide

## 📋 cPanel Deployment Kılavuzu

Bu kılavuz, Speed Reading Platform'u Linux tabanlı cPanel sunucusunda production ortamında çalıştırmak için gereken tüm adımları içerir.

## 🎯 Sistem Gereksinimleri

### Minimum Gereksinimler
- **Node.js**: 16.x veya üzeri
- **NPM**: 8.x veya üzeri
- **MongoDB**: Atlas cloud veya yerel 5.x+
- **Disk Alanı**: Minimum 1GB
- **RAM**: Minimum 512MB
- **SSL Sertifikası**: HTTPS için gerekli

### Önerilen Gereksinimler
- **Node.js**: 18.x LTS
- **RAM**: 1GB veya üzeri
- **Disk Alanı**: 2GB+ (loglar ve backup için)
- **Bandwidth**: Sınırsız

## 🚀 Deployment Adımları

### 1. Ön Hazırlık

#### 1.1. Repository'i İndirin
```bash
git clone https://github.com/mrc19056/speed-reading-platform.git
cd speed-reading-platform
```

#### 1.2. Dependencies'leri Yükleyin
```bash
npm install
```

#### 1.3. Environment Variables'ı Yapılandırın
`.env.production` dosyasını düzenleyin:

```bash
# Veritabanı
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speedreading?retryWrites=true&w=majority
DB_NAME=speedreading_prod

# JWT Secret (güçlü bir key oluşturun)
JWT_SECRET=your-super-secure-jwt-secret-key-here-change-this-in-production

# Domain ayarları
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
DOMAIN=yourdomain.com

# cPanel kullanıcı bilgileri
CPANEL_USER=your-cpanel-username
```

### 2. Build Süreci

#### 2.1. Production Build Oluşturun
```bash
npm run build
```

#### 2.2. Build Script'i Çalıştırın
```bash
chmod +x scripts/build.sh
./scripts/build.sh
```

Bu script:
- Frontend'i production için build eder
- Dosyaları optimize eder
- Deployment paketi oluşturur

### 3. cPanel'e Deployment

#### 3.1. cPanel File Manager'a Giriş
1. cPanel'e login olun
2. "File Manager" açın
3. `public_html` dizinine gidin

#### 3.2. Mevcut Dosyaları Yedekleyin
```bash
# Mevcut dosyaları backup klasörüne taşıyın
mkdir backup_$(date +%Y%m%d)
mv * backup_$(date +%Y%m%d)/
```

#### 3.3. Build Dosyalarını Upload Edin
1. Build script'inin oluşturduğu zip dosyasını upload edin
2. Zip dosyasını extract edin
3. Dosya izinlerini kontrol edin

#### 3.4. Node.js App Konfigürasyonu
1. cPanel'de "Node.js Apps" bölümüne gidin
2. "Create App" tıklayın
3. Aşağıdaki ayarları yapın:

```
Node.js Version: 18.x (en güncel LTS)
Application Mode: Production
Application Root: public_html
Application URL: yourdomain.com
Startup File: server.js
```

#### 3.5. Environment Variables Ayarlayın
Node.js Apps > Environment Variables sekmesinde:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
DB_NAME=speedreading_prod
CORS_ORIGIN=https://yourdomain.com
DOMAIN=yourdomain.com
```

### 4. Database Konfigürasyonu

#### 4.1. MongoDB Atlas Setup
1. [MongoDB Atlas](https://cloud.mongodb.com) hesabı oluşturun
2. Cluster oluşturun
3. Database user ekleyin
4. IP whitelist'e serverınızı ekleyin
5. Connection string'i kopyalayın

#### 4.2. Database Migration Çalıştırın
```bash
node scripts/migration.js
```

#### 4.3. İlk Verileri Yükleyin (Opsiyonel)
```bash
node scripts/seed.js
```

### 5. SSL Sertifikası Kurulumu

#### 5.1. Let's Encrypt (Ücretsiz)
1. cPanel > SSL/TLS sekmesi
2. "Let's Encrypt" seçin
3. Domain'inizi seçin ve certificate oluşturun

#### 5.2. Force HTTPS Redirect
1. cPanel > SSL/TLS > Force HTTPS Redirect
2. Aktif edin

### 6. Application'ı Başlatın

#### 6.1. Node.js App'i Start Edin
1. Node.js Apps'te "Start App" butonuna tıklayın
2. Log'ları kontrol edin

#### 6.2. Application Test Edin
```
https://yourdomain.com/health
https://yourdomain.com/api/v1/status
```

## 🔧 Konfigürasyon Dosyaları

### `.htaccess` Konfigürasyonu
Ana `.htaccess` dosyası `config/.htaccess` konumunda bulunur ve şunları içerir:
- HTTPS redirect
- Security headers
- Compression
- Caching
- SPA routing

### PM2 Konfigürasyonu
`ecosystem.config.js` dosyası PM2 process manager ayarlarını içerir:
- Cluster mode
- Auto restart
- Log management
- Memory limits

### Security Konfigürasyonu
- `middleware/security.js`: Helmet, rate limiting, validation
- `middleware/cors.js`: CORS policy
- Input sanitization
- XSS protection

## 📊 Monitoring ve Maintenance

### 1. Log Monitoring
```bash
# PM2 logs
pm2 logs

# Application logs
tail -f logs/app.log

# Error logs
tail -f logs/error.log
```

### 2. Performance Monitoring
```bash
# PM2 monitoring
pm2 monit

# System resources
pm2 status
```

### 3. Health Checks
- Application: `https://yourdomain.com/health`
- API: `https://yourdomain.com/api/v1/status`
- Database connectivity test

### 4. Backup Strategy
```bash
# Otomatik backup (daily)
chmod +x scripts/backup.sh
./scripts/backup.sh

# Cron job ekleyin
0 2 * * * /path/to/scripts/backup.sh
```

## 🚨 Troubleshooting

### Yaygın Sorunlar ve Çözümler

#### 1. Application Start Etmiyor
```bash
# Log'ları kontrol edin
pm2 logs

# Node.js version kontrol edin
node --version

# Dependencies kontrol edin
npm list
```

#### 2. Database Bağlantı Sorunu
```bash
# MongoDB connection string kontrol edin
# IP whitelist kontrol edin
# Firewall ayarları kontrol edin
```

#### 3. Permission Errors
```bash
# Dosya izinlerini düzeltin
chmod -R 755 public_html/
chmod +x scripts/*.sh
```

#### 4. Memory Issues
```bash
# PM2 memory limit artırın
pm2 restart all --max-memory-restart 512M
```

### Log Analizi
```bash
# Error rate kontrolü
grep "ERROR" logs/app.log | wc -l

# Response time analizi
grep "Slow request" logs/app.log

# Security olayları
grep "Security event" logs/app.log
```

## 🔄 Update Prosedürü

### 1. Yeni Version Deploy Etme
```bash
# Backup oluşturun
./scripts/backup.sh

# Yeni version build edin
npm run build

# Deploy script çalıştırın
./scripts/deploy.sh

# Application'ı restart edin
pm2 restart all
```

### 2. Database Migration
```bash
# Yeni migration'ları çalıştırın
node scripts/migration.js
```

### 3. Rollback Prosedürü
```bash
# PM2 durdurun
pm2 stop all

# Eski version'a geri dönün
cd backup_YYYYMMDD/
pm2 start ecosystem.config.js
```

## 📞 Destek ve İletişim

- **Dokümantasyon**: Bu README dosyası
- **Log Dosyaları**: `logs/` dizini
- **Configuration**: `config/` dizini
- **Scripts**: `scripts/` dizini

## 🔒 Güvenlik Notları

1. **Environment variables'ı güvenli tutun**
2. **JWT secret'ı güçlü yapın**
3. **Database credentials'ı düzenli değiştirin**
4. **SSL sertifikasını güncel tutun**
5. **Dependencies'leri düzenli güncelleyin**
6. **Log dosyalarını izleyin**
7. **Backup'ları düzenli alın**

## 📈 Performance Optimizasyonu

1. **Caching**: Redis kullanımı
2. **CDN**: Static asset'ler için
3. **Compression**: Gzip aktif
4. **Database Indexing**: Sık kullanılan sorgular için
5. **Connection Pooling**: MongoDB için optimize edilmiş

---

Bu kılavuz Speed Reading Platform'un production ortamında başarılı bir şekilde çalıştırılması için gerekli tüm adımları içermektedir. Herhangi bir sorun yaşandığında troubleshooting bölümüne başvurun ve gerektiğinde log dosyalarını analiz edin.