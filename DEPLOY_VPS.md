# 🚀 Deploy na VPS Contabo - AUTEM AI

Guia completo para deploy da aplicação Next.js na VPS da Contabo.

---

## 📋 Pré-requisitos

- Acesso SSH à VPS (IP, usuário root e senha fornecidos pela Contabo)
- Domínio configurado apontando para o IP da VPS (opcional, mas recomendado)
- Credenciais do Supabase, OpenAI e n8n prontas

---

## 🔐 Passo 1: Acessar a VPS

```bash
# No Windows (PowerShell ou CMD)
ssh root@IP_DA_VPS

# Exemplo:
ssh root@192.168.1.100

# Quando perguntar about fingerprint, digite: yes
# Digite a senha fornecida pela Contabo (não aparece ao digitar)
```

---

## 🛠️ Passo 2: Atualizar Sistema e Instalar Dependências

```bash
# Atualizar pacotes
apt update && apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version   # Deve mostrar 10.x.x

# Instalar PM2 globalmente
npm install -g pm2

# Instalar Nginx
apt install -y nginx

# Instalar Git
apt install -y git

# Instalar Certbot para SSL (opcional, mas recomendado)
apt install -y certbot python3-certbot-nginx
```

---

## 📦 Passo 3: Clonar o Projeto

```bash
# Criar diretório para aplicações
mkdir -p /var/www
cd /var/www

# Clonar o repositório (ajuste a URL se for outra)
git clone https://github.com/Gabrielloopes33/utem1.git time-platform

# Entrar no diretório
cd time-platform

# Instalar dependências
npm install
```

---

## ⚙️ Passo 4: Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
cp .env.example .env
nano .env
```

**Edite o arquivo com suas credenciais:**

```env
# Supabase (OBRIGATÓRIO)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-aqui
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# OpenAI (OBRIGATÓRIO para embeddings)
OPENAI_API_KEY=sk-sua-chave-openai-aqui

# n8n (OBRIGATÓRIO para agentes)
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/xxx

# Outras chaves se necessário
ANTHROPIC_API_KEY=sua-chave-optional
DEEPSEEK_API_KEY=sua-chave-optional

# Ambiente
NODE_ENV=production
```

**Salvar:** `Ctrl+O` → `Enter` → `Ctrl+X`

---

## 🔨 Passo 5: Build da Aplicação

```bash
# Criar diretório de logs
mkdir -p logs

# Fazer build de produção
npm run build
```

> ⚠️ **Importante:** Se der erro de memória, adicione swap:
> ```bash
> fallocate -l 2G /swapfile
> chmod 600 /swapfile
> mkswap /swapfile
> swapon /swapfile
> ```

---

## 🚀 Passo 6: Iniciar com PM2

```bash
# Iniciar aplicação com PM2
pm2 start ecosystem.config.js --env production

# Verificar status
pm2 status
pm2 logs time-platform

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup systemd
# Execute o comando que ele mostrar (geralmente):
# systemctl enable pm2-root
```

---

## 🌐 Passo 7: Configurar Nginx (Reverse Proxy)

```bash
# Criar configuração do site
nano /etc/nginx/sites-available/time-platform
```

**Cole este conteúdo:**

```nginx
server {
    listen 80;
    server_name _;  # Aceita qualquer nome/domínio
    
    # Logs
    access_log /var/log/nginx/time-platform-access.log;
    error_log /var/log/nginx/time-platform-error.log;

    # Tamanho máximo de upload
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
```

**Salvar:** `Ctrl+O` → `Enter` → `Ctrl+X`

```bash
# Ativar site
ln -s /etc/nginx/sites-available/time-platform /etc/nginx/sites-enabled/

# Remover site default (opcional)
rm /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

---

## 🔒 Passo 8: SSL com Let's Encrypt (Opcional - Requer Domínio)

```bash
# Se tiver domínio apontando para a VPS:
certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Siga as instruções interativas
# Escolha: redirect HTTP to HTTPS

# Testar renovação automática
certbot renew --dry-run
```

---

## ✅ Verificação Final

```bash
# Verificar se aplicação está rodando
pm2 status
curl http://localhost:3000

# Verificar logs
pm2 logs time-platform --lines 50

# Verificar Nginx
systemctl status nginx
```

Acesse: `http://IP_DA_VPS`

---

## 🔄 Comandos Úteis para Manutenção

```bash
# Ver logs em tempo real
pm2 logs time-platform

# Reiniciar aplicação
pm2 restart time-platform

# Parar aplicação
pm2 stop time-platform

# Atualizar código (pull + rebuild)
cd /var/www/time-platform
git pull
npm install
npm run build
pm2 restart time-platform

# Ver uso de recursos
pm2 monit
htop
```

---

## 🆘 Troubleshooting

### Erro: "Cannot find module"
```bash
cd /var/www/time-platform
rm -rf node_modules
npm install
npm run build
pm2 restart time-platform
```

### Erro de permissão
```bash
chown -R root:root /var/www/time-platform
```

### Porta 3000 já em uso
```bash
# Matar processo na porta 3000
fuser -k 3000/tcp
pm2 restart time-platform
```

### Nginx não inicia
```bash
nginx -t  # Ver erro de sintaxe
systemctl status nginx
```

---

## 📊 Firewall (Recomendado)

```bash
# Instalar UFW
apt install -y ufw

# Configurar
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https

# Ativar
ufw enable
```

---

**Deploy concluído!** 🎉
