// PM2 Configuration for VPS Deployment
module.exports = {
  apps: [{
    name: 'time-platform',
    script: './node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '.',
    instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
    exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    restart_delay: 3000,
    max_restarts: 5,
    min_uptime: '10s',
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 10000,
    // Auto restart
    autorestart: true,
    // Ignore watch (build folder)
    ignore_watch: ['node_modules', '.next', 'logs'],
    // Watch em desenvolvimento
    watch: process.env.NODE_ENV !== 'production',
  }]
}
