-- =============================================
-- Time — Seed Data
-- Squad "Estrategia & Copy" + 5 Agentes + Workflow
-- Run AFTER schema.sql in Supabase SQL Editor
-- =============================================

-- Use temp org ID (will be replaced when auth is fully wired)
DO $$
DECLARE
  v_org_id uuid := 'a0000000-0000-0000-0000-000000000001';
  v_squad_id uuid;
  v_agent_1 uuid;
  v_agent_2 uuid;
  v_agent_3 uuid;
  v_agent_4 uuid;
  v_agent_5 uuid;
  v_workflow_id uuid;
BEGIN

  -- Create temp organization (if not exists)
  INSERT INTO nexia.time_organizations (id, name, slug, owner_id)
  VALUES (v_org_id, 'NexIA Lab', 'nexia-lab', '00000000-0000-0000-0000-000000000000')
  ON CONFLICT (id) DO NOTHING;

  -- Squad: Estrategia & Copy
  INSERT INTO nexia.time_squads (org_id, name, description, icon, color)
  VALUES (
    v_org_id,
    'Estrategia & Copy',
    'Squad especializado em posicionamento de marca, copywriting estrategico e criacao de conteudo persuasivo.',
    '✍️',
    '#6C3483'
  )
  RETURNING id INTO v_squad_id;

  -- Agent 1: Posicionamento Master
  INSERT INTO nexia.time_agents (
    org_id, name, description, type, status, squad_id,
    provider, model, system_prompt, temperature, max_tokens,
    trigger_type, tags
  ) VALUES (
    v_org_id,
    'Posicionamento Master',
    'Especialista em analise de mercado e posicionamento de marca. Cria propostas de valor unicas e mapeia diferenciais competitivos.',
    'chat',
    'active',
    v_squad_id,
    'anthropic',
    'claude-sonnet-4-20250514',
    'Voce e um estrategista de marca senior com 15 anos de experiencia em posicionamento de mercado. Sua especialidade e analisar mercados, identificar diferenciais competitivos e criar propostas de valor unicas.

Diretrizes:
- Sempre comece entendendo o publico-alvo e o mercado
- Use frameworks como Golden Circle, Blue Ocean Strategy e Jobs to Be Done
- Fale com clareza e objetividade, evitando jargoes desnecessarios
- Apresente insights baseados em dados e tendencias de mercado
- Formate suas respostas com headers, bullet points e destaque os pontos principais',
    0.7,
    4096,
    'manual',
    ARRAY['estrategia', 'marca', 'posicionamento']
  )
  RETURNING id INTO v_agent_1;

  -- Agent 2: Copywriter Estrategico
  INSERT INTO nexia.time_agents (
    org_id, name, description, type, status, squad_id,
    provider, model, system_prompt, temperature, max_tokens,
    trigger_type, approval_required, approval_role, tags
  ) VALUES (
    v_org_id,
    'Copywriter Estrategico',
    'Cria textos persuasivos para campanhas, landing pages, emails e anuncios. Domina gatilhos mentais e storytelling.',
    'task',
    'active',
    v_squad_id,
    'anthropic',
    'claude-sonnet-4-20250514',
    'Voce e um copywriter estrategico de alto nivel. Especialista em escrita persuasiva, gatilhos mentais e storytelling aplicado a negocios.

Diretrizes:
- Use frameworks como AIDA, PAS, BAB e 4Ps do Copywriting
- Adapte o tom de voz ao briefing recebido
- Sempre inclua headline principal + variacoes
- Destaque CTAs claros e diretos
- Formate as entregas de forma profissional com secoes claras
- Quando receber um briefing, entregue pelo menos 3 variacoes',
    0.8,
    4096,
    'manual',
    true,
    'admin',
    ARRAY['copy', 'persuasao', 'campanha']
  )
  RETURNING id INTO v_agent_2;

  -- Agent 3: Revisor de Tom
  INSERT INTO nexia.time_agents (
    org_id, name, description, type, status, squad_id,
    provider, model, system_prompt, temperature, max_tokens,
    trigger_type, tags
  ) VALUES (
    v_org_id,
    'Revisor de Tom',
    'Analisa e ajusta o tom de voz de qualquer texto para alinhar com a identidade da marca. Gate de qualidade.',
    'qa_gate',
    'active',
    v_squad_id,
    'anthropic',
    'claude-sonnet-4-20250514',
    'Voce e um especialista em tom de voz e identidade verbal de marca. Seu papel e revisar textos e garantir consistencia com o guia de estilo.

Diretrizes:
- Analise o texto recebido quanto a: tom, formalidade, emocao, clareza e alinhamento com a marca
- De uma nota de 1 a 10 para cada criterio
- Sugira ajustes especificos com exemplos antes/depois
- Se o texto estiver adequado, aprove com comentarios positivos
- Nunca reescreva completamente — faca ajustes cirurgicos
- Use temperatura baixa para ser preciso e consistente',
    0.3,
    4096,
    'workflow',
    ARRAY['revisao', 'tom-de-voz', 'qualidade']
  )
  RETURNING id INTO v_agent_3;

  -- Agent 4: Content Strategist
  INSERT INTO nexia.time_agents (
    org_id, name, description, type, status, squad_id,
    provider, model, system_prompt, temperature, max_tokens,
    trigger_type, trigger_config, tags
  ) VALUES (
    v_org_id,
    'Content Strategist',
    'Planeja calendarios editoriais, define pilares de conteudo e cria estrategias de distribuicao multi-canal.',
    'planner',
    'active',
    v_squad_id,
    'anthropic',
    'claude-sonnet-4-20250514',
    'Voce e um estrategista de conteudo digital com expertise em marketing multi-canal. Planeja, organiza e distribui conteudo de forma estrategica.

Diretrizes:
- Crie calendarios editoriais mensais com temas, formatos e canais
- Defina pilares de conteudo baseados nos objetivos da marca
- Sugira formatos variados: blog, video, carrossel, stories, newsletter
- Use dados de tendencias para timing de publicacao
- Organize tudo em tabelas claras com datas, responsaveis e metricas
- Considere SEO, engajamento e conversao em cada peca',
    0.7,
    4096,
    'scheduled',
    '{"cron": "0 9 * * 1", "description": "Toda segunda as 9h"}',
    ARRAY['conteudo', 'planejamento', 'calendario']
  )
  RETURNING id INTO v_agent_4;

  -- Agent 5: Script Master
  INSERT INTO nexia.time_agents (
    org_id, name, description, type, status, squad_id,
    provider, model, system_prompt, temperature, max_tokens,
    trigger_type, tags
  ) VALUES (
    v_org_id,
    'Script Master',
    'Especialista em roteiros para video, podcasts e apresentacoes. Cria scripts envolventes com timing perfeito.',
    'task',
    'active',
    v_squad_id,
    'anthropic',
    'claude-sonnet-4-20250514',
    'Voce e um roteirista profissional especializado em conteudo digital. Cria scripts para videos, podcasts, webinars e apresentacoes.

Diretrizes:
- Estruture scripts com: hook (5s), introducao, desenvolvimento, CTA e fechamento
- Inclua marcacoes de tempo e instrucoes de producao
- Use linguagem natural e conversacional
- Adapte o formato ao canal (Reels: 30-60s, YouTube: 8-15min, Podcast: 20-40min)
- Inclua sugestoes de B-roll, graficos e transicoes
- Formate com cabecalho de producao: titulo, duracao, formato, publico',
    0.8,
    8192,
    'manual',
    ARRAY['roteiro', 'video', 'script']
  )
  RETURNING id INTO v_agent_5;

  -- Link agents to squad (time_squad_agents)
  INSERT INTO nexia.time_squad_agents (squad_id, agent_id, role_in_squad) VALUES
    (v_squad_id, v_agent_1, 'estrategista'),
    (v_squad_id, v_agent_2, 'copywriter'),
    (v_squad_id, v_agent_3, 'revisor'),
    (v_squad_id, v_agent_4, 'planejador'),
    (v_squad_id, v_agent_5, 'roteirista');

  -- Workflow: Criacao de Campanha
  INSERT INTO nexia.time_workflows (org_id, name, description, status, trigger_type)
  VALUES (
    v_org_id,
    'Criacao de Campanha',
    'Fluxo completo: do posicionamento ao roteiro final. Passa por todos os 5 agentes do squad Estrategia & Copy.',
    'active',
    'manual'
  )
  RETURNING id INTO v_workflow_id;

  -- Workflow Steps
  INSERT INTO nexia.time_workflow_steps (workflow_id, agent_id, step_order, name, type, config) VALUES
    (v_workflow_id, v_agent_1, 1, 'Analise de Posicionamento',   'agent', '{"instruction": "Analise o briefing e defina posicionamento"}'),
    (v_workflow_id, v_agent_4, 2, 'Estrategia de Conteudo',      'agent', '{"instruction": "Crie a estrategia de conteudo baseada no posicionamento"}'),
    (v_workflow_id, v_agent_2, 3, 'Criacao de Copy',             'agent', '{"instruction": "Escreva os textos da campanha com base na estrategia"}'),
    (v_workflow_id, v_agent_3, 4, 'Revisao de Tom de Voz',       'agent', '{"instruction": "Revise todos os textos quanto ao tom de voz"}'),
    (v_workflow_id, v_agent_5, 5, 'Roteiro de Video',            'agent', '{"instruction": "Crie o roteiro de video para a campanha"}');

  -- Knowledge Base: Guia de Marca
  INSERT INTO nexia.time_knowledge_bases (org_id, name, description)
  VALUES (
    v_org_id,
    'Guia de Marca NexIA',
    'Documento de referencia com tom de voz, paleta de cores, diretrizes de comunicacao e exemplos aprovados.'
  );

  RAISE NOTICE 'Seed completed! Squad: %, Agents: 5, Workflow: 1', v_squad_id;

END $$;
