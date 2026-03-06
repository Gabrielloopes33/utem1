/**
 * API Route: GET /api/concorrentes/setup
 * Lê os datasets do Apify Storage (já raspados) e salva no Supabase.
 *
 * Concorrentes e dataset IDs estão em @/constants/competitors
 */

import { NextResponse } from "next/server";
import { COMPETITORS } from "@/constants/competitors";
import { calculateMetrics } from "@/lib/apify/client";
import type { ScrapedCompetitorData } from "@/lib/apify/client";
import { createServiceClient } from "@/lib/supabase/service";

const APIFY_BASE_URL = "https://api.apify.com/v2";
const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

/**
 * Busca todos os itens de um dataset do Apify Storage.
 * O Instagram Scraper retorna um item por perfil com latestPosts embutidos,
 * OU um item por post (dependendo da configuração do actor).
 * Suporta os dois formatos.
 */
async function fetchDataset(datasetId: string): Promise<unknown[]> {
  const url = `${APIFY_BASE_URL}/datasets/${datasetId}/items?clean=true&format=json&limit=200`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${APIFY_TOKEN}` },
    // sem cache para sempre pegar dados frescos
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Apify dataset ${datasetId} retornou ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();

  if (!Array.isArray(data)) {
    throw new Error(`Dataset ${datasetId} não retornou um array`);
  }

  return data;
}

/**
 * Detecta o formato do dataset e monta ScrapedCompetitorData.
 *
 * Formato A (perfil com latestPosts embutidos):
 *   [ { username, fullName, followersCount, ..., latestPosts: [...] } ]
 *
 * Formato B (um item por post, com ownerUsername no nível raiz):
 *   [ { ownerUsername, caption, likesCount, ... }, ... ]
 */
function parseDataset(
  items: unknown[],
  competitorHandle: string,
): ScrapedCompetitorData {
  if (items.length === 0) {
    throw new Error("Dataset vazio");
  }

  const first = items[0] as Record<string, unknown>;

  // --- Formato A: item de perfil com latestPosts ---
  if (first.followersCount !== undefined || first.followsCount !== undefined) {
    const profile = first as {
      id?: string;
      username?: string;
      fullName?: string;
      biography?: string;
      followersCount?: number;
      followsCount?: number;
      postsCount?: number;
      profilePicUrl?: string;
      verified?: boolean;
      private?: boolean;
      latestPosts?: unknown[];
    };

    const posts = ((profile.latestPosts ?? []) as Record<string, unknown>[]).map(normalizePost);

    return {
      profile: {
        id: String(profile.id ?? ""),
        username: String(profile.username ?? competitorHandle),
        fullName: String(profile.fullName ?? competitorHandle),
        biography: String(profile.biography ?? ""),
        followersCount: Number(profile.followersCount ?? 0),
        followsCount: Number(profile.followsCount ?? 0),
        postsCount: Number(profile.postsCount ?? 0),
        profilePicUrl: profile.profilePicUrl as string | undefined,
        verified: Boolean(profile.verified),
        private: Boolean(profile.private),
        latestPosts: [],
      },
      posts,
      scrapedAt: new Date().toISOString(),
    };
  }

  // --- Formato B: um item por post ---
  // O primeiro item pode ter dados do owner
  const anyPost = first as Record<string, unknown>;
  const ownerProfile = (anyPost.ownerFullName ?? anyPost.owner ?? {}) as Record<string, unknown>;

  const profilePicUrl =
    (anyPost.profilePicUrl as string | undefined) ??
    (ownerProfile.profilePicUrl as string | undefined);

  const followersCount =
    Number(anyPost.followersCount ?? anyPost.ownerFollowersCount ?? ownerProfile.followersCount ?? 0);

  return {
    profile: {
      id: String(anyPost.ownerId ?? anyPost.ownerUsername ?? competitorHandle),
      username: String(anyPost.ownerUsername ?? anyPost.username ?? competitorHandle),
      fullName: String(anyPost.ownerFullName ?? anyPost.fullName ?? competitorHandle),
      biography: String(anyPost.biography ?? ""),
      followersCount,
      followsCount: Number(anyPost.followsCount ?? ownerProfile.followsCount ?? 0),
      postsCount: Number(anyPost.postsCount ?? ownerProfile.postsCount ?? items.length),
      profilePicUrl,
      verified: Boolean(anyPost.verified ?? ownerProfile.verified),
      private: Boolean(anyPost.isPrivate ?? ownerProfile.isPrivate),
      latestPosts: [],
    },
    posts: (items as Record<string, unknown>[]).map(normalizePost),
    scrapedAt: new Date().toISOString(),
  };
}

function normalizePost(raw: Record<string, unknown>) {
  const typeRaw = String(raw.type ?? raw.productType ?? raw.mediaType ?? "Image");
  const type = mapApifyType(typeRaw);

  return {
    id: String(raw.id ?? raw.shortCode ?? Math.random()),
    type,
    shortCode: String(raw.shortCode ?? raw.id ?? ""),
    caption: String(raw.caption ?? raw.text ?? ""),
    url: String(raw.url ?? raw.permalink ?? `https://instagram.com/p/${raw.shortCode}`),
    commentsCount: Number(raw.commentsCount ?? raw.comments ?? 0),
    likesCount: Number(raw.likesCount ?? raw.likes ?? 0),
    timestamp: raw.timestamp
      ? String(raw.timestamp)
      : raw.takenAt
      ? new Date(Number(raw.takenAt) * 1000).toISOString()
      : undefined,
    displayUrl: String(raw.displayUrl ?? raw.thumbnailUrl ?? raw.imageUrl ?? ""),
    videoViewCount: raw.videoViewCount ? Number(raw.videoViewCount) : undefined,
    // Campos do owner (para fallback da foto de perfil)
    ownerUsername: String(raw.ownerUsername ?? raw.username ?? ""),
    ownerFullName: String(raw.ownerFullName ?? raw.fullName ?? ""),
    ownerProfilePicUrl: String(raw.ownerProfilePicUrl ?? raw.profilePicUrl ?? ""),
    ownerId: String(raw.ownerId ?? raw.owner_id ?? ""),
  };
}

function mapApifyType(raw: string): "Image" | "Video" | "Carousel" | "Reel" | "Sidecar" {
  const lower = raw.toLowerCase();
  if (lower.includes("sidecar") || lower.includes("carousel")) return "Carousel";
  if (lower.includes("reel")) return "Reel";
  if (lower.includes("video")) return "Video";
  return "Image";
}

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

export async function GET() {
  if (!APIFY_TOKEN) {
    return NextResponse.json(
      { success: false, error: "APIFY_API_TOKEN não configurado" },
      { status: 500 }
    );
  }

  console.log("[Setup Concorrentes] Buscando dados dos datasets do Apify Storage...");

  const results = [];
  const errors = [];
  const supabase = createServiceClient();

  for (const competitor of COMPETITORS) {
    try {
      console.log(
        `[Setup] ${competitor.name} → dataset ${competitor.apify_dataset_id}`
      );

      // 1. Buscar items do dataset
      const items = await fetchDataset(competitor.apify_dataset_id);
      console.log(`[Setup] ${competitor.name}: ${items.length} itens no dataset`);

      // 2. Parsear para formato interno
      const scrapedData = parseDataset(items, competitor.handle);
      const { profile, posts } = scrapedData;

      // 3. Calcular métricas
      const metrics = calculateMetrics(scrapedData);

      // 4. Salvar perfil no Supabase
      const profileData = {
        handle: competitor.handle.toLowerCase(),
        name: profile.fullName || competitor.name,
        platform: "instagram",
        profile_url: competitor.profile_url,
        profile_pic_url: profile.profilePicUrl ?? null,
        biography: profile.biography ?? null,
        followers_count: profile.followersCount,
        following_count: profile.followsCount,
        posts_count: profile.postsCount || posts.length,
        engagement_rate: metrics.engagementRate,
        posts_per_month: metrics.avgPostsPerMonth,
        avg_likes: metrics.avgLikes,
        avg_comments: metrics.avgComments,
        content_breakdown: metrics.contentBreakdown,
        apify_data: { username: profile.username, profilePicUrl: profile.profilePicUrl, biography: profile.biography, source: "dataset", datasetId: competitor.apify_dataset_id },
        last_scraped_at: new Date().toISOString(),
      };

      const { data: savedProfile, error: profileError } = await supabase
        .from("competitor_data")
        .upsert(profileData, { onConflict: "handle" })
        .select()
        .single();

      if (profileError) {
        throw new Error(`Erro ao salvar perfil: ${profileError.message}`);
      }

      // 5. Salvar posts
      if (posts.length > 0) {
        const postsToUpsert = posts.map((post) => ({
          competitor_id: savedProfile.id,
          external_id: post.id,
          caption: post.caption?.substring(0, 2000) ?? "",
          likes: post.likesCount,
          comments: post.commentsCount,
          media_type: mapMediaType(post.type),
          timestamp: post.timestamp ? new Date(post.timestamp).toISOString() : null,
          permalink: post.url,
          thumbnail_url: post.displayUrl || null,
          engagement_rate:
            profile.followersCount > 0
              ? ((post.likesCount + post.commentsCount) / profile.followersCount) * 100
              : 0,
          apify_data: post,
        }));

        const { error: postsError } = await supabase
          .from("competitor_posts")
          .upsert(postsToUpsert, { onConflict: "competitor_id,external_id" });

        if (postsError) {
          console.error(`[Setup] Erro ao salvar posts de ${competitor.name}:`, postsError.message);
        }
      }

      results.push({
        name: competitor.name,
        handle: competitor.handle,
        status: "success",
        followers: profile.followersCount,
        posts: posts.length,
        avg_likes: metrics.avgLikes,
      });

      console.log(
        `[Setup] ✓ ${competitor.name} — ${profile.followersCount} seguidores, ${posts.length} posts`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      console.error(`[Setup] ✗ ${competitor.name}:`, message);
      errors.push({ name: competitor.name, handle: competitor.handle, status: "error", error: message });
    }
  }

  return NextResponse.json({
    success: errors.length < COMPETITORS.length,
    message: `${results.length}/${COMPETITORS.length} concorrentes carregados`,
    results,
    errors: errors.length > 0 ? errors : undefined,
  });
}
