#!/bin/bash

# Speed Reading Platform Build Script
# Bu script production için optimized build oluşturur

set -e

echo "🚀 Speed Reading Platform Build Starting..."

# Renkleri tanımla
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Tarih ve zaman
BUILD_DATE=$(date +"%Y-%m-%d %H:%M:%S")
BUILD_VERSION=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo -e "${BLUE}Build Date: ${BUILD_DATE}${NC}"
echo -e "${BLUE}Build Version: ${BUILD_VERSION}${NC}"

# Node.js ve npm versiyonlarını kontrol et
echo -e "${YELLOW}Checking Node.js and npm versions...${NC}"
node --version
npm --version

# Environment variables yükle
if [ -f ".env.production" ]; then
    echo -e "${GREEN}Loading production environment variables...${NC}"
    export $(grep -v '^#' .env.production | xargs)
else
    echo -e "${RED}Warning: .env.production file not found!${NC}"
fi

# Eski build dosyalarını temizle
echo -e "${YELLOW}Cleaning previous build...${NC}"
if [ -d "dist" ]; then
    rm -rf dist
    echo -e "${GREEN}Previous build cleaned${NC}"
fi

if [ -d "build" ]; then
    rm -rf build
    echo -e "${GREEN}Previous build directory cleaned${NC}"
fi

# Dependencies'leri yükle
echo -e "${YELLOW}Installing dependencies...${NC}"
npm ci --only=production

# Development dependencies'leri yükle (build için gerekli)
echo -e "${YELLOW}Installing development dependencies for build...${NC}"
npm ci

# Lint kontrolü
echo -e "${YELLOW}Running ESLint...${NC}"
npm run lint || echo -e "${RED}Warning: Lint errors found${NC}"

# Frontend build
echo -e "${YELLOW}Building frontend...${NC}"
npm run build

# Build başarılı mı kontrol et
if [ -d "dist" ]; then
    echo -e "${GREEN}Frontend build successful!${NC}"
    
    # Build boyutlarını göster
    echo -e "${BLUE}Build size analysis:${NC}"
    du -sh dist/
    find dist/ -name "*.js" -exec du -h {} \; | sort -h
    find dist/ -name "*.css" -exec du -h {} \; | sort -h
else
    echo -e "${RED}Frontend build failed!${NC}"
    exit 1
fi

# Static dosyaları kopyala
echo -e "${YELLOW}Copying static assets...${NC}"
if [ -d "public" ]; then
    cp -r public/* dist/ 2>/dev/null || true
    echo -e "${GREEN}Static assets copied${NC}"
fi

# .htaccess dosyasını kopyala
if [ -f "config/.htaccess" ]; then
    cp config/.htaccess dist/.htaccess
    echo -e "${GREEN}.htaccess file copied${NC}"
fi

# Robots.txt kopyala
if [ -f "robots.txt" ]; then
    cp robots.txt dist/robots.txt
    echo -e "${GREEN}robots.txt copied${NC}"
fi

# Sitemap kopyala
if [ -f "sitemap.xml" ]; then
    cp sitemap.xml dist/sitemap.xml
    echo -e "${GREEN}sitemap.xml copied${NC}"
fi

# Production package.json oluştur
echo -e "${YELLOW}Creating production package.json...${NC}"
cat > dist/package.json << EOF
{
  "name": "speed-reading-platform",
  "version": "1.0.0",
  "description": "Speed Reading Platform - Production Build",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.3.1",
    "compression": "^1.7.4",
    "express-rate-limit": "^6.8.1"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

# Build bilgilerini kaydet
echo -e "${YELLOW}Saving build information...${NC}"
cat > dist/build-info.json << EOF
{
  "buildDate": "${BUILD_DATE}",
  "buildVersion": "${BUILD_VERSION}",
  "nodeVersion": "$(node --version)",
  "npmVersion": "$(npm --version)",
  "environment": "production"
}
EOF

# Deployment zip dosyası oluştur
echo -e "${YELLOW}Creating deployment package...${NC}"
cd dist
zip -r "../speed-reading-platform-${BUILD_VERSION}.zip" . -x "*.map"
cd ..
echo -e "${GREEN}Deployment package created: speed-reading-platform-${BUILD_VERSION}.zip${NC}"

# Build özeti
echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo -e "${BLUE}Build Summary:${NC}"
echo -e "  📁 Output directory: dist/"
echo -e "  📦 Package: speed-reading-platform-${BUILD_VERSION}.zip"
echo -e "  🕐 Build time: ${BUILD_DATE}"
echo -e "  🔧 Version: ${BUILD_VERSION}"

# Deployment talimatları
echo -e "${YELLOW}"
echo "📋 Next steps for cPanel deployment:"
echo "1. Upload speed-reading-platform-${BUILD_VERSION}.zip to your cPanel File Manager"
echo "2. Extract the zip file to public_html directory"
echo "3. Configure Node.js app in cPanel"
echo "4. Set environment variables in cPanel"
echo "5. Start the application"
echo -e "${NC}"

echo -e "${GREEN}🎉 Build process completed!${NC}"