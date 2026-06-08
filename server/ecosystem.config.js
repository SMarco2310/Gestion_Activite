module.exports = {
  apps: [{
    name: 'gestiactivites-api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '512M',

    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
    },

    // Logs — written by Winston, PM2 captures stdout/stderr as backup
    out_file: './logs/pm2-out.log',
    error_file: './logs/pm2-error.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',

    // Restart policy
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 3000,

    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 8000,
    shutdown_with_message: true,
  }],
}
