#!/bin/bash

# Speed Reading Platform Backup Script
# MongoDB ve dosya sistemini yedekler

set -e

# Renkleri tanımla
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🗄️ Speed Reading Platform Backup Starting...${NC}"

# Configuration
BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_ROOT_DIR=${BACKUP_ROOT_DIR:-"/backups"}
BACKUP_DIR="$BACKUP_ROOT_DIR/speedreading_$BACKUP_DATE"
APP_DIR=${APP_DIR:-"/home/username/public_html"}
RETENTION_DAYS=${RETENTION_DAYS:-30}

# Database configuration
DB_NAME=${DB_NAME:-"speedreading_prod"}
MONGODB_URI=${MONGODB_URI:-"mongodb+srv://username:password@cluster.mongodb.net"}

echo -e "${BLUE}Backup Configuration:${NC}"
echo -e "  Date: ${BACKUP_DATE}"
echo -e "  Backup Directory: ${BACKUP_DIR}"
echo -e "  App Directory: ${APP_DIR}"
echo -e "  Database: ${DB_NAME}"
echo -e "  Retention: ${RETENTION_DAYS} days"

# Create backup directory
echo -e "${YELLOW}Creating backup directory...${NC}"
mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR/database"
mkdir -p "$BACKUP_DIR/files"
mkdir -p "$BACKUP_DIR/config"
mkdir -p "$BACKUP_DIR/logs"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Database backup
echo -e "${YELLOW}Backing up MongoDB database...${NC}"
if command_exists mongodump; then
    # Use mongodump if available
    mongodump --uri="$MONGODB_URI/$DB_NAME" --out="$BACKUP_DIR/database" --gzip
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Database backup completed successfully${NC}"
    else
        echo -e "${RED}Database backup failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}mongodump not found, creating database backup script...${NC}"
    
    # Create a backup script for manual execution
    cat > "$BACKUP_DIR/database/restore_instructions.txt" << EOF
MongoDB Backup Instructions
===========================

Since mongodump is not available on this system, please follow these steps:

1. Install MongoDB Database Tools:
   wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2004-x86_64-100.7.0.tgz
   tar -zxvf mongodb-database-tools-ubuntu2004-x86_64-100.7.0.tgz
   sudo cp mongodb-database-tools-ubuntu2004-x86_64-100.7.0/bin/* /usr/local/bin/

2. Create database backup:
   mongodump --uri="$MONGODB_URI/$DB_NAME" --out="./database_backup" --gzip

3. Restore database:
   mongorestore --uri="$MONGODB_URI/$DB_NAME" --gzip ./database_backup/$DB_NAME

Backup created on: $(date)
Database URI: $MONGODB_URI
Database Name: $DB_NAME
EOF
fi

# File system backup
echo -e "${YELLOW}Backing up application files...${NC}"
if [ -d "$APP_DIR" ]; then
    # Backup application files (excluding node_modules and logs)
    rsync -av --exclude='node_modules' \
              --exclude='logs' \
              --exclude='*.log' \
              --exclude='tmp' \
              --exclude='.git' \
              --exclude='dist' \
              --exclude='build' \
              "$APP_DIR/" "$BACKUP_DIR/files/"
    
    echo -e "${GREEN}Application files backup completed${NC}"
else
    echo -e "${RED}Application directory not found: $APP_DIR${NC}"
fi

# Configuration backup
echo -e "${YELLOW}Backing up configuration files...${NC}"

# Backup environment files
for env_file in ".env" ".env.production" ".env.staging"; do
    if [ -f "$APP_DIR/$env_file" ]; then
        cp "$APP_DIR/$env_file" "$BACKUP_DIR/config/"
        echo -e "${GREEN}Backed up $env_file${NC}"
    fi
done

# Backup PM2 configuration
if [ -f "$APP_DIR/ecosystem.config.js" ]; then
    cp "$APP_DIR/ecosystem.config.js" "$BACKUP_DIR/config/"
    echo -e "${GREEN}Backed up PM2 configuration${NC}"
fi

# Backup nginx/apache configuration
for config_file in "nginx.conf" "apache.conf" ".htaccess"; do
    if [ -f "$APP_DIR/$config_file" ]; then
        cp "$APP_DIR/$config_file" "$BACKUP_DIR/config/"
        echo -e "${GREEN}Backed up $config_file${NC}"
    fi
done

# Log files backup
echo -e "${YELLOW}Backing up log files...${NC}"
if [ -d "$APP_DIR/logs" ]; then
    cp -r "$APP_DIR/logs"/* "$BACKUP_DIR/logs/" 2>/dev/null || true
    echo -e "${GREEN}Log files backup completed${NC}"
fi

# System information
echo -e "${YELLOW}Collecting system information...${NC}"
cat > "$BACKUP_DIR/system_info.txt" << EOF
Speed Reading Platform Backup Information
=========================================

Backup Date: $(date)
Server: $(hostname)
Operating System: $(uname -a)
Node.js Version: $(node --version 2>/dev/null || echo "Not installed")
NPM Version: $(npm --version 2>/dev/null || echo "Not installed")
PM2 Status: $(pm2 status 2>/dev/null || echo "PM2 not running")

Disk Usage:
$(df -h)

Memory Usage:
$(free -h)

Network Interfaces:
$(ip addr show 2>/dev/null || ifconfig 2>/dev/null || echo "Network info not available")

Environment Variables (filtered):
$(env | grep -E '^(NODE_ENV|PORT|DB_|MONGODB_)' | sort)

Backup Contents:
$(find "$BACKUP_DIR" -type f | wc -l) files
$(du -sh "$BACKUP_DIR")
EOF

# Create backup manifest
echo -e "${YELLOW}Creating backup manifest...${NC}"
cat > "$BACKUP_DIR/MANIFEST.md" << EOF
# Speed Reading Platform Backup

**Backup Date:** $(date)  
**Backup ID:** speedreading_$BACKUP_DATE  
**Server:** $(hostname)  

## Contents

### Database Backup
- Location: \`database/\`
- Format: MongoDB dump (gzipped)
- Database: $DB_NAME

### Application Files
- Location: \`files/\`
- Excludes: node_modules, logs, build artifacts
- Source: $APP_DIR

### Configuration Files
- Location: \`config/\`
- Environment files
- PM2 configuration
- Web server configuration

### Log Files
- Location: \`logs/\`
- Application logs
- Error logs
- Access logs

## Restoration Instructions

1. **Database Restoration:**
   \`\`\`bash
   mongorestore --uri="$MONGODB_URI/$DB_NAME" --gzip database/$DB_NAME
   \`\`\`

2. **File Restoration:**
   \`\`\`bash
   rsync -av files/ /path/to/application/
   \`\`\`

3. **Configuration Restoration:**
   \`\`\`bash
   cp config/* /path/to/application/
   \`\`\`

4. **Install Dependencies:**
   \`\`\`bash
   npm ci --only=production
   \`\`\`

5. **Start Application:**
   \`\`\`bash
   pm2 start ecosystem.config.js
   \`\`\`

## Verification

- Verify file count: $(find "$BACKUP_DIR" -type f | wc -l) files
- Total size: $(du -sh "$BACKUP_DIR" | cut -f1)
- Created: $(date)

EOF

# Compress backup
echo -e "${YELLOW}Compressing backup...${NC}"
cd "$BACKUP_ROOT_DIR"
tar -czf "speedreading_backup_$BACKUP_DATE.tar.gz" "speedreading_$BACKUP_DATE"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -sh "speedreading_backup_$BACKUP_DATE.tar.gz" | cut -f1)
    echo -e "${GREEN}Backup compressed successfully: speedreading_backup_$BACKUP_DATE.tar.gz ($BACKUP_SIZE)${NC}"
    
    # Remove uncompressed directory
    rm -rf "$BACKUP_DIR"
else
    echo -e "${RED}Backup compression failed${NC}"
    exit 1
fi

# Cleanup old backups
echo -e "${YELLOW}Cleaning up old backups...${NC}"
find "$BACKUP_ROOT_DIR" -name "speedreading_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
echo -e "${GREEN}Old backups cleaned up (older than $RETENTION_DAYS days)${NC}"

# Upload to cloud storage (optional)
if [ -n "$AWS_S3_BUCKET" ] && command_exists aws; then
    echo -e "${YELLOW}Uploading backup to S3...${NC}"
    aws s3 cp "speedreading_backup_$BACKUP_DATE.tar.gz" "s3://$AWS_S3_BUCKET/backups/"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Backup uploaded to S3 successfully${NC}"
    else
        echo -e "${RED}S3 upload failed${NC}"
    fi
fi

# Send notification (optional)
if [ -n "$WEBHOOK_URL" ]; then
    echo -e "${YELLOW}Sending backup notification...${NC}"
    curl -X POST "$WEBHOOK_URL" \
         -H "Content-Type: application/json" \
         -d "{\"text\":\"✅ Speed Reading Platform backup completed successfully\n📁 Backup: speedreading_backup_$BACKUP_DATE.tar.gz\n📊 Size: $BACKUP_SIZE\n🕐 Date: $(date)\"}" \
         2>/dev/null || echo -e "${RED}Notification failed${NC}"
fi

# Summary
echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo -e "${BLUE}Backup Summary:${NC}"
echo -e "  📁 File: speedreading_backup_$BACKUP_DATE.tar.gz"
echo -e "  📊 Size: $BACKUP_SIZE"
echo -e "  📍 Location: $BACKUP_ROOT_DIR"
echo -e "  🕐 Date: $(date)"
echo -e "  🔧 Retention: $RETENTION_DAYS days"

echo -e "${YELLOW}To restore this backup:${NC}"
echo -e "  1. Extract: tar -xzf speedreading_backup_$BACKUP_DATE.tar.gz"
echo -e "  2. Follow restoration instructions in MANIFEST.md"

exit 0