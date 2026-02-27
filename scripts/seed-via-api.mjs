import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const envFile = readFileSync('.env.local', 'utf-8')
const env = {}
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: 'nexia' }
})

const ORG_ID = 'a0000000-0000-0000-0000-000000000001'

async function seed() {
  // 1. Organization
  const { error: orgErr } = await supabase.from('time_organizations').upsert({
    id: ORG_ID,
    name: 'NexIA Lab',
    slug: 'nexia-lab',
    owner_id: '00000000-0000-0000-0000-000000000000',
  })
  if (orgErr) { console.error('Org error:', orgErr.message); return }
  console.log('✓ Organization created')

  // 2. Squad
  const { data: squad, error: squadErr } = await supabase.from('time_squads').insert({
    org_id: ORG_ID,
    name: 'Estrategia & Copy',
    description: 'Squad especializado em posicionamento de marca, copywriting estrategico e criacao de conteudo persuasivo.',
    icon: '✍️',
    color: '#6C3483',
  }).select('id').single()
  if (squadErr) { console.error('Squad error:', squadErr.message); return }
  console.log('✓ Squad created:', squad.id)

  // 3. Agents
  const agents = [
    {
      name: 'Posicionamento Master',
      description: 'Especialista em analise de mercado e posicionamento de marca. Cria propostas de valor unicas e mapeia diferenciais competitivos.',
      type: 'chat', status: 'active', provider: 'anthropic', model: 'claude-sonnet-4-20250514',
      temperature: 0.7, max_tokens: 4096, trigger_type: 'manual',
      tags: ['estrategia', 'marca', 'posicionamento'],
      system_prompt: `Voce e um estrategista de marca senior com 15 anos de experiencia em posicionamento de mercado. Sua especialidade e analisar mercados, identificar diferenciais competitivos e criar propostas de valor unicas.

Diretrizes:
- Sempre comece entendendo o publico-alvo e o mercado
- Use frameworks como Golden Circle, Blue Ocean Strategy e Jobs to Be Done
- Fale com clareza e objetividade, evitando jargoes desnecessarios
- Apresente insights baseados em dados e tendencias de mercado
- Formate suas respostas com headers, bullet points e destaque os pontos principais`,
    },
    {
      name: 'Copywriter Estrategico',
      description: 'Cria textos persuasivos para campanhas, landing pages, emails e anuncios. Domina gatilhos mentais e storytelling.',
      type: 'task', status: 'active', provider: 'anthropic', model: 'claude-sonnet-4-20250514',
      temperature: 0.8, max_tokens: 4096, trigger_type: 'manual',
      approval_required: true, approval_role: 'admin',
      tags: ['copy', 'persuasao', 'campanha'],
      system_prompt: `Voce e um copywriter estrategico de alto nivel. Especialista em escrita persuasiva, gatilhos mentais e storytelling aplicado a negocios.

Diretrizes:
- Use frameworks como AIDA, PAS, BAB e 4Ps do Copywriting
- Adapte o tom de voz ao briefing recebido
- Sempre inclua headline principal + variacoes
- Destaque CTAs claros e diretos
- Formate as entregas de forma profissional com secoes claras
- Quando receber um briefing, entregue pelo menos 3 variacoes`,
    },
    {
      name: 'Revisor de Tom',
      description: 'Analisa e ajusta o tom de voz de qualquer texto para alinhar com a identidade da marca. Gate de qualidade.',
      type: 'qa_gate', status: 'active', provider: 'anthropic', model: 'claude-sonnet-4-20250514',
      temperature: 0.3, max_tokens: 4096, trigger_type: 'workflow',
      tags: ['revisao', 'tom-de-voz', 'qualidade'],
      system_prompt: `Voce e um especialista em tom de voz e identidade verbal de marca. Seu papel e revisar textos e garantir consistencia com o guia de estilo.

Diretrizes:
- Analise o texto recebido quanto a: tom, formalidade, emocao, clareza e alinhamento com a marca
- De uma nota de 1 a 10 para cada criterio
- Sugira ajustes especificos com exemplos antes/depois
- Se o texto estiver adequado, aprove com comentarios positivos
- Nunca reescreva completamente — faca ajustes cirurgicos
- Use temperatura baixa para ser preciso e consistente`,
    },
    {
      name: 'Content Strategist',
      description: 'Planeja calendarios editoriais, define pilares de conteudo e cria estrategias de distribuicao multi-canal.',
      type: 'planner', status: 'active', provider: 'anthropic', model: 'claude-sonnet-4-20250514',
      temperature: 0.7, max_tokens: 4096, trigger_type: 'scheduled',
      trigger_config: { cron: '0 9 * * 1', description: 'Toda segunda as 9h' },
      tags: ['conteudo', 'planejamento', 'calendario'],
      system_prompt: `Voce e um estrategista de conteudo digital com expertise em marketing multi-canal. Planeja, organiza e distribui conteudo de forma estrategica.

Diretrizes:
- Crie calendarios editoriais mensais com temas, formatos e canais
- Defina pilares de conteudo baseados nos objetivos da marca
- Sugira formatos variados: blog, video, carrossel, stories, newsletter
- Use dados de tendencias para timing de publicacao
- Organize tudo em tabelas claras com datas, responsaveis e metricas
- Considere SEO, engajamento e conversao em cada peca`,
    },
    {
      name: 'Script Master',
      description: 'Especialista em roteiros para video, podcasts e apresentacoes. Cria scripts envolventes com timing perfeito.',
      type: 'task', status: 'active', provider: 'anthropic', model: 'claude-sonnet-4-20250514',
      temperature: 0.8, max_tokens: 8192, trigger_type: 'manual',
      tags: ['roteiro', 'video', 'script'],
      system_prompt: `Voce e um roteirista profissional especializado em conteudo digital. Cria scripts para videos, podcasts, webinars e apresentacoes.

Diretrizes:
- Estruture scripts com: hook (5s), introducao, desenvolvimento, CTA e fechamento
- Inclua marcacoes de tempo e instrucoes de producao
- Use linguagem natural e conversacional
- Adapte o formato ao canal (Reels: 30-60s, YouTube: 8-15min, Podcast: 20-40min)
- Inclua sugestoes de B-roll, graficos e transicoes
- Formate com cabecalho de producao: titulo, duracao, formato, publico`,
    },
  ]

  const roles = ['estrategista', 'copywriter', 'revisor', 'planejador', 'roteirista']

  const agentIds = []
  for (let i = 0; i < agents.length; i++) {
    const { data, error } = await supabase.from('time_agents').insert({
      org_id: ORG_ID,
      squad_id: squad.id,
      ...agents[i],
    }).select('id').single()
    if (error) { console.error(`Agent ${i+1} error:`, error.message); return }
    agentIds.push(data.id)
    console.log(`✓ Agent ${i+1}: ${agents[i].name} (${data.id})`)
  }

  // 4. Squad-Agent links
  const links = agentIds.map((aid, i) => ({
    squad_id: squad.id,
    agent_id: aid,
    role_in_squad: roles[i],
  }))
  const { error: linkErr } = await supabase.from('time_squad_agents').insert(links)
  if (linkErr) { console.error('Squad-Agent link error:', linkErr.message); return }
  console.log('✓ Squad-Agent links created')

  // 5. Workflow
  const { data: wf, error: wfErr } = await supabase.from('time_workflows').insert({
    org_id: ORG_ID,
    name: 'Criacao de Campanha',
    description: 'Fluxo completo: do posicionamento ao roteiro final. Passa por todos os 5 agentes do squad Estrategia & Copy.',
    status: 'active',
    trigger_type: 'manual',
  }).select('id').single()
  if (wfErr) { console.error('Workflow error:', wfErr.message); return }
  console.log('✓ Workflow created:', wf.id)

  // 6. Workflow Steps
  const steps = [
    { step_order: 1, agent_id: agentIds[0], name: 'Analise de Posicionamento', type: 'agent', config: { instruction: 'Analise o briefing e defina posicionamento' } },
    { step_order: 2, agent_id: agentIds[3], name: 'Estrategia de Conteudo', type: 'agent', config: { instruction: 'Crie a estrategia de conteudo baseada no posicionamento' } },
    { step_order: 3, agent_id: agentIds[1], name: 'Criacao de Copy', type: 'agent', config: { instruction: 'Escreva os textos da campanha com base na estrategia' } },
    { step_order: 4, agent_id: agentIds[2], name: 'Revisao de Tom de Voz', type: 'agent', config: { instruction: 'Revise todos os textos quanto ao tom de voz' } },
    { step_order: 5, agent_id: agentIds[4], name: 'Roteiro de Video', type: 'agent', config: { instruction: 'Crie o roteiro de video para a campanha' } },
  ].map(s => ({ ...s, workflow_id: wf.id }))

  const { error: stepsErr } = await supabase.from('time_workflow_steps').insert(steps)
  if (stepsErr) { console.error('Steps error:', stepsErr.message); return }
  console.log('✓ Workflow steps created')

  // 7. Knowledge Base
  const { error: kbErr } = await supabase.from('time_knowledge_bases').insert({
    org_id: ORG_ID,
    name: 'Guia de Marca NexIA',
    description: 'Documento de referencia com tom de voz, paleta de cores, diretrizes de comunicacao e exemplos aprovados.',
  })
  if (kbErr) { console.error('KB error:', kbErr.message); return }
  console.log('✓ Knowledge Base created')

  console.log('\n🎉 Seed completo! 1 org, 1 squad, 5 agents, 1 workflow (5 steps), 1 KB')
}

seed()
