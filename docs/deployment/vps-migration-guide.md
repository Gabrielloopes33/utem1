# Guia de Migração: Netlify → VPS do Cliente

## Resumo

Este guia cobre a migração completa do projeto TIME da Netlify para uma VPS (DigitalOcean, AWS, Vultr, etc.) com novo domínio.

## Pré-requisitos na VPS

```bash
# 1. Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. PM2 (process manager)
npm install -g pm2

# 3. Nginx
sudo apt update
sudo apt install nginx

# 4. Git
sudo apt install git
```

---

## 1. Preparação do Código

### 1.1 Criar branch de migração
```bash
git checkout -b feat/migracao-vps-cliente
```

### 1.2 Atualizar Webhooks N8N (se necessário)

Se o N8N do cliente está em outro domínio:

```typescript
// src/app/api/agentes/conteudo/route.ts
const N8N_WEBHOOK_CHAT = "https://n8n.cliente.com.br/webhook/..." 
const N8N_WEBHOOK_GERAR_POST = "https://n8n.cliente.com.br/webhook/agente-gerar-post"

// src/app/api/agentes/campanhas/route.ts  
const N8N_WEBHOOK_URL = "https://n8n.cliente.com.br/webhook/agente-campanhas-chat"

// src/app/api/agentes/ideias/route.ts
const N8N_WEBHOOK_URL = "https://n8n.cliente.com.br/webhook/..."

// src/lib/n8n/client.ts
const N8N_BASE_URL = 'https://n8n.cliente.com.br/webhook'
```

### 1.3 Configurar para VPS (Standalone Output)

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // ... configurações existentes
  
  // Otimizado para Docker/VPS
  output: 'standalone', // Gera pasta .next/standalone (mais leve)
  
  // Desabilitar experimental em produção se necessário
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
}
```

---

## 2. Deploy na VPS

### 2.1 Clonar e Instalar

```bash
# Na VPS
mkdir -p /var/www
cd /var/www
git clone https://github.com/seu-repo/time.git
cd time

# Instalar dependências
npm ci --production

# Build
npm run build
```

### 2.2 Configurar Variáveis de Ambiente

```bash
# Criar .env.local
nano /var/www/time/.env.local
```

```env
# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://time.cliente.com.br
PORT=3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI
OPENAI_API_KEY=sk-...

# N8N (novos endpoints do cliente)
N8N_WEBHOOK_CHAT=https://n8n.cliente.com.br/webhook/...
N8N_WEBHOOK_GERAR_POST=https://n8n.cliente.com.br/webhook/agente-gerar-post

# Opcional: Analytics/APM
NEXT_PUBLIC_APM_ENABLED=false
```

### 2.3 Configurar PM2

```bash
# Criar configuração
nano /var/www/time/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'time-platform',
    script: './node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/time',
    instances: 'max', // Usar todos os cores
    exec_mode: 'cluster',
    env: {
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
    min_uptime: '10s'
  }]
}
```

```bash
# Criar pasta de logs
mkdir -p /var/www/time/logs

# Iniciar com PM2
cd /var/www/time
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd
```

---

## 3. Configurar Nginx (Reverse Proxy)

```bash
sudo nano /etc/nginx/sites-available/time
```

```nginx
server {
    listen 80;
    server_name time.cliente.com.br;
    
    # Redirect HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name time.cliente.com.br;

    # SSL (Certbot vai configurar)
    ssl_certificate /etc/letsencrypt/live/time.cliente.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/time.cliente.com.br/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache estáticos
    location /_next/static {
        alias /var/www/time/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location /static {
        alias /var/www/time/public/static;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Proxy para aplicação Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/time /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. SSL com Certbot

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d time.cliente.com.br

# Auto-renewal (já configurado pelo certbot)
sudo certbot renew --dry-run
```

---

## 5. Banco de Dados (Supabase)

### 5.1 Atualizar IPs Permitidos (se necessário)

```
Supabase Dashboard > Settings > Database > Connection String > IPv4
Adicionar IP da VPS do cliente
```

### 5.2 Aplicar Migrações

```bash
# Se usando Supabase CLI
supabase db push

# Ou aplicar SQL manualmente via Dashboard
```

---

## 6. Health Check e Monitoramento

### 6.1 Verificar se está funcionando

```bash
# Local na VPS
curl http://localhost:3000/api/health

# Público
curl https://time.cliente.com.br/api/health
```

### 6.2 Configurar Monitoramento Externo (Opcional)

```bash
# UptimeRobot, Pingdom, etc
URL: https://time.cliente.com.br/api/health
Interval: 5 minutos
```

---

## 7. CI/CD com GitHub Actions (Opcional)

```yaml
# .github/workflows/deploy-vps.yml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/time
            git pull origin main
            npm ci
            npm run build
            pm2 reload time-platform
```

---

## 8. Rollback (Se necessário)

```bash
# Na VPS
cd /var/www/time
git log --oneline -10
git reset --hard HEAD~1 # Voltar 1 commit
npm run build
pm2 reload time-platform
```

---

## Checklist Final

- [ ] VPS configurada (Node, PM2, Nginx)
- [ ] Código clonado e buildado
- [ ] Variáveis de ambiente configuradas
- [ ] N8N webhooks atualizados (se mudou)
- [ ] PM2 rodando
- [ ] Nginx configurado
- [ ] SSL instalado
- [ ] DNS apontando para VPS
- [ ] Health check respondendo
- [ ] Testar login/autenticação
- [ ] Testar chat com agentes
- [ ] Testar integrações N8N

---

## Troubleshooting

### Erro: "Cannot find module"
```bash
rm -rf node_modules
npm ci
npm run build
```

### Erro: "Port already in use"
```bash
pm2 delete all
pm2 start ecosystem.config.js
```

### Erro: "Permission denied"
```bash
sudo chown -R www-data:www-data /var/www/time
```

### SSL não funciona
```bash
sudo certbot --nginx -d time.cliente.com.br --force-renewal
```
