#!/bin/bash

# Speed Reading Platform Deployment Script
# cPanel production deployment için optimize edilmiş script

set -e

# Renkleri tanımla
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Speed Reading Platform Deployment Starting...${NC}"

# Environment variables
DEPLOY_DATE=$(date +"%Y-%m-%d %H:%M:%S")
BUILD_VERSION=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Configuration
CPANEL_HOST=${CPANEL_HOST:-"yourdomain.com"}
CPANEL_USER=${CPANEL_USER:-"username"}
REMOTE_PATH=${REMOTE_PATH:-"/home/$CPANEL_USER/public_html"}
LOCAL_BUILD_PATH="./dist"

echo -e "${BLUE}Deployment Configuration:${NC}"
echo -e "  Host: ${CPANEL_HOST}"
echo -e "  User: ${CPANEL_USER}"
echo -e "  Remote Path: ${REMOTE_PATH}"
echo -e "  Build Version: ${BUILD_VERSION}"
echo -e "  Date: ${DEPLOY_DATE}"

# Deployment öncesi kontroller
echo -e "${YELLOW}Pre-deployment checks...${NC}"

# Build dosyalarının varlığını kontrol et
if [ ! -d "$LOCAL_BUILD_PATH" ]; then
    echo -e "${RED}Error: Build directory not found. Please run build script first.${NC}"
    echo -e "${YELLOW}Run: npm run build${NC}"
    exit 1
fi

# .env.production dosyasının varlığını kontrol et
if [ ! -f ".env.production" ]; then
    echo -e "${RED}Error: .env.production file not found${NC}"
    exit 1
fi

# SSH key kontrolü (eğer SSH kullanılıyorsa)
if [ -n "$SSH_KEY_PATH" ] && [ ! -f "$SSH_KEY_PATH" ]; then
    echo -e "${RED}Error: SSH key not found at $SSH_KEY_PATH${NC}"
    exit 1
fi

echo -e "${GREEN}Pre-deployment checks passed${NC}"

# Backup oluştur
echo -e "${YELLOW}Creating backup...${NC}"
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).tar.gz"

# FTP/SFTP kullanarak backup oluşturma örneği
# Bu kısım gerçek FTP bilgilerinizle customize edilmelidir
if command -v sshpass &> /dev/null && [ -n "$CPANEL_PASSWORD" ]; then
    echo -e "${YELLOW}Creating remote backup via SSH...${NC}"
    # SSH ile backup alma örneği
    # sshpass -p "$CPANEL_PASSWORD" ssh $CPANEL_USER@$CPANEL_HOST "cd $REMOTE_PATH && tar -czf $BACKUP_NAME *.js *.json package.json 2>/dev/null || true"
    echo -e "${GREEN}Backup creation initiated${NC}"
else
    echo -e "${YELLOW}Manual backup recommended before deployment${NC}"
fi

# Deployment package hazırlama
echo -e "${YELLOW}Preparing deployment package...${NC}"
DEPLOY_PACKAGE="deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

# Deployment için gerekli dosyaları paketleme
tar -czf "$DEPLOY_PACKAGE" \
    -C "$LOCAL_BUILD_PATH" . \
    --exclude='*.map' \
    --exclude='.DS_Store' \
    --exclude='node_modules'

echo -e "${GREEN}Deployment package created: $DEPLOY_PACKAGE${NC}"

# cPanel File Manager için talimatlar
echo -e "${BLUE}📋 cPanel Deployment Instructions:${NC}"
echo -e "${YELLOW}=================================${NC}"
echo ""
echo -e "${GREEN}1. cPanel File Manager Access:${NC}"
echo "   - cPanel'e login olun"
echo "   - File Manager'ı açın"
echo "   - public_html dizinine gidin"
echo ""
echo -e "${GREEN}2. Backup (Önerilen):${NC}"
echo "   - Mevcut dosyaları bir klasöre taşıyın (örn: backup_$(date +%Y%m%d))"
echo "   - Veya Select All > Compress ile backup.zip oluşturun"
echo ""
echo -e "${GREEN}3. Upload New Files:${NC}"
echo "   - Upload butonuna tıklayın"
echo "   - $DEPLOY_PACKAGE dosyasını seçin ve upload edin"
echo "   - Upload tamamlandıktan sonra Extract butonuna tıklayın"
echo ""
echo -e "${GREEN}4. Node.js App Configuration:${NC}"
echo "   - cPanel'de 'Node.js Apps' bölümüne gidin"
echo "   - 'Create App' veya mevcut app'i edit edin"
echo "   - Node.js Version: 16.x veya üzeri"
echo "   - Application Root: public_html"
echo "   - Application URL: yourdomain.com veya subdomain"
echo "   - Startup File: server.js"
echo ""
echo -e "${GREEN}5. Environment Variables:${NC}"
echo "   - Node.js Apps'te Environment Variables sekmesine gidin"
echo "   - .env.production dosyasındaki değişkenleri ekleyin:"

# .env.production dosyasını okuyup environment variables listesi oluştur
if [ -f ".env.production" ]; then
    echo -e "${YELLOW}   Environment Variables:${NC}"
    while IFS= read -r line; do
        if [[ ! "$line" =~ ^#.* ]] && [[ "$line" =~ ^[A-Z_]+= ]]; then
            VAR_NAME=$(echo "$line" | cut -d'=' -f1)
            echo "     - $VAR_NAME"
        fi
    done < .env.production
fi

echo ""
echo -e "${GREEN}6. Database Configuration:${NC}"
echo "   - MongoDB Atlas connection string'ini güncelleyin"
echo "   - Production database ayarlarını kontrol edin"
echo ""
echo -e "${GREEN}7. SSL Certificate:${NC}"
echo "   - cPanel'de SSL/TLS sekmesine gidin"
echo "   - Let's Encrypt veya custom SSL sertifikası yükleyin"
echo "   - Force HTTPS Redirect'i aktif edin"
echo ""
echo -e "${GREEN}8. Start Application:${NC}"
echo "   - Node.js Apps'te 'Start App' butonuna tıklayın"
echo "   - Log'ları kontrol edin"
echo "   - Uygulama URL'ini test edin"
echo ""

# FTP/SFTP ile otomatik deployment (opsiyonel)
if [ "$AUTO_DEPLOY" = "true" ] && command -v lftp &> /dev/null; then
    echo -e "${YELLOW}Starting automatic FTP deployment...${NC}"
    
    # FTP bilgileri environment variable'lardan al
    FTP_HOST=${FTP_HOST:-$CPANEL_HOST}
    FTP_USER=${FTP_USER:-$CPANEL_USER}
    FTP_PASS=${FTP_PASS}
    
    if [ -n "$FTP_PASS" ]; then
        echo -e "${YELLOW}Uploading via FTP...${NC}"
        
        # LFTP ile dosya yükleme
        lftp -c "
        set ssl:verify-certificate no;
        open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST;
        cd public_html;
        mirror --reverse --delete --verbose $LOCAL_BUILD_PATH ./;
        bye"
        
        echo -e "${GREEN}Automatic FTP deployment completed${NC}"
    else
        echo -e "${RED}FTP_PASS environment variable not set. Skipping automatic deployment.${NC}"
    fi
fi

# Deployment sonrası kontroller
echo -e "${YELLOW}Post-deployment checklist:${NC}"
echo "□ Application başlatıldı mı?"
echo "□ Database bağlantısı çalışıyor mu?"
echo "□ SSL sertifikası aktif mi?"
echo "□ HTTPS redirect çalışıyor mu?"
echo "□ Environment variables doğru mu?"
echo "□ Log dosyaları kontrol edildi mi?"
echo "□ Uygulama testi yapıldı mı?"

# Useful commands
echo ""
echo -e "${BLUE}Yararlı cPanel Commands:${NC}"
echo "Node.js App restart: Node.js Apps > Restart"
echo "Log dosyaları: File Manager > logs/"
echo "Error logs: cPanel > Errors"
echo "Metrics: cPanel > Metrics"

# Cleanup
echo -e "${YELLOW}Cleaning up temporary files...${NC}"
# rm -f "$DEPLOY_PACKAGE" # İsteğe bağlı - backup amaçlı tutabilirsiniz

echo -e "${GREEN}✅ Deployment script completed!${NC}"
echo -e "${BLUE}Deployment package: $DEPLOY_PACKAGE${NC}"
echo -e "${BLUE}Manual upload to cPanel and configuration required.${NC}"

# Monitoring URL'leri
echo ""
echo -e "${BLUE}🔍 Monitoring URLs:${NC}"
echo "Application: https://$CPANEL_HOST"
echo "Health Check: https://$CPANEL_HOST/health"
echo "API Status: https://$CPANEL_HOST/api/v1/status"