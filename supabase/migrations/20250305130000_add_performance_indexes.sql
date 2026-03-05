-- Migration: Performance Indexes for TIME Platform
-- Created: 2025-03-05
-- Description: Adds critical indexes for query optimization
-- Note: Using CONCURRENTLY to avoid table locks during creation

-- ============================================
-- KNOWLEDGE BASE INDEXES
-- ============================================

-- Index for fetching ready documents by knowledge base (N+1 elimination)
-- Used in: api/chat/route.ts - getCachedKnowledgeContext
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_docs_kb_status 
  ON public.time_knowledge_docs(kb_id, status) 
  WHERE status = 'ready';

COMMENT ON INDEX public.idx_knowledge_docs_kb_status IS 
  'Optimizes knowledge base document retrieval for AI chat context';

-- Index for similarity search (if embedding column exists)
-- Note: Only create if the embedding column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_knowledge_docs' 
    AND column_name = 'embedding'
  ) THEN
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_knowledge_docs_embedding 
      ON public.time_knowledge_docs 
      USING ivfflat (embedding vector_cosine_ops);
    
    COMMENT ON INDEX public.idx_knowledge_docs_embedding IS 
      'Enables vector similarity search for knowledge base RAG';
  END IF;
END $$;

-- ============================================
-- COMPETITOR ANALYSIS INDEXES
-- ============================================

-- Index for fetching competitor posts ordered by timestamp
-- Used in: api/concorrentes/metrics/route.ts - top posts query
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_competitor_posts_competitor_timestamp 
  ON public.competitor_posts(competitor_id, timestamp DESC);

COMMENT ON INDEX public.idx_competitor_posts_competitor_timestamp IS 
  'Optimizes competitor posts retrieval ordered by engagement recency';

-- Index for competitor data lookups by handle
-- Used in: getCachedCompetitorData
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_competitor_data_handle 
  ON public.competitor_data(handle);

COMMENT ON INDEX public.idx_competitor_data_handle IS 
  'Fast lookup for competitor data by Instagram handle';

-- Composite index for engagement rate queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_competitor_posts_engagement 
  ON public.competitor_posts(competitor_id, engagement_rate DESC)
  WHERE engagement_rate IS NOT NULL;

COMMENT ON INDEX public.idx_competitor_posts_engagement IS 
  'Optimizes top performing posts queries for competitor analysis';

-- ============================================
-- CAMPAIGN INDEXES
-- ============================================

-- Index for user campaigns ordered by creation date
-- Used in: dashboard, campaign lists
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_user_created 
  ON public.campaigns(user_id, created_at DESC);

COMMENT ON INDEX public.idx_campaigns_user_created IS 
  'Optimizes campaign listing queries ordered by creation date';

-- Index for active campaigns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_campaigns_status 
  ON public.campaigns(status) 
  WHERE status = 'active';

COMMENT ON INDEX public.idx_campaigns_status IS 
  'Fast count of active campaigns for dashboard metrics';

-- ============================================
-- AGENT INDEXES
-- ============================================

-- Index for agent knowledge links
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_knowledge_agent_kb 
  ON public.time_agent_knowledge(agent_id, kb_id);

COMMENT ON INDEX public.idx_agent_knowledge_agent_kb IS 
  'Optimizes agent knowledge base relationship lookups';

-- Index for agent list with status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_agents_status 
  ON public.time_agents(status, name);

COMMENT ON INDEX public.idx_time_agents_status IS 
  'Optimizes agent listing with status filter';

-- ============================================
-- ACTIVITY & ANALYTICS INDEXES
-- ============================================

-- Index for recent activities
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_activities_created 
  ON public.time_activities(created_at DESC);

COMMENT ON INDEX public.idx_time_activities_created IS 
  'Optimizes recent activity feed queries';

-- Index for activities by type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_activities_type_created 
  ON public.time_activities(type, created_at DESC);

COMMENT ON INDEX public.idx_time_activities_type_created IS 
  'Optimizes filtered activity feeds by type';

-- ============================================
-- POST & CONTENT INDEXES
-- ============================================

-- Index for posts by media type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_competitor_posts_media_type 
  ON public.competitor_posts(media_type, created_at DESC);

COMMENT ON INDEX public.idx_competitor_posts_media_type IS 
  'Optimizes content performance analysis by media type';

-- Index for sentiment analysis queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_competitor_posts_sentiment 
  ON public.competitor_posts(competitor_id, sentiment_score)
  WHERE sentiment_score IS NOT NULL;

COMMENT ON INDEX public.idx_competitor_posts_sentiment IS 
  'Optimizes sentiment analysis aggregations';

-- ============================================
-- VALIDATION
-- ============================================

-- Verify indexes were created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
