import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { 
  getContentPlanningContext, 
  formatKnowledgeContext 
} from '@/lib/ai/knowledge-base';
import { 
  buildAgentPrompt, 
  extractContentParams, 
  checkMissingInfo 
} from '@/lib/ai/agent-prompts';

export const runtime = 'edge';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  sessionId?: string;
  history?: ChatMessage[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: RequestBody = await request.json();
    const { message, sessionId, history = [] } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    // Extract parameters from user message
    const params = extractContentParams(message);
    const missing = checkMissingInfo(params);

    // Get or create chat session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          context: { initial_params: params }
        })
        .select('id')
        .single();
      
      if (sessionError) {
        console.error('Error creating session:', sessionError);
      } else {
        currentSessionId = session.id;
      }
    }

    // Save user message
    if (currentSessionId) {
      await supabase.from('chat_messages').insert({
        session_id: currentSessionId,
        role: 'user',
        content: message,
        metadata: { extracted_params: params }
      });
    }

    // Get knowledge context from RAG
    let knowledgeContext: string;
    try {
      const context = await getContentPlanningContext(
        message,
        params.persona
      );
      knowledgeContext = formatKnowledgeContext(context);
    } catch (error) {
      console.error('Error getting knowledge context:', error);
      // Fallback to minimal context if RAG fails
      knowledgeContext = 'Bases de conhecimento temporariamente indisponíveis. Procedendo com conhecimento geral.';
    }

    // Build the complete prompt
    const systemPrompt = buildAgentPrompt(message, knowledgeContext, history);

    // Stream the response using OpenAI via Vercel AI SDK
    const result = streamText({
      model: openai('gpt-4o-mini'), // ou 'gpt-4o' se quiser mais qualidade
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.slice(-5),
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      async onFinish({ text }) {
        // Save assistant message after streaming completes
        if (currentSessionId && text) {
          await supabase.from('chat_messages').insert({
            session_id: currentSessionId,
            role: 'assistant',
            content: text,
            metadata: {}
          });
        }
      },
    });

    // Return streaming response
    return result.toTextStreamResponse({
      headers: {
        'X-Session-Id': currentSessionId || '',
      },
    });

  } catch (error) {
    console.error('Error in agent API:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Endpoint to save the completed assistant message
 * (Called by client after streaming completes - now handled in stream)
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { sessionId, content, metadata = {} } = await request.json();

    if (!sessionId || !content) {
      return NextResponse.json(
        { error: 'SessionId e content são obrigatórios' },
        { status: 400 }
      );
    }

    // Verify session belongs to user
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    // Save assistant message
    const { error } = await supabase.from('chat_messages').insert({
      session_id: sessionId,
      role: 'assistant',
      content,
      metadata
    });

    if (error) {
      console.error('Error saving message:', error);
      return NextResponse.json(
        { error: 'Erro ao salvar mensagem' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
