# Checklist: Integração Posts @autem.inv

## Objetivo
Buscar posts reais da @autem.inv via Apify, salvar no Supabase e exibir no dashboard com preview das artes.

## Contexto
- Tabela: `public.autem_posts`
- API: `/api/autem/top-posts`
- Lib: `src/lib/apify/autem.ts`
- Dashboard: `src/app/(app)/dashboard/page.tsx`

---

## 1. Banco de Dados

### 1.1 Tabela autem_posts existe
- [ ] Verificar se migration foi executada
- [ ] Confirmar colunas: external_id, caption, likes, comments, media_type, permalink, thumbnail_url, engagement_rate

### 1.2 Índices criados
- [ ] idx_autem_posts_timestamp
- [ ] idx_autem_posts_engagement
- [ ] idx_autem_posts_media_type

---

## 2. Backend - Apify Integration

### 2.1 Lib autem.ts funciona
- [ ] Função scrapeAutemProfile() chama Apify corretamente
- [ ] Extrai posts do perfil @autem.inv
- [ ] Calcula engagement_rate: (likes + comments) / followers * 100
- [ ] Retorna dados no formato AutemPost[]

### 2.2 Cache no Supabase
- [ ] Função getAutemPosts() verifica cache primeiro
- [ ] Se cache válido (< 6h), retorna do banco
- [ ] Se cache inválido ou vazio, faz scraping
- [ ] Salva posts no Supabase via upsert

### 2.3 API Route /api/autem/top-posts
- [ ] Verifica se APIFY_API_TOKEN está configurado
- [ ] Chama getAutemPosts() para buscar dados
- [ ] Ordena por engagement_rate descendente
- [ ] Formata título (primeira linha da caption)
- [ ] Retorna JSON com { success, data, source }

---

## 3. Frontend - Dashboard

### 3.1 Hook use-dashboard-metrics
- [ ] Chama /api/autem/top-posts na inicialização
- [ ] Se sucesso, usa posts reais
- [ ] Se erro, fallback para mockados
- [ ] Adiciona flag _dataSource para tracking

### 3.2 Card de Posts
- [ ] Mostra indicador "Dados Reais" ou "Dados Simulados"
- [ ] Lista top 5 posts por engajamento
- [ ] Cada post mostra: thumbnail, título, tipo, engajamento, likes
- [ ] Thumbnail é clicável e abre o post no Instagram
- [ ] Thumbnail tem hover effect (zoom)

### 3.3 Tratamento de erro de imagem
- [ ] Se thumbnailUrl falhar carregar, mostra ícone Instagram
- [ ] Imagem tem onError handler

---

## 4. Testes

### 4.1 Teste manual
- [ ] Limpar tabela autem_posts
- [ ] Abrir dashboard
- [ ] Verificar se faz scraping automático
- [ ] Confirmar posts aparecem com imagens reais
- [ ] Clicar no post e verificar redirecionamento

### 4.2 Verificação de dados
- [ ] Posts têm external_id único
- [ ] Posts têm permalink válido
- [ ] Posts têm thumbnail_url válido
- [ ] engagement_rate calculado corretamente

---

## 5. Variáveis de Ambiente

### 5.1 Produção
- [ ] APIFY_API_TOKEN configurado no painel da hospedagem
- [ ] SUPABASE_SERVICE_ROLE_KEY configurado
- [ ] NEXT_PUBLIC_SUPABASE_URL configurado
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY configurado

---

## Critérios de Aceite

1. ✅ Dashboard mostra badge "Dados Reais" (verde)
2. ✅ Posts exibem thumbnails reais dos posts
3. ✅ Títulos são extraídos das legendas reais
4. ✅ Clique no post abre o Instagram na URL correta
5. ✅ Dados são salvos no Supabase para cache

## Notas

- Cache dura 6 horas (CACHE_DURATION_HOURS = 6)
- Se Apify falhar, usa dados mockados como fallback
- Thumbnails são carregadas lazy
