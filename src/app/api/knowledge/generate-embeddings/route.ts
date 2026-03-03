import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

export const runtime = 'edge';

/**
 * POST /api/knowledge/generate-embeddings
 * 
 * Gera embeddings para documentos que ainda não possuem.
 * Pode ser chamado para documentos específicos ou para todos pendentes.
 * 
 * Body: {
 *   document_ids?: string[] - IDs específicos para processar (opcional)
 *   base_type?: string - Processar todos de um tipo (opcional)
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

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { document_ids, base_type } = body;

    // Buscar documentos sem embedding
    let query = supabase
      .from('knowledge_documents')
      .select('id, title, content, base_type')
      .is('embedding', null);

    if (document_ids && document_ids.length > 0) {
      query = query.in('id', document_ids);
    }

    if (base_type) {
      query = query.eq('base_type', base_type);
    }

    const { data: documents, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching documents:', fetchError);
      return NextResponse.json(
        { error: 'Erro ao buscar documentos' },
        { status: 500 }
      );
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json({
        message: 'Nenhum documento pendente de embedding',
        generated: 0,
      });
    }

    // Gerar embeddings em batch
    const generated = [];
    const batchSize = 20; // OpenAI suporta até 2048 por request, mas vamos ser conservadores

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch.map(doc => doc.content),
      });

      // Atualizar cada documento com seu embedding
      for (let j = 0; j < batch.length; j++) {
        const doc = batch[j];
        const embedding = embeddingResponse.data[j].embedding;

        const { error: updateError } = await supabase
          .from('knowledge_documents')
          .update({ embedding })
          .eq('id', doc.id);

        if (updateError) {
          console.error(`Error updating document ${doc.id}:`, updateError);
        } else {
          generated.push(doc.id);
        }
      }
    }

    return NextResponse.json({
      message: `${generated.length} embeddings gerados com sucesso`,
      generated: generated.length,
      document_ids: generated,
    });

  } catch (error) {
    console.error('Error generating embeddings:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar embeddings' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/knowledge/generate-embeddings
 * 
 * Gera embeddings para todos os documentos pendentes
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
    const baseType = searchParams.get('base_type');

    // Buscar documentos sem embedding
    let query = supabase
      .from('knowledge_documents')
      .select('id, title, content, base_type')
      .is('embedding', null);

    if (baseType) {
      query = query.eq('base_type', baseType);
    }

    const { data: documents, error: fetchError } = await query;

    if (fetchError) {
      return NextResponse.json({ error: 'Erro ao buscar documentos' }, { status: 500 });
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json({
        message: 'Nenhum documento pendente',
        generated: 0,
      });
    }

    // Gerar embeddings
    const generated = [];
    const batchSize = 20;

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch.map(doc => doc.content),
      });

      for (let j = 0; j < batch.length; j++) {
        const doc = batch[j];
        const embedding = embeddingResponse.data[j].embedding;

        const { error: updateError } = await supabase
          .from('knowledge_documents')
          .update({ embedding })
          .eq('id', doc.id);

        if (!updateError) {
          generated.push(doc.id);
        }
      }
    }

    return NextResponse.json({
      message: `${generated.length} embeddings gerados`,
      generated: generated.length,
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
