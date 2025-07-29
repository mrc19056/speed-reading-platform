module.exports = {
  apps: [{
    name: 'speed-reading-platform',
    script: 'server.js',
    cwd: '/home/username/public_html',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Logging
    log_file: '/home/username/logs/app.log',
    out_file: '/home/username/logs/out.log',
    error_file: '/home/username/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Restart configuration
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    max_memory_restart: '512M',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Process management
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 8000,
    
    // Auto restart on file changes (disabled in production)
    autorestart: true,
    
    // Environment variables file
    env_file: '.env.production',
    
    // Merge logs
    merge_logs: true,
    
    // Time zone
    time: true,
    
    // Advanced features
    node_args: '--max-old-space-size=512',
    
    // Health monitoring
    health_check_enabled: true,
    health_check_grace_period: 30000,
    
    // CPU and memory monitoring
    monitoring: true,
    
    // Instance variables
    instance_var: 'INSTANCE_ID'
  }],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'username',
      host: 'yourdomain.com',
      ref: 'origin/main',
      repo: 'git@github.com:username/speed-reading-platform.git',
      path: '/home/username/production',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /home/username/logs',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};