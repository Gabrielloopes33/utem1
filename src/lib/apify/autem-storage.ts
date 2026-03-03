/**
 * Cliente Apify para buscar dados de datasets/storages existentes
 * Não executa scraping - apenas busca dados já coletados
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

interface ApifyDatasetItem {
  id: string;
  shortCode?: string;
  shortcode?: string;
  type?: string;
  caption?: string;
  url?: string;
  link?: string;
  commentsCount?: number;
  comments?: number;
  likesCount?: number;
  likes?: number;
  timestamp?: string;
  takenAt?: string;
  mentions?: string[];
  hashtags?: string[];
  displayUrl?: string;
  imageUrl?: string;
  videoViewCount?: number;
  videoUrl?: string;
}

const CACHE_DURATION_HOURS = 24; // Cache de 24 horas

/**
 * Busca posts da conta @autem.inv do Supabase (cache)
 * Se não tiver dados ou estiverem desatualizados, busca do Apify storage
 */
export async function getAutemPostsFromStorage(options: {
  limit?: number;
} = {}): Promise<AutemPost[]> {
  const { limit = 50 } = options;

  const supabase = createServiceClient();

  // 1. Verificar se temos posts recentes no cache
  const { data: latestPost } = await supabase
    .from("autem_posts")
    .select("scraped_at")
    .order("scraped_at", { ascending: false })
 .limit(1)
    .single();

  if (latestPost && !isCacheStale(latestPost.scraped_at)) {
    console.log("[AutemStorage] Usando posts do cache Supabase");
    const { data: posts } = await supabase
      .from("autem_posts")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (posts && posts.length > 0) {
      return posts.map(mapPostFromDB);
    }
  }

  // 2. Se não tiver no cache, buscar do Apify storage
  console.log("[AutemStorage] Cache vazio ou desatualizado - buscando do Apify storage...");
  
  try {
    const posts = await fetchFromApifyStorage();
    
    // 3. Salvar no Supabase
    await saveAutemPosts(posts);

    // 4. Retornar posts
    return posts.slice(0, limit);
  } catch (error) {
    console.error("[AutemStorage] Erro ao buscar do storage:", error);
    
    // Se falhar mas tiver cache (mesmo velho), retornar
    const { data: posts } = await supabase
      .from("autem_posts")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (posts && posts.length > 0) {
      console.log(`[AutemStorage] ${posts.length} posts retornados do cache (desatualizado)`);
      return posts.map(mapPostFromDB);
    }

    throw error;
  }
}

/**
 * IDs dos datasets do Apify com posts da @autem.inv
 */
const AUTEM_DATASET_IDS = [
  "Qjtjf2JhmLY6BV92W",
  "gAZSbm9HN6KzNTwD1",
  "GJtua5AbUmfCDYszs",
  "8rj8mLurnFe55ZcCG",
];

/**
 * Busca dados dos datasets específicos do Apify (sem executar actor)
 */
async function fetchFromApifyStorage(): Promise<AutemPost[]> {
  if (!APIFY_TOKEN) {
    throw new Error("APIFY_API_TOKEN não configurado");
  }

  console.log("[ApifyStorage] Buscando dos datasets específicos...");
  console.log(`[ApifyStorage] Datasets: ${AUTEM_DATASET_IDS.join(", ")}`);

  // Tentar buscar de cada dataset em ordem
  for (const datasetId of AUTEM_DATASET_IDS) {
    try {
      console.log(`[ApifyStorage] Tentando dataset: ${datasetId}`);
      const posts = await fetchDatasetItems(datasetId);
      
      if (posts.length > 0) {
        console.log(`[ApifyStorage] Dataset ${datasetId} retornou ${posts.length} posts`);
        return posts;
      }
    } catch (error) {
      console.log(`[ApifyStorage] Dataset ${datasetId} falhou:`, (error as Error).message);
      // Continua para o próximo dataset
    }
  }

  throw new Error("Nenhum dataset retornou posts válidos");
}

/**
 * Busca items de um dataset específico
 */
async function fetchDatasetItems(datasetId: string): Promise<AutemPost[]> {
  console.log(`[ApifyStorage] Buscando items do dataset ${datasetId}...`);

  const response = await fetch(
    `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${APIFY_TOKEN}&clean=true&limit=100`,
    {
      headers: {
        Authorization: `Bearer ${APIFY_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Erro ao buscar items: ${response.status}`);
  }

  const items: ApifyDatasetItem[] = await response.json();
  console.log(`[ApifyStorage] ${items.length} items encontrados no dataset`);

  if (items.length === 0) {
    throw new Error("Dataset vazio");
  }

  // Calcular followers (assumindo que temos o perfil no primeiro item ou valor padrão)
  // Se o primeiro item tiver followersCount, usamos, senão assumimos 1000
  const firstItem = items[0] as unknown as Record<string, number | undefined>;
  const followersCount = firstItem?.followersCount || 
                        firstItem?.ownerFollowers || 
                        1000; // fallback

  console.log(`[ApifyStorage] Seguidores estimados: ${followersCount}`);

  // Mapear items para AutemPost
  return items.map((item): AutemPost => {
    const likes = item.likesCount || item.likes || 0;
    const comments = item.commentsCount || item.comments || 0;
    const engagementRate = followersCount > 0 
      ? ((likes + comments) / followersCount) * 100 
      : 0;

    return {
      id: "",
      external_id: item.id,
      short_code: item.shortCode || item.shortcode || "",
      caption: item.caption || "",
      likes: likes,
      comments: comments,
      media_type: mapMediaType(item.type || "Image"),
      timestamp: item.timestamp || item.takenAt 
        ? new Date(item.timestamp || item.takenAt!).toISOString()
        : new Date().toISOString(),
      permalink: item.url || item.link || `https://instagram.com/p/${item.shortCode || item.shortcode}`,
      thumbnail_url: item.displayUrl || item.imageUrl,
      display_url: item.displayUrl || item.imageUrl,
      video_url: item.videoUrl,
      video_view_count: item.videoViewCount,
      hashtags: item.hashtags || [],
      mentions: item.mentions || [],
      engagement_rate: parseFloat(engagementRate.toFixed(2)),
      scraped_at: new Date().toISOString(),
    };
  });
}

/**
 * Salva posts no Supabase
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
    console.error("[AutemStorage] Erro ao salvar posts:", error);
    throw new Error(`Erro ao salvar posts: ${error.message}`);
  }

  console.log(`[AutemStorage] ${posts.length} posts salvos no Supabase`);
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
 * Mapeia tipos de mídia
 */
function mapMediaType(apifyType: string): "carousel" | "reel" | "image" | "video" {
  const type = apifyType.toLowerCase();
  if (type.includes("carousel") || type.includes("sidecar")) return "carousel";
  if (type.includes("reel")) return "reel";
  if (type.includes("video")) return "video";
  return "image";
}

/**
 * Mapeia post do banco para interface
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
