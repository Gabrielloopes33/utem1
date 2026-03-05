-- Rollback: Remove Performance Indexes
-- Use this if indexes cause issues or need to be rebuilt

-- ============================================
-- KNOWLEDGE BASE INDEXES
-- ============================================
DROP INDEX IF EXISTS public.idx_knowledge_docs_kb_status;
DROP INDEX IF EXISTS public.idx_knowledge_docs_embedding;

-- ============================================
-- COMPETITOR ANALYSIS INDEXES
-- ============================================
DROP INDEX IF EXISTS public.idx_competitor_posts_competitor_timestamp;
DROP INDEX IF EXISTS public.idx_competitor_posts_engagement;
DROP INDEX IF EXISTS public.idx_competitor_posts_media_type;
DROP INDEX IF EXISTS public.idx_competitor_posts_sentiment;
DROP INDEX IF EXISTS public.idx_competitor_data_handle;

-- ============================================
-- CAMPAIGN INDEXES
-- ============================================
DROP INDEX IF EXISTS public.idx_campaigns_user_created;
DROP INDEX IF EXISTS public.idx_campaigns_status;

-- ============================================
-- AGENT INDEXES
-- ============================================
DROP INDEX IF EXISTS public.idx_agent_knowledge_agent_kb;
DROP INDEX IF EXISTS public.idx_time_agents_status;

-- ============================================
-- ACTIVITY INDEXES
-- ============================================
DROP INDEX IF EXISTS public.idx_time_activities_created;
DROP INDEX IF EXISTS public.idx_time_activities_type_created;

-- Verification: List remaining custom indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY indexname;
