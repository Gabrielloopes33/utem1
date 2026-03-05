/**
 * Serviço de cache para dados de concorrentes no Supabase
 * Estratégia: cache por 24h para economizar requisições Apify
 */

import { createServiceClient } from "@/lib/supabase/service";
import { scrapeInstagramProfile, calculateMetrics, ScrapedCompetitorData } from "./client";

const CACHE_DURATION_HOURS = 24;

export interface CachedCompetitor {
  id: string;
  handle: string;
  name: string;
  platform: string;
  profile_url: string;
  profile_pic_url?: string;
  biography?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  engagement_rate: number;
  posts_per_month: number;
  avg_likes: number;
  avg_comments: number;
  content_breakdown: {
    carousel: number;
    reels: number;
    image: number;
  };
  last_scraped_at: string;
  isStale: boolean;
}

export interface CachedPost {
  id: string;
  external_id: string;
  caption: string;
  likes: number;
  comments: number;
  media_type: "carousel" | "reel" | "image";
  timestamp: string;
  permalink: string;
  thumbnail_url?: string;
  engagement_rate: number;
}

/**
 * Verifica se o cache está desatualizado
 */
function isCacheStale(lastScrapedAt: string): boolean {
  const lastScraped = new Date(lastScrapedAt);
  const now = new Date();
  const diffHours = (now.getTime() - lastScraped.getTime()) / (1000 * 60 * 60);
  return diffHours > CACHE_DURATION_HOURS;
}

/**
 * Busca dados de um concorrente do cache ou faz scraping
 */
export async function getCompetitor(
  handle: string,
  options: {
    forceRefresh?: boolean;
    userId?: string;
  } = {}
): Promise<{ competitor: CachedCompetitor; posts: CachedPost[] }> {
  const { forceRefresh = false } = options;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _userId = options.userId;
  const cleanHandle = handle.replace("@", "").trim().toLowerCase();

  const supabase = createServiceClient();

  // 1. Buscar no cache
  const { data: existingData, error: fetchError } = await supabase
    .from("competitor_data")
    .select("*")
    .eq("handle", cleanHandle)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Erro ao buscar cache:", fetchError);
  }

  // 2. Verificar se precisa atualizar
  const needsRefresh =
    forceRefresh ||
    !existingData ||
    !existingData.last_scraped_at ||
    isCacheStale(existingData.last_scraped_at);

  // 3. Se não precisa atualizar, retornar do cache
  if (!needsRefresh && existingData) {
    console.log(`[Cache] Usando dados em cache para @${cleanHandle}`);

    // Buscar posts do cache
    const { data: posts } = await supabase
      .from("competitor_posts")
      .select("*")
      .eq("competitor_id", existingData.id)
      .order("timestamp", { ascending: false })
      .limit(50);

    return {
      competitor: {
        ...existingData,
        isStale: false,
      } as CachedCompetitor,
      posts:
        posts?.map((p) => ({
          ...p,
          media_type: p.media_type as "carousel" | "reel" | "image",
        })) || [],
    };
  }

  // 4. Fazer scraping via Apify
  console.log(`[Apify] Buscando dados atualizados para @${cleanHandle}`);

  try {
    const scrapedData = await scrapeInstagramProfile(cleanHandle, {
      resultsLimit: 50,
    });

    // 5. Salvar no Supabase
    const saved = await saveCompetitorData(cleanHandle, scrapedData);

    // 6. Retornar dados salvos
    const { data: posts } = await supabase
      .from("competitor_posts")
      .select("*")
      .eq("competitor_id", saved.id)
      .order("timestamp", { ascending: false })
      .limit(50);

    return {
      competitor: {
        ...saved,
        isStale: false,
      },
      posts:
        posts?.map((p) => ({
          ...p,
          media_type: p.media_type as "carousel" | "reel" | "image",
        })) || [],
    };
  } catch (error) {
    console.error(`[Apify] Erro ao buscar @${cleanHandle}:`, error);

    // Se falhar mas tiver dados em cache (mesmo velhos), retornar eles
    if (existingData) {
      console.log(`[Cache] Retornando dados desatualizados para @${cleanHandle}`);

      const { data: posts } = await supabase
        .from("competitor_posts")
        .select("*")
        .eq("competitor_id", existingData.id)
        .order("timestamp", { ascending: false })
        .limit(50);

      return {
        competitor: {
          ...existingData,
          isStale: true,
        } as CachedCompetitor,
        posts:
          posts?.map((p) => ({
            ...p,
            media_type: p.media_type as "carousel" | "reel" | "image",
          })) || [],
      };
    }

    throw error;
  }
}

/**
 * Salva dados de um concorrente no Supabase
 */
async function saveCompetitorData(
  handle: string,
  data: ScrapedCompetitorData
): Promise<CachedCompetitor> {
  const supabase = createServiceClient();
  const metrics = calculateMetrics(data);
  const { profile } = data;

  // Preparar dados do perfil
  const profileData = {
    handle: handle.toLowerCase(),
    name: profile.fullName || profile.username,
    platform: "instagram",
    profile_url: `https://instagram.com/${handle}`,
    profile_pic_url: profile.profilePicUrl,
    biography: profile.biography,
    followers_count: profile.followersCount,
    following_count: profile.followsCount,
    posts_count: profile.postsCount,
    engagement_rate: metrics.engagementRate,
    posts_per_month: metrics.avgPostsPerMonth,
    avg_likes: metrics.avgLikes,
    avg_comments: metrics.avgComments,
    content_breakdown: metrics.contentBreakdown,
    apify_data: profile,
    last_scraped_at: new Date().toISOString(),
  };

  // Upsert na tabela competitor_data
  const { data: saved, error } = await supabase
    .from("competitor_data")
    .upsert(profileData, { onConflict: "handle" })
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao salvar dados: ${error.message}`);
  }

  // Salvar posts
  if (data.posts.length > 0) {
    const postsToUpsert = data.posts.map((post) => ({
      competitor_id: saved.id,
      external_id: post.id,
      caption: post.caption?.substring(0, 2000) || "",
      likes: post.likesCount || 0,
      comments: post.commentsCount || 0,
      media_type: mapMediaType(post.type),
      timestamp: post.timestamp ? new Date(post.timestamp).toISOString() : null,
      permalink: post.url,
      thumbnail_url: post.displayUrl,
      engagement_rate:
        profile.followersCount > 0
          ? ((post.likesCount + post.commentsCount) / profile.followersCount) * 100
          : 0,
      apify_data: post,
    }));

    // Upsert em batch
    const { error: postsError } = await supabase
      .from("competitor_posts")
      .upsert(postsToUpsert, { onConflict: "competitor_id,external_id" });

    if (postsError) {
      console.error("Erro ao salvar posts:", postsError);
    }
  }

  return {
    ...saved,
    content_breakdown: saved.content_breakdown as CachedCompetitor["content_breakdown"],
    isStale: false,
  };
}

/**
 * Mapeia tipos de mídia do Apify para nosso formato
 */
function mapMediaType(apifyType: string): "carousel" | "reel" | "image" {
  switch (apifyType) {
    case "Carousel":
    case "Sidecar":
      return "carousel";
    case "Reel":
    case "Video":
      return "reel";
    case "Image":
    default:
      return "image";
  }
}

/**
 * Busca todos os concorrentes salvos
 */
export async function getAllCompetitors(): Promise<CachedCompetitor[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("competitor_data")
    .select("*")
    .order("followers_count", { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar concorrentes: ${error.message}`);
  }

  return (data || []).map((c) => ({
    ...c,
    content_breakdown: c.content_breakdown as CachedCompetitor["content_breakdown"],
    isStale: isCacheStale(c.last_scraped_at),
  }));
}

/**
 * Busca posts de um concorrente específico
 */
export async function getCompetitorPosts(
  competitorId: string,
  limit: number = 50
): Promise<CachedPost[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("competitor_posts")
    .select("*")
    .eq("competitor_id", competitorId)
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Erro ao buscar posts: ${error.message}`);
  }

  return (data || []).map((p) => ({
    ...p,
    media_type: p.media_type as "carousel" | "reel" | "image",
  }));
}

/**
 * Força atualização de um concorrente específico
 */
export async function refreshCompetitor(handle: string): Promise<CachedCompetitor> {
  const result = await getCompetitor(handle, { forceRefresh: true });
  return result.competitor;
}
