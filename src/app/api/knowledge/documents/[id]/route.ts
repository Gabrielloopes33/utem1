import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

// PUT /api/knowledge/documents/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, metadata } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'title e content são obrigatórios' },
        { status: 400 }
      );
    }

    // Reset embedding when content changes (will be regenerated)
    const { data, error } = await supabase
      .from('knowledge_documents')
      .update({
        title,
        content,
        metadata,
        embedding: null, // Reset embedding
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating document:', error);
      return NextResponse.json({ error: 'Erro ao atualizar documento' }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in PUT /api/knowledge/documents/[id]:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE /api/knowledge/documents/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { error } = await supabase
      .from('knowledge_documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document:', error);
      return NextResponse.json({ error: 'Erro ao deletar documento' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/knowledge/documents/[id]:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
