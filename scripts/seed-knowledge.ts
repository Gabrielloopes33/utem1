#!/usr/bin/env node
/**
 * Script to seed knowledge base documents into Supabase
 * Run with: npx tsx scripts/seed-knowledge.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Knowledge base data with detailed personas
const knowledgeData = {
  ganchos: [
    {
      title: 'Gancho: Perda de dinheiro',
      content: 'Você já perdeu dinheiro sem saber por quê? Descubra o erro silencioso que está dilapidando seu patrimônio.',
      metadata: { tipo: 'medo', canal: 'instagram', intencao: 'parada' }
    },
    {
      title: 'Gancho: Inflação',
      content: 'A inflação está comendo seu dinheiro e você nem percebeu. Veja o cálculo assustador.',
      metadata: { tipo: 'medo', canal: 'instagram', intencao: 'educacao' }
    },
    {
      title: 'Gancho: Primeiro milhão',
      content: 'Como chegar ao primeiro milhão sem ser herdeiro: o passo a passo que ninguém te conta.',
      metadata: { tipo: 'desejo', canal: 'instagram', intencao: 'inspiracao' }
    },
    {
      title: 'Gancho: Aposentadoria',
      content: 'Sua aposentadoria do INSS vai dar quanto? A resposta pode te assustar.',
      metadata: { tipo: 'medo', canal: 'instagram', intencao: 'parada' }
    },
    {
      title: 'Gancho: Independência financeira',
      content: 'O dia que parei de depender do salário: como construir renda passiva de verdade.',
      metadata: { tipo: 'desejo', canal: 'instagram', intencao: 'inspiracao' }
    },
    {
      title: 'Gancho: Erros comuns',
      content: '3 erros que todo iniciante comete no primeiro investimento (e como evitar).',
      metadata: { tipo: 'curiosidade', canal: 'instagram', intencao: 'educacao' }
    },
    {
      title: 'Gancho: Reserva de emergência',
      content: 'Por que sua reserva de emergência está no lugar errado (e isso está te custando dinheiro).',
      metadata: { tipo: 'curiosidade', canal: 'instagram', intencao: 'educacao' }
    },
    {
      title: 'Gancho: Imposto de renda',
      content: 'Você está pagando mais imposto do que deveria? Descubra em 1 minuto.',
      metadata: { tipo: 'curiosidade', canal: 'instagram', intencao: 'utilidade' }
    },
    {
      title: 'Gancho: Diversificação',
      content: 'Não coloque todos os ovos na mesma cesta: o que significa diversificar na prática.',
      metadata: { tipo: 'educacao', canal: 'instagram', intencao: 'educacao' }
    },
    {
      title: 'Gancho: Tesouro Direto vs CDB',
      content: 'Tesouro Direto ou CDB: onde seu dinheiro rende mais? A resposta vai surpreender.',
      metadata: { tipo: 'comparacao', canal: 'instagram', intencao: 'utilidade' }
    },
    {
      title: 'Gancho: Planejamento financeiro',
      content: 'Como organizar suas finanças em 2025: o guia que você precisava no começo do ano.',
      metadata: { tipo: 'utilidade', canal: 'instagram', intencao: 'utilidade' }
    },
    {
      title: 'Gancho: Dívidas',
      content: 'Pagar dívidas ou investir? A matemática que vai mudar sua decisão.',
      metadata: { tipo: 'dilema', canal: 'instagram', intencao: 'educacao' }
    },
  ],
  estrategia: [
    {
      title: 'Princípio: Funil de conteúdo',
      content: 'Todo conteúdo deve ter funil claro: ATRAÇÃO (trazer novo público) → NUTRIÇÃO (educar e aquecer) → CONVERSÃO (transformar em cliente). Nunca crie conteúdo sem saber em qual etapa ele atua.',
      metadata: { categoria: 'framework' }
    },
    {
      title: 'Princípio: Persona-first',
      content: 'Antes de criar qualquer conteúdo, defina: qual persona? Fernanda (conservadora), Ricardo (premium), Camila (iniciante) ou Leandro (empresário)? Cada uma tem dores, gatilhos e canais diferentes.',
      metadata: { categoria: 'framework' }
    },
    {
      title: 'Princípio: Mix de conteúdo',
      content: 'Bloco ideal de 7 pautas: 3-4 técnicos (atração), 2 emocionais (conexão), 1-2 conversão (autoridade/prova). Nunca bloco 100% do mesmo tipo.',
      metadata: { categoria: 'framework' }
    },
    {
      title: 'Princípio: Sequência narrativa',
      content: 'Conteúdo deve contar uma história em sequência. Pauta 1: problema. Pauta 2: agitação. Pauta 3: solução. Pauta 4: prova. Pauta 5: oferta.',
      metadata: { categoria: 'framework' }
    },
    {
      title: 'Princípio: Tom Aurora',
      content: 'Tom de voz da Autem: simples sem ser simplista, didático sem ser condescendente, técnico sem ser hermético. Sem alarmismo, sem clickbait, sem promessas milagrosas.',
      metadata: { categoria: 'tom' }
    },
    {
      title: 'Princípio: Estrutura de títulos',
      content: 'Padrões de título que funcionam: "Como...", "Passo a passo para...", "Descubra...", "Vale a pena?", "X estratégias para...", "O erro que...", "Por que..."',
      metadata: { categoria: 'tom' }
    },
    {
      title: 'Princípio: CTA claro',
      content: 'Toda pauta precisa de CTA (call-to-action) específico. Exemplos: "Salve para ler depois", "Comente SE", "Clique no link da bio", "Entre no Telegram", "Agende uma reunião".',
      metadata: { categoria: 'framework' }
    },
    {
      title: 'Princípio: Prova social',
      content: 'Use prova social em 20% do conteúdo: depoimentos, cases, UGC, antes e depois. Mostre resultados reais de clientes reais.',
      metadata: { categoria: 'tatica' }
    },
    {
      title: 'Princípio: Quebra de objeção',
      content: 'Mapeie objeções de cada persona e crie conteúdo específico para cada: "É arriscado" → conteúdo de segurança. "É caro" → conteúdo de valor. "É complexo" → conteúdo de simplificação.',
      metadata: { categoria: 'tatica' }
    },
    {
      title: 'Princípio: Autoridade técnica',
      content: 'Reforce autoridade com dados, certificações, parcerias, anos de mercado, volume sob gestão. Não diga "somos bons", mostre números.',
      metadata: { categoria: 'tatica' }
    },
    {
      title: 'Formato: Carrossel',
      content: 'Carrossel: 5-10 slides, primeiro slide é o gancho, último é CTA. Use pouco texto por slide, destaque visual, storytelling sequencial.',
      metadata: { categoria: 'formato', canal: 'instagram' }
    },
    {
      title: 'Formato: Reels',
      content: 'Reels: 30-60 segundos, hook nos primeiros 3 segundos, valor no meio, CTA no final. Legendas grandes, áudio trending (opcional), ritmo rápido.',
      metadata: { categoria: 'formato', canal: 'instagram' }
    },
    {
      title: 'Formato: Email',
      content: 'Email: assunto que gera curiosidade (não clickbait), primeira linha personalizada, corpo curto (150-300 palavras), CTA único e claro, PS estratégico.',
      metadata: { categoria: 'formato', canal: 'email' }
    },
  ],
  personas: [
    {
      title: 'Persona: Fernanda — A investidora cautelosa',
      content: `Fernanda, 38 anos, servidora pública em Brasília/DF. Renda: R$ 12.000. Perfil de risco: Conservador. Formação: Superior completo. Papel na compra: Decisora.

Vida pessoal: Busca segurança e previsibilidade nos investimentos.

Situação financeira: Perfil conservador, pouca experiência com investimentos, mas possui algum dinheiro guardado.

Desejos:
- Fazer o dinheiro render mais
- Ter segurança para investir
- Método claro e estruturado
- Acompanhamento e suporte
- Acesso a conteúdo confiável e atualizado
- Transformação financeira a longo prazo

Preocupações:
- Medo de perder dinheiro
- Insegurança sobre escolher os produtos certos
- Desconfiança de promessas "boas demais"
- Falta de tempo para estudar o mercado
- Receio de burocracia e complexidade nas plataformas

Pensa/sente:
- "Meu dinheiro não pode ficar parado"
- "Não quero fazer algo errado"
- "Preciso de alguém que explique de forma simples"

Fala/faz:
- Pesquisa sobre investimentos, mas raramente aplica sem certeza
- Prefere segurança a grandes retornos
- Busca orientação profissional

Ganhos:
- Ter um plano claro para a aposentadoria
- Garantir segurança para a família
- Investir com tranquilidade
- Alcançar autonomia financeira sem risco excessivo

Dores:
- Medo de perder dinheiro por falta de estratégia
- Não conseguir atingir independência financeira

Canais: Instagram, conteúdo educativo, indicações de especialistas.

Barreira de compra: Medo de não conseguir aplicar sozinha.

Gatilhos mentais: Segurança, simplicidade, autoridade, educação, transparência.`,
      metadata: { nome: 'Fernanda', perfil: 'conservador', idade: 38, profissao: 'servidora publica', renda: 12000, local: 'Brasilia/DF' }
    },
    {
      title: 'Persona: Ricardo — O investidor premium',
      content: `Ricardo, 54 anos, empresário em Curitiba/PR. Renda: R$ 60.000. Perfil de risco: Sofisticado. Formação: Superior completo, pós-graduação. Papel na compra: Decisor.

Vida pessoal: Já possui experiência com investimentos e valoriza atendimento personalizado.

Situação financeira: Perfil sofisticado, já investe em renda fixa, fundos e imóveis.

Desejos:
- Consolidar patrimônio
- Acessar produtos exclusivos
- Ter atendimento premium e personalizado
- Planejar sucessão familiar
- Internacionalizar parte do patrimônio com segurança
- Ter relatórios estratégicos de alto nível

Preocupações:
- Falta de tempo para gerenciar investimentos
- Necessidade de soluções fiscais eficientes
- Busca por atendimento exclusivo
- Desconfiança de assessores que "vendem produtos"
- Dificuldade de ter visão global do patrimônio

Pensa/sente:
- "Preciso de soluções exclusivas"
- "Meu tempo é valioso"
- "Quero alguém que entenda meu momento de vida"

Fala/faz:
- Busca atendimento diferenciado
- Valoriza relacionamentos de longo prazo
- Investe em soluções premium

Ganhos:
- Atendimento exclusivo e personalizado
- Soluções fiscais eficientes
- Planejamento patrimonial estruturado
- Acesso a produtos internacionais

Dores:
- Falta de tempo para acompanhar investimentos
- Necessidade de eficiência tributária
- Desejo por atendimento premium

Canais: Relatórios especializados, indicações de outros empresários, LinkedIn.

Barreira de compra: Desconfiança em atendimento padronizado.

Gatilhos mentais: Exclusividade, status, expertise, resultados comprovados.`,
      metadata: { nome: 'Ricardo', perfil: 'premium', idade: 54, profissao: 'empresario', renda: 60000, local: 'Curitiba/PR' }
    },
    {
      title: 'Persona: Camila — A iniciante',
      content: `Camila, 29 anos, analista de marketing em São Paulo/SP. Renda: R$ 7.500. Perfil de risco: Moderado. Formação: Superior em Marketing. Papel na compra: Decisora.

Vida pessoal: Interessada em aprender sobre investimentos e começar com valores baixos.

Situação financeira: Perfil moderado, iniciante em investimentos, consome conteúdo financeiro em redes sociais.

Desejos:
- Começar a investir de forma segura
- Ter apoio passo a passo
- Montar uma reserva de emergência
- Aprender a criar hábito de aporte
- Alcançar independência financeira no futuro

Preocupações:
- Medo de começar errado
- Falta de confiança em bancos tradicionais
- Confusão com excesso de informação
- Dificuldade para saber em qual produto investir primeiro
- Senso de que investir é "complicado"

Pensa/sente:
- "Preciso começar mas não sei como"
- "Investimento parece complicado"
- "Quero aprender fazendo"

Fala/faz:
- Consome muito conteúdo sobre finanças
- Pesquisa sobre investimentos para iniciantes
- Busca orientação simples e didática

Ganhos:
- Começar a investir com segurança
- Ter um plano financeiro claro
- Sentir-se confiante com as escolhas
- Ver o dinheiro crescer gradualmente

Dores:
- Medo de fazer escolhas erradas
- Sensação de que precisa de muito dinheiro para começar

Canais: Instagram, YouTube, blogs sobre finanças.

Barreira de compra: Insegurança sobre ter pouco dinheiro para investir.

Gatilhos mentais: Simplicidade, educação, segurança, passo a passo.`,
      metadata: { nome: 'Camila', perfil: 'iniciante', idade: 29, profissao: 'analista de marketing', renda: 7500, local: 'Sao Paulo/SP' }
    },
    {
      title: 'Persona: Leandro — O empresário estratégico',
      content: `Leandro, 38 anos, dono de franquia em Recife/PE. Renda: R$ 25.000. Perfil de risco: Estratégico. Formação: Superior em Administração. Papel na compra: Decisor.

Vida pessoal: Busca melhor eficiência fiscal e quer transformar lucro da empresa em patrimônio pessoal.

Situação financeira: Perfil moderado a sofisticado, precisa organizar finanças pessoais e empresariais.

Desejos:
- Reduzir impacto fiscal
- Organizar patrimônio pessoal e empresarial
- Criar fluxo de aporte consistente
- Garantir crescimento sustentável
- Alcançar independência financeira para a família

Preocupações:
- Alta carga tributária
- Dificuldade para separar finanças pessoais das da empresa
- Falta de tempo para gerenciar investimentos
- Insegurança sobre qual estratégia se adequa ao seu perfil

Pensa/sente:
- "Preciso organizar melhor meu patrimônio"
- "Minha empresa pode me ajudar a investir melhor"
- "Tempo é meu recurso mais escasso"

Fala/faz:
- Busca soluções práticas e eficientes
- Valoriza planejamento estruturado
- Quer integrar finanças pessoais e empresariais

Ganhos:
- Maior eficiência fiscal
- Patrimônio organizado e estruturado
- Tranquilidade para focar no negócio
- Segurança financeira familiar

Dores:
- Falta de tempo para acompanhar investimentos
- Complexidade tributária
- Dificuldade em separar finanças pessoais e empresariais

Canais: LinkedIn, indicações de outros empresários, conteúdo especializado.

Barreira de compra: Falta de tempo e necessidade de soluções práticas.

Gatilhos mentais: Praticidade, eficiência, resultados, planejamento estratégico.`,
      metadata: { nome: 'Leandro', perfil: 'empresario', idade: 38, profissao: 'dono de franquia', renda: 25000, local: 'Recife/PE' }
    },
  ],
  resumo_executivo: [
    {
      title: 'Posicionamento da Autem',
      content: 'Autem Investimentos: gestora de investimentos focada em planejamento financeiro completo. Posicionamento: parceira de longo prazo, não vendedora de produto. Diferencial: técnica sólida + atendimento humanizado. Não somos: casa de análise, corretora, gestora de fundos exclusivos (mas temos parcerias).',
      metadata: { categoria: 'posicionamento' }
    },
    {
      title: 'Tom de Voz Aurora',
      content: 'Tom de voz "Aurora": como o amanhecer - clareza, renovação, esperança concreta. Características: clareza (sem jargão), confiança (sem arrogância), proximidade (sem informalidade demais), propósito (sempre mostrar o porquê).',
      metadata: { categoria: 'tom' }
    },
    {
      title: 'Golden Circle',
      content: 'WHY: Democratizar o acesso a investimentos de qualidade. HOW: Educação financeira + planejamento personalizado + gestão técnica. WHAT: Assessoria de investimentos completa, do primeiro real ao patrimônio estruturado.',
      metadata: { categoria: 'estrategia' }
    },
    {
      title: 'Pilares da Marca',
      content: '1. Educação antes de venda (ensinar para empoderar). 2. Transparência total (custo, risco, retorno realista). 3. Personalização (não existe cliente igual). 4. Longo prazo (construção de legado, não especulação). 5. Excelência técnica (certificações, análise, due diligence).',
      metadata: { categoria: 'valores' }
    },
    {
      title: 'Essência da Marca',
      content: 'Autem = Autonomia + Sistema. Acreditamos que liberdade financeira vem de sistemas, não de sorte. Nossa missão: dar aos clientes o sistema para construir autonomia.',
      metadata: { categoria: 'essencia' }
    },
    {
      title: 'Produtos e Serviços',
      content: 'Carteira administrada: gestão completa do patrimônio. Planejamento financeiro: planejamento sucessório, aposentadoria, objetivos. Consultoria: análise pontual, segunda opinião. Curso Autem: educação financeira para iniciantes. Comunidade Telegram: conteúdo diário, networking.',
      metadata: { categoria: 'produtos' }
    },
    {
      title: 'Estratégia de Conteúdo',
      content: 'Objetivo: posicionar como referência em investimentos acessíveis. Público: dos iniciantes (Camila) aos sofisticados (Ricardo). Canais: Instagram (visibilidade), Email (nutrição), Telegram (comunidade). Métricas: não só likes, mas leads qualificados e conversões.',
      metadata: { categoria: 'estrategia' }
    },
    {
      title: 'Restrições de Comunicação',
      content: 'NUNCA prometer retorno específico. NUNCA criticar concorrentes diretamente. NUNCA usar medo como principal gatilho. NUNCA linguagem de "esquema" ou "golpe". SEMPRE ressalvar que investimentos têm riscos. SEMPRE observar regulação CVM.',
      metadata: { categoria: 'compliance' }
    },
  ],
};

async function seedKnowledgeBase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing environment variables');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🌱 Seeding knowledge base...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  const { error: clearError } = await supabase
    .from('knowledge_documents')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (clearError) {
    console.error('Error clearing data:', clearError);
  } else {
    console.log('✅ Existing data cleared\n');
  }

  // Insert data for each base type
  for (const [baseType, documents] of Object.entries(knowledgeData)) {
    console.log(`📚 Inserting ${baseType}...`);
    
    for (const doc of documents) {
      const { error } = await supabase
        .from('knowledge_documents')
        .insert({
          base_type: baseType,
          title: doc.title,
          content: doc.content,
          metadata: doc.metadata,
        });

      if (error) {
        console.error(`  ❌ Error inserting "${doc.title}":`, error.message);
      } else {
        console.log(`  ✅ ${doc.title.substring(0, 60)}...`);
      }
    }
    console.log('');
  }

  console.log('🎉 Knowledge base seeded successfully!');
  console.log('\nNext steps:');
  console.log('1. Run the migration to enable pgvector: npx supabase db push');
  console.log('2. Generate embeddings for all documents: npm run db:embeddings');
}

seedKnowledgeBase().catch(console.error);
