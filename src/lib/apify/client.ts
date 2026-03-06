/**
 * Cliente Apify para scraping de perfis do Instagram
 * Documentação: https://docs.apify.com/api/client/js/
 */

import { isKnownCompetitor } from "@/constants/competitors";

const APIFY_BASE_URL = "https://api.apify.com/v2";
const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

export interface ApifyInstagramProfile {
  id: string;
  username: string;
  fullName: string;
  biography: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  profilePicUrl?: string;
  externalUrl?: string;
  verified: boolean;
  private: boolean;
  latestPosts?: ApifyInstagramPost[];
}

export interface ApifyInstagramPost {
  id: string;
  type: "Image" | "Video" | "Carousel" | "Reel" | "Sidecar";
  shortCode: string;
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
  children?: Array<{
    id: string;
    type: string;
    displayUrl: string;
  }>;
  // Campos do owner (perfil) que vêm em cada post
  ownerUsername?: string;
  ownerFullName?: string;
  ownerProfilePicUrl?: string;
  ownerId?: string;
}

export interface ScrapedCompetitorData {
  profile: ApifyInstagramProfile;
  posts: ApifyInstagramPost[];
  scrapedAt: string;
}

/**
 * Busca dados de um perfil do Instagram via Apify
 * Usa o actor: apify/instagram-scraper
 * 
 * Filtro robusto aplicado: verifica se o perfil corresponde ao username
 * buscado usando comparação case-insensitive e partial match
 */
export async function scrapeInstagramProfile(
  username: string,
  options: {
    resultsLimit?: number;
    includeDetails?: boolean;
  } = {}
): Promise<ScrapedCompetitorData> {
  const { resultsLimit = 50, includeDetails = true } = options;

  if (!APIFY_TOKEN) {
    throw new Error("APIFY_API_TOKEN não configurado");
  }

  const cleanUsername = username.replace("@", "").trim();

  // Chamar o actor do Apify diretamente via run-sync-get-dataset-items
  const response = await fetch(
    `${APIFY_BASE_URL}/acts/apify~instagram-scraper/run-sync-get-dataset-items`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${APIFY_TOKEN}`,
      },
      body: JSON.stringify({
        usernames: [cleanUsername],
        resultsLimit,
        includeDetails,
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
    throw new Error(`Perfil @${cleanUsername} não encontrado no Instagram`);
  }

  // Filtro robusto: verificar se o perfil retornado corresponde ao buscado
  // usando case-insensitive e partial match
  const filteredData = data.filter((profile: ApifyInstagramProfile) => {
    const searchTerm = cleanUsername.toLowerCase();
    const profileUsername = (profile.username || "").toLowerCase();
    const profileFullName = (profile.fullName || "").toLowerCase();

    return (
      profileUsername.includes(searchTerm) ||
      searchTerm.includes(profileUsername) ||
      profileFullName.includes(searchTerm) ||
      searchTerm.includes(profileFullName)
    );
  });

  // Se o filtro remover todos, usar o primeiro resultado (fallback)
  const profile = (filteredData.length > 0 ? filteredData[0] : data[0]) as ApifyInstagramProfile;
  const posts = profile.latestPosts || [];

  return {
    profile,
    posts,
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Calcula métricas agregadas a partir dos dados brutos
 */
export function calculateMetrics(data: ScrapedCompetitorData) {
  const { profile, posts } = data;

  // Métricas básicas
  const totalLikes = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);
  const avgLikes = posts.length > 0 ? Math.round(totalLikes / posts.length) : 0;
  const avgComments = posts.length > 0 ? Math.round(totalComments / posts.length) : 0;

  // Taxa de engajamento
  const engagementRate =
    profile.followersCount > 0
      ? ((totalLikes + totalComments) / posts.length / profile.followersCount) * 100
      : 0;

  // Posts por mês (baseado nas datas dos posts)
  const postsByMonth = new Map<string, number>();
  posts.forEach((post) => {
    if (post.timestamp) {
      const date = new Date(post.timestamp);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      postsByMonth.set(key, (postsByMonth.get(key) || 0) + 1);
    }
  });
  const avgPostsPerMonth =
    postsByMonth.size > 0
      ? Math.round(Array.from(postsByMonth.values()).reduce((a, b) => a + b, 0) / postsByMonth.size)
      : 0;

  // Breakdown por tipo de conteúdo
  const contentBreakdown = {
    carousel: posts.filter((p) => p.type === "Carousel" || p.type === "Sidecar").length,
    reels: posts.filter((p) => p.type === "Reel" || p.type === "Video").length,
    image: posts.filter((p) => p.type === "Image").length,
  };

  // Top posts por engajamento
  const topPosts = [...posts]
    .sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount))
    .slice(0, 10)
    .map((post) => ({
      id: post.id,
      shortCode: post.shortCode,
      caption: post.caption?.substring(0, 150) || "",
      likes: post.likesCount,
      comments: post.commentsCount,
      type: post.type,
      url: post.url,
      thumbnailUrl: post.displayUrl,
      timestamp: post.timestamp,
      engagementRate:
        profile.followersCount > 0
          ? ((post.likesCount + post.commentsCount) / profile.followersCount) * 100
          : 0,
    }));

  return {
    followers: profile.followersCount,
    following: profile.followsCount,
    postsCount: profile.postsCount,
    engagementRate: parseFloat(engagementRate.toFixed(2)),
    avgLikes,
    avgComments,
    avgPostsPerMonth,
    totalInteractions: totalLikes + totalComments,
    contentBreakdown,
    topPosts,
  };
}

/**
 * Busca múltiplos perfis em paralelo
 * 
 * Quando usado com a lista de concorrentes conhecidos, aplica filtro robusto
 * para garantir que apenas perfis válidos sejam retornados
 */
export async function scrapeMultipleProfiles(
  usernames: string[],
  options?: {
    resultsLimit?: number;
    filterKnownCompetitors?: boolean;
  }
): Promise<Record<string, ScrapedCompetitorData>> {
  const results: Record<string, ScrapedCompetitorData> = {};
  const { filterKnownCompetitors = false } = options || {};

  // Processar em lotes de 3 para não sobrecarregar
  const batchSize = 3;
  for (let i = 0; i < usernames.length; i += batchSize) {
    const batch = usernames.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(async (username) => {
        const data = await scrapeInstagramProfile(username, options);
        return { username, data };
      })
    );

    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        // Se filterKnownCompetitors=true, verificar se é um concorrente conhecido
        if (filterKnownCompetitors) {
          const profileUsername = result.value.data.profile.username || "";
          const profileFullName = result.value.data.profile.fullName || "";
          
          if (
            isKnownCompetitor(profileUsername) ||
            isKnownCompetitor(profileFullName)
          ) {
            results[result.value.username] = result.value.data;
          } else {
            console.warn(`[Apify] Perfil ignorado (não é concorrente conhecido): ${profileUsername}`);
          }
        } else {
          results[result.value.username] = result.value.data;
        }
      } else {
        console.error(`Erro ao buscar perfil: ${result.reason}`);
      }
    });
  }

  return results;
}
