/**
 * Dados mockados dos 4 concorrentes principais
 * Usado quando o Apify não está disponível ou retorna erro
 */

import type { ApifyInstagramProfile, ApifyInstagramPost } from "./client";

export const MOCK_COMPETITORS: Array<{
  handle: string;
  name: string;
  profile: ApifyInstagramProfile;
  posts: ApifyInstagramPost[];
}> = [
  {
    handle: "xpinvestimentos",
    name: "XP Investimentos",
    profile: {
      id: "mock-xp",
      username: "xpinvestimentos",
      fullName: "XP Investimentos",
      biography: "💜 Investir é sobre você.\n📊 Maior plataforma de investimentos do Brasil\n👇 Acesse o seu relatório de Renda Fixa",
      followersCount: 2850000,
      followsCount: 245,
      postsCount: 3250,
      profilePicUrl: "https://randomuser.me/api/portraits/men/1.jpg",
      verified: true,
      private: false,
      latestPosts: [],
    },
    posts: [
      {
        id: "post1",
        type: "Carousel" as const,
        shortCode: "ABC123",
        caption: "📊 5 dicas para começar a investir em 2024. Thread completa com os melhores insights!",
        url: "https://instagram.com/p/ABC123",
        commentsCount: 245,
        likesCount: 15420,
        timestamp: "2024-01-15T10:00:00Z",
        displayUrl: "https://picsum.photos/400/400?random=1",
      },
      {
        id: "post2",
        type: "Reel" as const,
        shortCode: "DEF456",
        caption: "🎬 Entenda o que são FIIs em 60 segundos! #investimentos #fii",
        url: "https://instagram.com/p/DEF456",
        commentsCount: 189,
        likesCount: 23100,
        timestamp: "2024-01-14T15:30:00Z",
        displayUrl: "https://picsum.photos/400/400?random=2",
      },
      {
        id: "post3",
        type: "Image" as const,
        shortCode: "GHI789",
        caption: "💡 Por que diversificar sua carteira? Conheça nossas recomendações de CDBs!",
        url: "https://instagram.com/p/GHI789",
        commentsCount: 312,
        likesCount: 18900,
        timestamp: "2024-01-13T09:15:00Z",
        displayUrl: "https://picsum.photos/400/400?random=3",
      },
    ],
  },
  {
    handle: "raulsena",
    name: "Raul Sena",
    profile: {
      id: "mock-raul",
      username: "raulsena",
      fullName: "Raul Sena",
      biography: "📚 Professor de Finanças\n🎯 Especialista em Renda Fixa\n💰 Meu objetivo: ensinar você a investir melhor\n🎙️ Podcast Investidor Inteligente",
      followersCount: 890000,
      followsCount: 156,
      postsCount: 1840,
      profilePicUrl: "https://randomuser.me/api/portraits/men/2.jpg",
      verified: true,
      private: false,
      latestPosts: [],
    },
    posts: [
      {
        id: "post4",
        type: "Carousel" as const,
        shortCode: "JKL012",
        caption: "🔍 Análise completa do Tesouro Selic vs CDB. Qual rende mais?",
        url: "https://instagram.com/p/JKL012",
        commentsCount: 423,
        likesCount: 12800,
        timestamp: "2024-01-15T08:00:00Z",
        displayUrl: "https://picsum.photos/400/400?random=4",
      },
      {
        id: "post5",
        type: "Reel" as const,
        shortCode: "MNO345",
        caption: "⚠️ 3 erros que iniciantes cometem na renda fixa",
        url: "https://instagram.com/p/MNO345",
        commentsCount: 567,
        likesCount: 18200,
        timestamp: "2024-01-14T12:00:00Z",
        displayUrl: "https://picsum.photos/400/400?random=5",
      },
    ],
  },
  {
    handle: "primorico",
    name: "Primo Rico",
    profile: {
      id: "mock-primo",
      username: "primorico",
      fullName: "Thiago Nigro",
      biography: "🚀 Tire seus sonhos do papel\n📈 Maior influenciador de finanças do BR\n🎥 YouTube: Me Poupe!\n💜 Autor: 'Do Mil ao Milhão'",
      followersCount: 5200000,
      followsCount: 89,
      postsCount: 4100,
      profilePicUrl: "https://randomuser.me/api/portraits/men/3.jpg",
      verified: true,
      private: false,
      latestPosts: [],
    },
    posts: [
      {
        id: "post6",
        type: "Carousel" as const,
        shortCode: "PQR678",
        caption: "💸 Como sair das dívidas em 6 meses? Plano passo a passo!",
        url: "https://instagram.com/p/PQR678",
        commentsCount: 890,
        likesCount: 45200,
        timestamp: "2024-01-15T14:00:00Z",
        displayUrl: "https://picsum.photos/400/400?random=6",
      },
      {
        id: "post7",
        type: "Image" as const,
        shortCode: "STU901",
        caption: "🎯 Meta de 2024: Independência Financeira. E você, qual a sua?",
        url: "https://instagram.com/p/STU901",
        commentsCount: 1250,
        likesCount: 38900,
        timestamp: "2024-01-14T10:30:00Z",
        displayUrl: "https://picsum.photos/400/400?random=7",
      },
    ],
  },
  {
    handle: "gemeosdasfinancas",
    name: "Gêmeos das Finanças",
    profile: {
      id: "mock-gemeos",
      username: "gemeosdasfinancas",
      fullName: "Gêmeos das Finanças",
      biography: "👬 Nathan e Nathaniel\n📊 Investimentos simplificados\n🏆 1 milhão de alunos\n💡 Conteúdo diário sobre finanças",
      followersCount: 1200000,
      followsCount: 234,
      postsCount: 2150,
      profilePicUrl: "https://randomuser.me/api/portraits/men/4.jpg",
      verified: true,
      private: false,
      latestPosts: [],
    },
    posts: [
      {
        id: "post8",
        type: "Carousel" as const,
        shortCode: "VWX234",
        caption: "📊 Fundos Imobiliários: Guia completo para iniciantes",
        url: "https://instagram.com/p/VWX234",
        commentsCount: 345,
        likesCount: 15600,
        timestamp: "2024-01-15T11:00:00Z",
        displayUrl: "https://picsum.photos/400/400?random=8",
      },
      {
        id: "post9",
        type: "Reel" as const,
        shortCode: "YZA567",
        caption: "🎬 Como começar a investir com R$100 por mês",
        url: "https://instagram.com/p/YZA567",
        commentsCount: 678,
        likesCount: 22400,
        timestamp: "2024-01-14T16:00:00Z",
        displayUrl: "https://picsum.photos/400/400?random=9",
      },
    ],
  },
];

/**
 * Retorna dados mockados para um handle específico
 */
export function getMockCompetitor(handle: string) {
  return MOCK_COMPETITORS.find(
    (c) => c.handle.toLowerCase() === handle.toLowerCase()
  );
}

/**
 * Retorna todos os dados mockados
 */
export function getAllMockCompetitors() {
  return MOCK_COMPETITORS;
}
