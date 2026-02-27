# Time — AI Workforce Platform

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui (New York)
- Supabase (schema `nexia`, tabelas com prefixo `time_`)
- Vercel AI SDK v6 (multi-provider: Anthropic + OpenAI)
- Lucide React (icons)

## Database
- Projeto Supabase: ydnwqptkrftonunyjzoc
- Schema: `nexia` (compartilhado com licitaia)
- Prefixo: `time_` em todas as tabelas
- RLS obrigatório em todas as tabelas
- IPv6 only — usar SQL Editor para DDL

## Design System v2.0 — Relevance AI style
- Sidebar clara: branca (#FFFFFF) com border-right, seções agrupadas
- Background: surface-bg (#F4F6FB)
- Accent: #5B8DEF
- Fonts: Outfit (display), Source Sans 3 (body), IBM Plex Mono (data)
- Cards: radius 14px, shadow sutil
- Botões: radius 8px
- Modais: radius 20px
- Dashboard: hero dark com search, categorias grid, agentes populares

## Convenções
- Path alias: @/* → ./src/*
- Dev: `npm run dev` (turbopack)
- Git email: contato@anapaulaperci.com
- Pular Playwright tests exceto quando explicitamente pedido
