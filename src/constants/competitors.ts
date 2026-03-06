/**
 * Constantes de concorrentes pré-configurados
 * Usado para filtragem robusta de dados do Apify
 */

export const COMPETITORS = [
  {
    handle: "xpinvestimentos",
    name: "XP Investimentos",
    platform: "instagram",
    profile_url: "https://instagram.com/xpinvestimentos",
    apify_dataset_id: "Qjtjf2JhmLY6BV92W",
  },
  {
    handle: "raulsena",
    name: "Raul Sena",
    platform: "instagram",
    profile_url: "https://instagram.com/raulsena",
    apify_dataset_id: "gAZSbm9HN6KzNTwD1",
  },
  {
    handle: "primorico",
    name: "Primo Rico",
    platform: "instagram",
    profile_url: "https://instagram.com/primorico",
    apify_dataset_id: "GJtua5AbUmfCDYszs",
  },
  {
    handle: "gemeosdasfinancas",
    name: "Gêmeos das Finanças",
    platform: "instagram",
    profile_url: "https://instagram.com/gemeosdasfinancas",
    apify_dataset_id: "8rj8mLurnFe55ZcCG",
  },
] as const;

// Tipos derivados das constantes
export type CompetitorHandle = (typeof COMPETITORS)[number]["handle"];
export type CompetitorName = (typeof COMPETITORS)[number]["name"];

// Array de handles para facilitar filtros
export const COMPETITOR_HANDLES = COMPETITORS.map((c) => c.handle);

// Array de nomes para facilitar filtros
export const COMPETITOR_NAMES = COMPETITORS.map((c) => c.name);

/**
 * Verifica se um handle está na lista de concorrentes (case-insensitive)
 * @param handle - Handle a ser verificado
 * @returns boolean indicando se é um concorrente conhecido
 */
export function isKnownCompetitor(handle: string): boolean {
  const cleanHandle = handle.toLowerCase().trim().replace("@", "");
  return COMPETITOR_HANDLES.some(
    (h) => h.toLowerCase().trim() === cleanHandle
  );
}

/**
 * Busca um concorrente pelo handle (case-insensitive)
 * @param handle - Handle a ser buscado
 * @returns O concorrente encontrado ou undefined
 */
export function findCompetitorByHandle(
  handle: string
): (typeof COMPETITORS)[number] | undefined {
  const cleanHandle = handle.toLowerCase().trim().replace("@", "");
  return COMPETITORS.find(
    (c) => c.handle.toLowerCase().trim() === cleanHandle
  );
}

/**
 * Filtro robusto para dados do Apify - verifica se o perfil corresponde
 * a um dos concorrentes conhecidos (case-insensitive, partial match)
 * @param profile - Perfil retornado pelo Apify
 * @returns boolean indicando se deve ser incluído
 */
export function filterApifyCompetitor(profile: {
  username?: string;
  fullName?: string;
}): boolean {
  const searchTerms = [
    profile.username?.toLowerCase() || "",
    profile.fullName?.toLowerCase() || "",
  ];

  return COMPETITORS.some((competitor) => {
    const handleLower = competitor.handle.toLowerCase();
    const nameLower = competitor.name.toLowerCase();

    return searchTerms.some(
      (term) =>
        term.includes(handleLower) ||
        handleLower.includes(term) ||
        term.includes(nameLower) ||
        nameLower.includes(term)
    );
  });
}

/**
 * Filtro para array de perfis do Apify
 * @param profiles - Array de perfis retornados pelo Apify
 * @returns Array filtrado contendo apenas concorrentes conhecidos
 */
export function filterApifyCompetitors<T extends { username?: string; fullName?: string }>(
  profiles: T[]
): T[] {
  return profiles.filter(filterApifyCompetitor);
}
