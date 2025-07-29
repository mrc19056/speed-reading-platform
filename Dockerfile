# Use official Node.js runtime as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    bash \
    tzdata

# Set timezone
ENV TZ=Europe/Istanbul

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S speedreading -u 1001

# Copy package files
COPY package*.json ./

# Production dependencies
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS build
COPY . .
RUN npm ci
RUN npm run build

# Production stage
FROM base AS production

# Copy node_modules from deps stage
COPY --from=deps --chown=speedreading:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=build --chown=speedreading:nodejs /app/dist ./dist
COPY --from=build --chown=speedreading:nodejs /app/package.json ./
COPY --from=build --chown=speedreading:nodejs /app/server.js ./
COPY --from=build --chown=speedreading:nodejs /app/config ./config
COPY --from=build --chown=speedreading:nodejs /app/middleware ./middleware

# Create necessary directories
RUN mkdir -p logs uploads && \
    chown -R speedreading:nodejs logs uploads

# Switch to non-root user
USER speedreading

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "server.js"]