/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

export const runtime = 'edge';

/**
 * POST /api/knowledge/rag
 * 
 * Realiza busca semântica no knowledge base e retorna contexto relevante.
 * Usado pelos agentes n8n para RAG (Retrieval Augmented Generation).
 * 
 * Body: {
 *   query: string - A pergunta/consulta do usuário
 *   base_types?: string[] - Filtrar por tipos ['ganchos', 'estrategia', 'resumo_executivo']
 *   top_k?: number - Quantidade de resultados (padrão: 5)
 * }
 * 
 * Response: {
 *   results: Array<{
 *     id: string,
 *     base_type: string,
 *     title: string,
 *     content: string,
 *     similarity: number
 *   }>,
 *   context: string - Texto formatado para injetar no prompt do LLM
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar se OpenAI está configurado
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-build') {
      return NextResponse.json(
        { error: 'OpenAI API key não configurada' },
        { status: 503 }
      );
    }

    // Verificar autenticação
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Parse body
    const body = await request.json();
    const { 
      query, 
      base_types = null, 
      top_k = 5 
    } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'query é obrigatória' },
        { status: 400 }
      );
    }

    // Gerar embedding da query usando OpenAI
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Buscar documentos similares usando a função do Supabase
    const { data: results, error } = await supabase.rpc(
      'search_knowledge_base',
      {
        query_embedding: queryEmbedding,
        base_filter: base_types,
        match_count: top_k,
      }
    );

    if (error) {
      console.error('Error searching knowledge base:', error);
      return NextResponse.json(
        { error: 'Erro na busca vetorial' },
        { status: 500 }
      );
    }

    // Formatar contexto para uso no prompt do LLM
    const formattedContext = formatContextForLLM(results || []);

    return NextResponse.json({
      results: results || [],
      context: formattedContext,
      query,
      total_results: results?.length || 0,
    });

  } catch (error) {
    console.error('Error in RAG endpoint:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/knowledge/rag?query=...&base_types=...&top_k=...
 * 
 * Versão GET para facilitar testes e chamadas simples
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar se OpenAI está configurado
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-build') {
      return NextResponse.json(
        { error: 'OpenAI API key não configurada' },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const baseTypesParam = searchParams.get('base_types');
    const topK = parseInt(searchParams.get('top_k') || '5');

    if (!query) {
      return NextResponse.json(
        { error: 'query é obrigatória' },
        { status: 400 }
      );
    }

    const baseTypes = baseTypesParam ? baseTypesParam.split(',') : null;

    // Gerar embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Buscar
    const { data: results, error } = await supabase.rpc(
      'search_knowledge_base',
      {
        query_embedding: queryEmbedding,
        base_filter: baseTypes,
        match_count: topK,
      }
    );

    if (error) {
      console.error('Error:', error);
      return NextResponse.json({ error: 'Erro na busca' }, { status: 500 });
    }

    return NextResponse.json({
      results: results || [],
      context: formatContextForLLM(results || []),
      query,
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

/**
 * Formata os resultados da busca em um contexto útil para o LLM
 */
function formatContextForLLM(results: any[]): string {
  if (results.length === 0) {
    return 'Nenhum documento relevante encontrado na base de conhecimento.';
  }

  const sections = results.map((doc, index) => {
    return `[Documento ${index + 1} - ${doc.base_type}: ${doc.title} (relevância: ${(doc.similarity * 100).toFixed(1)}%)]\n${doc.content}`;
  });

  return `=== CONTEXTO DA BASE DE CONHECIMENTO ===\n\n${sections.join('\n\n---\n\n')}\n\n=== FIM DO CONTEXTO ===`;
}
