import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from './embeddings';

export type KnowledgeBaseType = 'ganchos' | 'estrategia' | 'personas' | 'resumo_executivo';

export interface KnowledgeDocument {
  id: string;
  base_type: KnowledgeBaseType;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

/**
 * Search knowledge base using vector similarity
 */
export async function searchKnowledgeBase(
  query: string,
  baseTypes?: KnowledgeBaseType[],
  matchCount: number = 5
): Promise<KnowledgeDocument[]> {
  const supabase = await createClient();
  
  // Try to use vector search first
  try {
    // Generate embedding for the query
    const embedding = await generateEmbedding(query);
    
    // Check if embedding is valid (not all zeros)
    const isValidEmbedding = embedding.some(v => v !== 0);
    
    if (isValidEmbedding) {
      // Search using the database function
      const { data, error } = await supabase.rpc('search_knowledge_base', {
        query_embedding: embedding,
        base_filter: baseTypes || null,
        match_count: matchCount,
      });
      
      if (!error && data && data.length > 0) {
        return data.map((doc: KnowledgeDocument) => ({
          ...doc,
          similarity: Number(doc.similarity),
        }));
      }
    }
  } catch (e) {
    console.log('Vector search failed, falling back to text search');
  }
  
  // Fallback: simple text search
  let dbQuery = supabase
    .from('knowledge_documents')
    .select('*')
    .limit(matchCount);
  
  if (baseTypes && baseTypes.length > 0) {
    dbQuery = dbQuery.in('base_type', baseTypes);
  }
  
  const { data, error } = await dbQuery;
  
  if (error) {
    console.error('Error searching knowledge base:', error);
    throw new Error('Failed to search knowledge base');
  }
  
  return (data || []).map((doc: any) => ({
    id: doc.id,
    base_type: doc.base_type,
    title: doc.title,
    content: doc.content,
    metadata: doc.metadata,
    similarity: 1,
  }));
}

/**
 * Get context from all 4 knowledge bases for content planning
 */
export async function getContentPlanningContext(
  query: string,
  persona?: string
): Promise<{
  ganchos: KnowledgeDocument[];
  estrategia: KnowledgeDocument[];
  personas: KnowledgeDocument[];
  resumo: KnowledgeDocument[];
}> {
  const [ganchos, estrategia, personas, resumo] = await Promise.all([
    searchKnowledgeBase(query, ['ganchos'], 3),
    searchKnowledgeBase(query, ['estrategia'], 4),
    searchKnowledgeBase(
      persona ? `${query} ${persona}` : query, 
      ['personas'], 
      2
    ),
    searchKnowledgeBase(query, ['resumo_executivo'], 3),
  ]);
  
  return {
    ganchos,
    estrategia,
    personas,
    resumo,
  };
}

/**
 * Format knowledge context for the agent prompt
 */
export function formatKnowledgeContext(context: {
  ganchos: KnowledgeDocument[];
  estrategia: KnowledgeDocument[];
  personas: KnowledgeDocument[];
  resumo: KnowledgeDocument[];
}): string {
  const sections = [];
  
  if (context.ganchos.length > 0) {
    sections.push(`## GANCHOS (hooks validados)
${context.ganchos.map(d => `- ${d.title}: ${d.content}`).join('\n')}`);
  }
  
  if (context.estrategia.length > 0) {
    sections.push(`## ESTRATÉGIA DE CONTEÚDO
${context.estrategia.map(d => `- ${d.title}: ${d.content}`).join('\n')}`);
  }
  
  if (context.personas.length > 0) {
    sections.push(`## PERSONAS
${context.personas.map(d => `- ${d.title}: ${d.content}`).join('\n')}`);
  }
  
  if (context.resumo.length > 0) {
    sections.push(`## RESUMO EXECUTIVO DA AUTEM
${context.resumo.map(d => `- ${d.title}: ${d.content}`).join('\n')}`);
  }
  
  return sections.join('\n\n');
}
