import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET /api/knowledge/documents?base_type=ganchos
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const baseType = searchParams.get('base_type');

    let query = supabase
      .from('knowledge_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (baseType) {
      query = query.eq('base_type', baseType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json({ error: 'Erro ao buscar documentos' }, { status: 500 });
    }

    // Add has_embedding flag
    const docsWithEmbedding = data.map(doc => ({
      ...doc,
      has_embedding: doc.embedding !== null,
    }));

    return NextResponse.json(docsWithEmbedding);

  } catch (error) {
    console.error('Error in GET /api/knowledge/documents:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST /api/knowledge/documents
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { base_type, title, content, metadata = {} } = body;

    if (!base_type || !title || !content) {
      return NextResponse.json(
        { error: 'base_type, title e content são obrigatórios' },
        { status: 400 }
      );
    }

    // Validate base_type
    const validTypes = ['ganchos', 'estrategia', 'personas', 'resumo_executivo'];
    if (!validTypes.includes(base_type)) {
      return NextResponse.json(
        { error: 'base_type inválido' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('knowledge_documents')
      .insert({
        base_type,
        title,
        content,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
      return NextResponse.json({ error: 'Erro ao criar documento' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/knowledge/documents:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
