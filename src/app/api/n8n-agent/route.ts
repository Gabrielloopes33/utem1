import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

const N8N_WEBHOOK_URL = 'https://flow.agenciatouch.com.br/webhook/97ab2e1b-12f4-4a2d-b087-be15edfaf000';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { message, sessionId, history = [] } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    console.log('📤 Sending to n8n:', { message: message.substring(0, 50) + '...' });

    // Call n8n webhook with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history,
          userId: user.id,
          sessionId,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      console.log('📥 n8n response status:', n8nResponse.status);

      // Get raw response
      const responseText = await n8nResponse.text();
      console.log('📥 n8n response:', responseText.substring(0, 500));

      if (!n8nResponse.ok) {
        return NextResponse.json(
          { error: `n8n error: ${n8nResponse.status}` },
          { status: 500 }
        );
      }

      // Try to parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        // If not JSON, use raw text
        responseData = { response: responseText };
      }

      const responseContent = responseData.response || 
                              responseData.message || 
                              responseData.content || 
                              responseText ||
                              'Sem resposta do agente';

      return NextResponse.json({
        response: responseContent,
        sessionId: sessionId || null,
      });

    } catch (fetchError) {
      clearTimeout(timeout);
      console.error('Fetch error:', fetchError);
      
      return NextResponse.json(
        { error: 'Erro de conexão com n8n' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in n8n-agent API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
