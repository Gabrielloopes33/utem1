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

# ==========================================
# ARGs - Variáveis de build recebidas do EasyPanel
# ==========================================
ARG NODE_ENV=production
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG OPENAI_API_KEY
ARG APIFY_API_TOKEN
ARG N8N_WEBHOOK_URL
ARG ANTHROPIC_API_KEY
ARG DEEPSEEK_API_KEY

# ==========================================
# ENVs - Tornar as variáveis disponíveis durante o build
# ==========================================
ENV NODE_ENV=${NODE_ENV}
ENV SUPABASE_URL=${SUPABASE_URL}
ENV SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV APIFY_API_TOKEN=${APIFY_API_TOKEN}
ENV N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL}
ENV ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
ENV DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar arquivos de dependências primeiro (cache otimizado)
COPY package*.json ./
COPY package-lock.json* ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

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

# ==========================================
# ARGs na etapa de runner também
# ==========================================
ARG NODE_ENV=production
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG OPENAI_API_KEY
ARG APIFY_API_TOKEN
ARG N8N_WEBHOOK_URL
ARG ANTHROPIC_API_KEY
ARG DEEPSEEK_API_KEY

# ==========================================
# ENVs para runtime
# ==========================================
ENV NODE_ENV=${NODE_ENV}
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1
ENV SUPABASE_URL=${SUPABASE_URL}
ENV SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV APIFY_API_TOKEN=${APIFY_API_TOKEN}
ENV N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL}
ENV ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
ENV DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}

# Copiar arquivos necessários do builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "server.js"]
