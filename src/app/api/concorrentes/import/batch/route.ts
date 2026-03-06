/**
 * API Route: POST /api/concorrentes/import/batch
 * Lista perfis encontrados em um dataset do Apify
 * Body: { datasetId: string }
 */

import { NextRequest, NextResponse } from "next/server";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { datasetId } = body;

    if (!datasetId) {
      return NextResponse.json(
        { success: false, error: "datasetId é obrigatório" },
        { status: 400 }
      );
    }

    if (!APIFY_TOKEN) {
      return NextResponse.json(
        { success: false, error: "APIFY_API_TOKEN não configurado" },
        { status: 500 }
      );
    }

    console.log(`[Batch] Analisando dataset ${datasetId}`);

    // Buscar dados do dataset
    const response = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`,
      { method: "GET" }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao buscar dataset: ${response.status} - ${error}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { success: false, error: "Dataset vazio" },
        { status: 400 }
      );
    }

    // Extrair perfis únicos
    const profiles = new Map();
    
    data.forEach((item: any) => {
      const username = item.username || item.ownerUsername || item.input?.username;
      if (!username) return;
      
      if (!profiles.has(username.toLowerCase())) {
        profiles.set(username.toLowerCase(), {
          username: username.toLowerCase(),
          fullName: item.fullName || item.ownerFullName || username,
          followers: item.followersCount || item.ownerFollowersCount || 0,
          following: item.followsCount || item.ownerFollowsCount || 0,
          posts: item.postsCount || item.ownerPostsCount || 0,
          profilePicUrl: item.profilePicUrl || item.ownerProfilePicUrl,
          biography: item.biography || item.ownerBiography,
          postsCount: item.latestPosts?.length || 0,
        });
      }
    });

    const uniqueProfiles = Array.from(profiles.values());

    return NextResponse.json({
      success: true,
      message: `${uniqueProfiles.length} perfis encontrados`,
      data: uniqueProfiles,
      totalItems: data.length,
    });

  } catch (error) {
    console.error("[Batch] Erro:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    }, { status: 500 });
  }
}
