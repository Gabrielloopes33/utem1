#!/bin/bash
# Script de deploy para VPS
# Uso: ./scripts/deploy-vps.sh [ambiente]

set -e

AMBIENTE=${1:-production}
APP_NAME="time-platform"
DEPLOY_DIR="/var/www/time"

echo "🚀 Iniciando deploy para $AMBIENTE..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    log_error "Execute este script da raiz do projeto"
    exit 1
fi

# 1. Instalar dependências
log_info "Instalando dependências..."
npm ci

# 2. Verificar variáveis de ambiente
if [ ! -f ".env.local" ]; then
    log_warn "Arquivo .env.local não encontrado!"
    log_warn "Crie o arquivo antes de continuar"
    exit 1
fi

# 3. Type check
log_info "Verificando TypeScript..."
npm run typecheck

# 4. Build
log_info "Buildando aplicação..."
npm run build

# 5. Se for ambiente de produção na VPS
if [ "$AMBIENTE" == "production" ]; then
    log_info "Deploy em produção detectado"
    
    # Verificar se PM2 está instalado
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 não está instalado. Instale com: npm install -g pm2"
        exit 1
    fi
    
    # Criar diretório de logs
    mkdir -p logs
    
    # Verificar se já existe processo rodando
    if pm2 list | grep -q "$APP_NAME"; then
        log_info "Reload da aplicação..."
        pm2 reload ecosystem.config.js
    else
        log_info "Iniciando aplicação..."
        pm2 start ecosystem.config.js
        pm2 save
    fi
    
    log_info "Status da aplicação:"
    pm2 status
fi

log_info "✅ Deploy completado com sucesso!"

# 6. Health check
if [ "$AMBIENTE" == "production" ]; then
    sleep 3
    log_info "Verificando health check..."
    
    if curl -s http://localhost:3000/api/health > /dev/null; then
        log_info "✅ Health check OK"
    else
        log_error "❌ Health check falhou!"
        log_info "Verifique os logs: pm2 logs"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}🎉 Deploy finalizado!${NC}"
echo ""
echo "Comandos úteis:"
echo "  pm2 status          - Ver status da aplicação"
echo "  pm2 logs            - Ver logs em tempo real"
echo "  pm2 reload all      - Recarregar aplicação"
echo ""
