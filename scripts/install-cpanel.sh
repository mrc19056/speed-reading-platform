#!/bin/bash

# Speed Reading Platform - cPanel Installation Script
# Bu script cPanel ortamında uygulamayı kurur

set -e

# Renkleri tanımla
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Speed Reading Platform - cPanel Installation${NC}"

# cPanel kullanıcı bilgileri
CPANEL_USER=${CPANEL_USER:-$(whoami)}
HOME_DIR="/home/$CPANEL_USER"
PUBLIC_HTML="$HOME_DIR/public_html"
APP_DIR="$PUBLIC_HTML"

echo -e "${BLUE}Installation Configuration:${NC}"
echo -e "  User: $CPANEL_USER"
echo -e "  Home: $HOME_DIR"
echo -e "  Public HTML: $PUBLIC_HTML"
echo -e "  App Directory: $APP_DIR"

# Gerekli dizinleri oluştur
echo -e "${YELLOW}Creating necessary directories...${NC}"
mkdir -p "$HOME_DIR/logs"
mkdir -p "$HOME_DIR/tmp"
mkdir -p "$PUBLIC_HTML/uploads"
mkdir -p "$PUBLIC_HTML/static"

# Dosya izinlerini ayarla
echo -e "${YELLOW}Setting file permissions...${NC}"
chmod 755 "$PUBLIC_HTML"
chmod 755 "$PUBLIC_HTML/uploads"
chmod 755 "$HOME_DIR/logs"
chmod +x scripts/*.sh

# Node.js versiyonunu kontrol et
echo -e "${YELLOW}Checking Node.js version...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}Node.js version: $NODE_VERSION${NC}"
    
    # Node.js version check
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -lt 16 ]; then
        echo -e "${RED}Warning: Node.js version $NODE_VERSION is too old. Please upgrade to v16 or higher.${NC}"
    fi
else
    echo -e "${RED}Node.js is not installed. Please install Node.js through cPanel.${NC}"
    exit 1
fi

# NPM versiyonunu kontrol et
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}NPM version: $NPM_VERSION${NC}"
else
    echo -e "${RED}NPM is not available. Please check Node.js installation.${NC}"
    exit 1
fi

# Dependencies yükle
echo -e "${YELLOW}Installing dependencies...${NC}"
if [ -f "package.json" ]; then
    npm ci --only=production
    echo -e "${GREEN}Production dependencies installed${NC}"
else
    echo -e "${RED}package.json not found. Please ensure you're in the correct directory.${NC}"
    exit 1
fi

# Environment dosyasını kontrol et
echo -e "${YELLOW}Checking environment configuration...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}Creating .env.production template...${NC}"
    
    cat > .env.production << EOF
# Production Environment Variables - CUSTOMIZE THESE VALUES
NODE_ENV=production
PORT=3000

# Database Configuration - UPDATE WITH YOUR MONGODB ATLAS DETAILS
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speedreading?retryWrites=true&w=majority
DB_NAME=speedreading_prod

# Security - GENERATE STRONG SECRETS
JWT_SECRET=CHANGE-THIS-TO-A-STRONG-SECRET-KEY
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
SESSION_SECRET=CHANGE-THIS-TO-A-STRONG-SESSION-SECRET

# Domain Configuration - UPDATE WITH YOUR DOMAIN
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
DOMAIN=yourdomain.com

# cPanel Configuration
CPANEL_USER=$CPANEL_USER

# Performance
COMPRESSION_LEVEL=6
STATIC_CACHE_MAX_AGE=31536000

# Logging
LOG_LEVEL=info
LOG_FILE=$HOME_DIR/logs/app.log
EOF
    
    echo -e "${YELLOW}⚠️  Please edit .env.production and update the configuration values!${NC}"
else
    echo -e "${GREEN}.env.production file exists${NC}"
fi

# Build uygulamayı
echo -e "${YELLOW}Building application...${NC}"
if [ -f "webpack.config.prod.js" ]; then
    npm run build
    echo -e "${GREEN}Application built successfully${NC}"
else
    echo -e "${YELLOW}Webpack config not found, skipping build step${NC}"
fi

# .htaccess dosyasını kopyala
if [ -f "config/.htaccess" ]; then
    cp config/.htaccess "$PUBLIC_HTML/.htaccess"
    echo -e "${GREEN}.htaccess file copied${NC}"
else
    echo -e "${YELLOW}.htaccess file not found in config/${NC}"
fi

# PM2 kurulumunu kontrol et
echo -e "${YELLOW}Checking PM2 installation...${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}PM2 is already installed${NC}"
else
    echo -e "${YELLOW}Installing PM2...${NC}"
    npm install -g pm2
    echo -e "${GREEN}PM2 installed${NC}"
fi

# Database migration'ı çalıştır
echo -e "${YELLOW}Running database migrations...${NC}"
if [ -f "scripts/migration.js" ]; then
    node scripts/migration.js
    echo -e "${GREEN}Database migrations completed${NC}"
else
    echo -e "${YELLOW}Migration script not found${NC}"
fi

# Sample data yükle (opsiyonel)
read -p "Do you want to load sample data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "scripts/seed.js" ]; then
        node scripts/seed.js
        echo -e "${GREEN}Sample data loaded${NC}"
    else
        echo -e "${YELLOW}Seed script not found${NC}"
    fi
fi

# Logs için symlink oluştur
if [ ! -L "$PUBLIC_HTML/logs" ]; then
    ln -s "$HOME_DIR/logs" "$PUBLIC_HTML/logs"
    echo -e "${GREEN}Logs symlink created${NC}"
fi

# Installation özeti
echo -e "${GREEN}✅ Installation completed successfully!${NC}"
echo -e "${BLUE}Installation Summary:${NC}"
echo -e "  📁 Application Directory: $APP_DIR"
echo -e "  📋 Logs Directory: $HOME_DIR/logs"
echo -e "  🔧 Node.js Version: $NODE_VERSION"
echo -e "  📦 PM2 Status: $(pm2 --version 2>/dev/null || echo 'Installed')"

echo -e "${YELLOW}"
echo "🔥 Next Steps:"
echo "1. Edit .env.production with your actual configuration values"
echo "2. Configure Node.js App in cPanel:"
echo "   - Application Root: public_html"
echo "   - Startup File: server.js"
echo "   - Node.js Version: Select latest LTS (16.x or higher)"
echo "3. Set Environment Variables in cPanel Node.js Apps section"
echo "4. Start the application"
echo "5. Configure SSL certificate"
echo "6. Test the application: https://yourdomain.com/health"
echo -e "${NC}"

echo -e "${GREEN}🎉 Ready for cPanel deployment!${NC}"