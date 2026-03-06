/**
 * API Route: GET /api/concorrentes/[handle]/profile-pic
 * Busca a foto de perfil usando serviços públicos alternativos
 */

import { NextRequest, NextResponse } from "next/server";

const APIFY_BASE_URL = "https://api.apify.com/v2";
const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

interface RouteParams {
  params: Promise<{ handle: string }>;
}

// Usar picuki.com como proxy para obter foto do Instagram
async function fetchFromPicuki(username: string): Promise<string | null> {
  try {
    const response = await fetch(`https://www.picuki.com/profile/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    // Procurar pela imagem de perfil no HTML
    const match = html.match(/src="([^"]+)"[^>]*class="[^"]*profile-avatar/i) ||
                  html.match(/profile-pic[^"]*"[^>]*src="([^"]+)/i) ||
                  html.match(/<img[^>]*src="([^"]+)"[^>]*alt="[^"]*${username}/i);
    
    if (match && match[1]) {
      let url = match[1];
      // Se for URL relativa, adicionar domínio
      if (url.startsWith('/')) {
        url = 'https://www.picuki.com' + url;
      }
      return url;
    }
    return null;
  } catch (err) {
    console.error('[Picuki] Erro:', err);
    return null;
  }
}

// Usar imginn.com como alternativa
async function fetchFromImginn(username: string): Promise<string | null> {
  try {
    const response = await fetch(`https://imginn.com/${username}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    // Procurar imagem de perfil
    const match = html.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*avatar/i) ||
                  html.match(/profile[^"]*"[^>]*src="([^"]+)/i);
    
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch (err) {
    console.error('[Imginn] Erro:', err);
    return null;
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { handle } = await params;
    const cleanHandle = handle.replace("@", "").trim().toLowerCase();

    console.log(`[API ProfilePic] Buscando foto para @${cleanHandle}`);

    // Tentar Apify primeiro
    if (APIFY_TOKEN) {
      try {
        const response = await fetch(
          `${APIFY_BASE_URL}/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${APIFY_TOKEN}`,
            },
            body: JSON.stringify({ usernames: [cleanHandle] }),
            cache: "no-store",
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const profile = data[0] as Record<string, unknown>;
            const picUrl = profile.profilePicUrl || profile.profile_pic_url;
            
            if (picUrl && typeof picUrl === 'string') {
              console.log(`[API ProfilePic] Foto encontrada via Apify`);
              return NextResponse.json({ success: true, profilePicUrl: picUrl });
            }
          }
        }
      } catch (err) {
        console.log(`[API ProfilePic] Apify falhou`);
      }
    }

    // Tentar serviços alternativos
    console.log(`[API ProfilePic] Tentando serviços alternativos...`);
    
    // Tentar imginn
    const imginnUrl = await fetchFromImginn(cleanHandle);
    if (imginnUrl) {
      console.log(`[API ProfilePic] Foto encontrada via Imginn`);
      return NextResponse.json({ success: true, profilePicUrl: imginnUrl });
    }

    // Tentar picuki
    const picukiUrl = await fetchFromPicuki(cleanHandle);
    if (picukiUrl) {
      console.log(`[API ProfilePic] Foto encontrada via Picuki`);
      return NextResponse.json({ success: true, profilePicUrl: picukiUrl });
    }

    console.log(`[API ProfilePic] Nenhuma foto encontrada para @${cleanHandle}`);
    
    return NextResponse.json({
      success: false,
      profilePicUrl: null,
      message: "Foto de perfil não disponível no momento.",
    });
  } catch (error) {
    console.error("[API ProfilePic] Erro:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
