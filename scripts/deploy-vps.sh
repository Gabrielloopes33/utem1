#!/bin/bash
# Script de Deploy Automatizado - AUTEM AI na VPS Contabo
# Uso: curl -fsSL https://raw.githubusercontent.com/seu-repo/deploy-vps.sh | bash
# Ou copie manualmente para a VPS e execute: chmod +x deploy-vps.sh && ./deploy-vps.sh

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do AUTEM AI na VPS..."
echo "================================================"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================
# CONFIGURAÇÕES (EDITE AQUI)
# ============================================
REPO_URL="https://github.com/Gabrielloopes33/utem1.git"
APP_NAME="time-platform"
APP_DIR="/var/www/$APP_NAME"
NODE_VERSION="20"

# ============================================
# FUNÇÕES
# ============================================
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# ============================================
# 1. ATUALIZAR SISTEMA
# ============================================
log "Atualizando sistema..."
apt update && apt upgrade -y

# ============================================
# 2. INSTALAR NODE.JS
# ============================================
log "Instalando Node.js ${NODE_VERSION}..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
fi

log "Node version: $(node --version)"
log "NPM version: $(npm --version)"

# ============================================
# 3. INSTALAR DEPENDÊNCIAS
# ============================================
log "Instalando dependências (PM2, Nginx, Git)..."
apt install -y nginx git

# Instalar PM2 globalmente
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# ============================================
# 4. CONFIGURAR SWAP (2GB) - Evita erros de memória
# ============================================
log "Configurando swap..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    log "Swap de 2GB criado com sucesso!"
else
    warn "Swap já existe, pulando..."
fi

# ============================================
# 5. CLONAR PROJETO
# ============================================
log "Clonando projeto..."
mkdir -p /var/www

if [ -d "$APP_DIR" ]; then
    warn "Diretório $APP_DIR já existe. Fazendo pull..."
    cd "$APP_DIR"
    git pull
else
    cd /var/www
    git clone "$REPO_URL" "$APP_NAME"
    cd "$APP_DIR"
fi

# ============================================
# 6. INSTALAR DEPENDÊNCIAS NPM
# ============================================
log "Instalando dependências NPM..."
npm install

# ============================================
# 7. CONFIGURAR VARIÁVEIS DE AMBIENTE
# ============================================
log "Configurando variáveis de ambiente..."

if [ ! -f .env ]; then
    warn "Arquivo .env não encontrado!"
    echo ""
    echo "⚠️  ATENÇÃO: Você precisa configurar as variáveis de ambiente!"
    echo ""
    echo "Execute: nano $APP_DIR/.env"
    echo ""
    echo "Variáveis OBRIGATÓRIAS:"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - OPENAI_API_KEY"
    echo "  - N8N_WEBHOOK_URL"
    echo ""
    echo "Exemplo:"
    cat > .env << 'EOF'
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon

# OpenAI
OPENAI_API_KEY=sk-sua-chave-openai

# n8n
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/xxx

# Ambiente
NODE_ENV=production
EOF
    echo ""
    read -p "Pressione ENTER após configurar o .env para continuar..."
fi

# ============================================
# 8. BUILD DA APLICAÇÃO
# ============================================
log "Fazendo build da aplicação..."
mkdir -p logs
npm run build

# ============================================
# 9. CONFIGURAR PM2
# ============================================
log "Configurando PM2..."
pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

# Configurar startup
pm2 startup systemd -u root --hp /root

# ============================================
# 10. CONFIGURAR NGINX
# ============================================
log "Configurando Nginx..."

cat > /etc/nginx/sites-available/$APP_NAME << 'EOF'
server {
    listen 80;
    server_name _;
    
    access_log /var/log/nginx/time-platform-access.log;
    error_log /var/log/nginx/time-platform-error.log;

    client_max_body_size 50M;

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
    }
}
EOF

# Ativar site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/

# Testar e reiniciar Nginx
nginx -t && systemctl restart nginx

# ============================================
# 11. CONFIGURAR FIREWALL
# ============================================
log "Configurando firewall..."
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# ============================================
# 12. VERIFICAÇÃO FINAL
# ============================================
log "Verificando instalação..."

IP_ADDRESS=$(hostname -I | awk '{print $1}')

echo ""
echo "================================================"
echo -e "${GREEN}✅ DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
echo "================================================"
echo ""
echo "📊 Status da Aplicação:"
pm2 status

echo ""
echo "🌐 Acesse sua aplicação:"
echo "   http://$IP_ADDRESS"
echo ""
echo "📁 Diretório do projeto: $APP_DIR"
echo ""
echo "🔧 Comandos úteis:"
echo "   Ver logs:        pm2 logs $APP_NAME"
echo "   Reiniciar:       pm2 restart $APP_NAME"
echo "   Parar:           pm2 stop $APP_NAME"
echo "   Editar .env:     nano $APP_DIR/.env"
echo ""
echo "📝 Próximos passos:"
echo "   1. Configure seu domínio apontando para: $IP_ADDRESS"
echo "   2. Para SSL, execute: certbot --nginx -d seu-dominio.com"
echo ""
echo "================================================"
