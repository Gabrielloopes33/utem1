import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/ai/embeddings';

export const runtime = 'edge';

// POST /api/knowledge/generate-embeddings
export async function POST() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Get all documents without embeddings
    const { data: documents, error: fetchError } = await supabase
      .from('knowledge_documents')
      .select('id, title, content')
      .is('embedding', null);

    if (fetchError) {
      console.error('Error fetching documents:', fetchError);
      return NextResponse.json(
        { error: 'Erro ao buscar documentos' },
        { status: 500 }
      );
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json({
        message: 'Nenhum documento sem embedding encontrado',
        generated: 0,
      });
    }

    // Generate embeddings in batches
    const batchSize = 5;
    let generated = 0;
    const errors: string[] = [];

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (doc) => {
          try {
            const text = `${doc.title}\n\n${doc.content}`;
            const embedding = await generateEmbedding(text);

            const { error: updateError } = await supabase
              .from('knowledge_documents')
              .update({ embedding })
              .eq('id', doc.id);

            if (updateError) {
              errors.push(`Erro ao salvar embedding de ${doc.title}`);
            } else {
              generated++;
            }
          } catch (err) {
            errors.push(`Erro ao gerar embedding de ${doc.title}`);
          }
        })
      );
    }

    return NextResponse.json({
      message: `${generated} embeddings gerados com sucesso`,
      generated,
      total: documents.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error in POST /api/knowledge/generate-embeddings:', error);
    return NextResponse.json(
      { error: 'Erro interno ao gerar embeddings' },
      { status: 500 }
    );
  }
}
