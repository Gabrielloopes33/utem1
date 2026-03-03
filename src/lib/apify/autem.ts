/**
 * Cliente Apify para scraping da conta oficial @autem.inv
 * Documentação: https://docs.apify.com/api/client/js/
 */

import { createServiceClient } from "@/lib/supabase/service";

const APIFY_BASE_URL = "https://api.apify.com/v2";
const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

export interface AutemPost {
  id: string;
  external_id: string;
  short_code: string;
  caption: string;
  likes: number;
  comments: number;
  media_type: "carousel" | "reel" | "image" | "video";
  timestamp: string;
  permalink: string;
  thumbnail_url?: string;
  display_url?: string;
  video_url?: string;
  video_view_count?: number;
  hashtags: string[];
  mentions: string[];
  engagement_rate: number;
  scraped_at: string;
}

interface ApifyInstagramPost {
  id: string;
  shortCode: string;
  type: "Image" | "Video" | "Carousel" | "Reel" | "Sidecar";
  caption?: string;
  url: string;
  commentsCount: number;
  likesCount: number;
  timestamp?: string;
  mentions?: string[];
  hashtags?: string[];
  displayUrl?: string;
  videoViewCount?: number;
  videoUrl?: string;
}

interface ApifyInstagramProfile {
  id: string;
  username: string;
  fullName: string;
  followersCount: number;
  latestPosts?: ApifyInstagramPost[];
}

const CACHE_DURATION_HOURS = 6; // Atualiza a cada 6 horas

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
 * Busca posts da conta @autem.inv do cache ou faz scraping
 */
export async function getAutemPosts(options: {
  forceRefresh?: boolean;
  limit?: number;
} = {}): Promise<AutemPost[]> {
  const { forceRefresh = false, limit = 50 } = options;

  const supabase = createServiceClient();

  // 1. Verificar se temos posts recentes no cache
  if (!forceRefresh) {
    const { data: latestPost } = await supabase
      .from("autem_posts")
      .select("scraped_at")
      .order("scraped_at", { ascending: false })
      .limit(1)
      .single();

    if (latestPost && !isCacheStale(latestPost.scraped_at)) {
      console.log("[Cache] Usando posts da Autem em cache");
      const { data: posts } = await supabase
        .from("autem_posts")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit);

      return (posts || []).map(mapPostFromDB);
    }
  }

  // 2. Fazer scraping via Apify
  console.log("[Apify] Buscando posts atualizados da @autem.inv");

  try {
    const scrapedPosts = await scrapeAutemProfile();
    
    // 3. Salvar no banco
    await saveAutemPosts(scrapedPosts);

    // 4. Retornar posts salvos
    const { data: posts } = await supabase
      .from("autem_posts")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    return (posts || []).map(mapPostFromDB);
  } catch (error) {
    console.error("[Apify] Erro ao buscar posts da Autem:", error);
    
    // Se falhar, retornar do cache mesmo se velho
    const { data: posts } = await supabase
      .from("autem_posts")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (posts && posts.length > 0) {
      console.log("[Cache] Retornando posts desatualizados da Autem");
      return posts.map(mapPostFromDB);
    }

    throw error;
  }
}

/**
 * Faz scraping do perfil @autem.inv via Apify
 */
async function scrapeAutemProfile(): Promise<AutemPost[]> {
  if (!APIFY_TOKEN) {
    throw new Error("APIFY_API_TOKEN não configurado");
  }

  const response = await fetch(
    `${APIFY_BASE_URL}/acts/apify~instagram-scraper/run-sync-get-dataset-items`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${APIFY_TOKEN}`,
      },
      body: JSON.stringify({
        usernames: ["autem.inv"],
        resultsLimit: 50,
        includeDetails: true,
        maxRequestRetries: 3,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao chamar Apify: ${response.status} - ${error}`);
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Perfil @autem.inv não encontrado no Instagram");
  }

  const profile = data[0] as ApifyInstagramProfile;
  const posts = profile.latestPosts || [];
  const followersCount = profile.followersCount || 1;

  // Mapear posts para nosso formato
  return posts.map((post): AutemPost => {
    const engagementRate = 
      followersCount > 0
        ? ((post.likesCount + post.commentsCount) / followersCount) * 100
        : 0;

    return {
      id: "", // Será gerado pelo banco
      external_id: post.id,
      short_code: post.shortCode,
      caption: post.caption || "",
      likes: post.likesCount || 0,
      comments: post.commentsCount || 0,
      media_type: mapMediaType(post.type),
      timestamp: post.timestamp ? new Date(post.timestamp).toISOString() : new Date().toISOString(),
      permalink: post.url,
      thumbnail_url: post.displayUrl,
      display_url: post.displayUrl,
      video_url: post.videoUrl,
      video_view_count: post.videoViewCount,
      hashtags: post.hashtags || [],
      mentions: post.mentions || [],
      engagement_rate: parseFloat(engagementRate.toFixed(2)),
      scraped_at: new Date().toISOString(),
    };
  });
}

/**
 * Salva posts da Autem no Supabase
 */
async function saveAutemPosts(posts: AutemPost[]): Promise<void> {
  const supabase = createServiceClient();

  const postsToUpsert = posts.map((post) => ({
    external_id: post.external_id,
    short_code: post.short_code,
    caption: post.caption.substring(0, 2000),
    likes: post.likes,
    comments: post.comments,
    media_type: post.media_type,
    timestamp: post.timestamp,
    permalink: post.permalink,
    thumbnail_url: post.thumbnail_url,
    display_url: post.display_url,
    video_url: post.video_url,
    video_view_count: post.video_view_count,
    hashtags: post.hashtags,
    mentions: post.mentions,
    engagement_rate: post.engagement_rate,
    scraped_at: post.scraped_at,
  }));

  const { error } = await supabase
    .from("autem_posts")
    .upsert(postsToUpsert, { onConflict: "external_id" });

  if (error) {
    console.error("Erro ao salvar posts da Autem:", error);
    throw new Error(`Erro ao salvar posts: ${error.message}`);
  }

  console.log(`[DB] ${posts.length} posts da Autem salvos/atualizados`);
}

/**
 * Mapeia tipos de mídia do Apify para nosso formato
 */
function mapMediaType(apifyType: string): "carousel" | "reel" | "image" | "video" {
  switch (apifyType) {
    case "Carousel":
    case "Sidecar":
      return "carousel";
    case "Reel":
      return "reel";
    case "Video":
      return "video";
    case "Image":
    default:
      return "image";
  }
}

/**
 * Mapeia post do banco para interface AutemPost
 */
function mapPostFromDB(dbPost: Record<string, unknown>): AutemPost {
  return {
    id: dbPost.id as string,
    external_id: dbPost.external_id as string,
    short_code: dbPost.short_code as string,
    caption: dbPost.caption as string,
    likes: dbPost.likes as number,
    comments: dbPost.comments as number,
    media_type: dbPost.media_type as "carousel" | "reel" | "image" | "video",
    timestamp: dbPost.timestamp as string,
    permalink: dbPost.permalink as string,
    thumbnail_url: dbPost.thumbnail_url as string | undefined,
    display_url: dbPost.display_url as string | undefined,
    video_url: dbPost.video_url as string | undefined,
    video_view_count: dbPost.video_view_count as number | undefined,
    hashtags: (dbPost.hashtags as string[]) || [],
    mentions: (dbPost.mentions as string[]) || [],
    engagement_rate: parseFloat((dbPost.engagement_rate as number)?.toString() || "0"),
    scraped_at: dbPost.scraped_at as string,
  };
}

/**
 * Busca métricas agregadas da conta @autem.inv
 */
export async function getAutemMetrics(): Promise<{
  followers: number;
  postsCount: number;
  avgEngagement: number;
  avgLikes: number;
  avgComments: number;
  topPosts: AutemPost[];
}> {
  const posts = await getAutemPosts({ limit: 50 });

  if (posts.length === 0) {
    return {
      followers: 0,
      postsCount: 0,
      avgEngagement: 0,
      avgLikes: 0,
      avgComments: 0,
      topPosts: [],
    };
  }

  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);
  const avgEngagement = posts.reduce((sum, p) => sum + p.engagement_rate, 0) / posts.length;

  // Top 5 posts por engajamento
  const topPosts = [...posts]
    .sort((a, b) => b.engagement_rate - a.engagement_rate)
    .slice(0, 5);

  return {
    followers: 0, // Precisaria buscar do perfil
    postsCount: posts.length,
    avgEngagement: parseFloat(avgEngagement.toFixed(2)),
    avgLikes: Math.round(totalLikes / posts.length),
    avgComments: Math.round(totalComments / posts.length),
    topPosts,
  };
}
