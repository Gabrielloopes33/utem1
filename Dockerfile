# Dockerfile para AUTEM AI - Next.js 15
# Otimizado para EasyPanel / Coolify / Qualquer PaaS Docker

# ==========================================
# ETAPA 1: BUILD
# ==========================================
FROM node:20-alpine AS builder

# Instalar dependências necessárias para build
RUN apk add --no-cache libc6-compat

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro (cache otimizado)
COPY package*.json ./
COPY package-lock.json* ./

# Instalar dependências
RUN npm ci --only=production=false

# Copiar código fonte
COPY . .

# Configurar variáveis de build (se necessário)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build da aplicação Next.js
RUN npm run build

# ==========================================
# ETAPA 2: PRODUÇÃO
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Variáveis de ambiente
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copiar arquivos necessários do builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicialização
CMD ["node", "server.js"]
