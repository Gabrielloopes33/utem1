// Lista de concorrentes padrão para análise
// Centralizado para fácil manutenção

export const COMPETITORS = [
  {
    handle: 'xpinvestimentos',
    name: 'XP Investimentos',
    platform: 'instagram',
    profile_url: 'https://instagram.com/xpinvestimentos',
  },
  {
    handle: 'raulsena',
    name: 'Raul Sena',
    platform: 'instagram',
    profile_url: 'https://instagram.com/raulsena',
  },
  {
    handle: 'primorico',
    name: 'Primo Rico',
    platform: 'instagram',
    profile_url: 'https://instagram.com/primorico',
  },
  {
    handle: 'gemeosdasfinancas',
    name: 'Gêmeos das Finanças',
    platform: 'instagram',
    profile_url: 'https://instagram.com/gemeosdasfinancas',
  },
] as const;

export type CompetitorHandle = typeof COMPETITORS[number]['handle'];
