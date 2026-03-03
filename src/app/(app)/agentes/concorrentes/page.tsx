"use client";

import { useState } from "react";
import {
  Users,
  RefreshCw,
  Plus,
  Instagram,
  TrendingUp,
  TrendingDown,
  Heart,
  MessageCircle,
  Image,
  Film,
  Layers,
  ExternalLink,
  AlertCircle,
  Search,
  BarChart3,
  Eye,
  Clock,
  Database,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompetitors } from "@/hooks/use-competitors";
import { AgentLoadingAnimation } from "@/components/shared/agent-loading-animation";
import Link from "next/link";

// Formata número para exibição (1.2K, 1.5M, etc)
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Formata data relativa
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffHours < 1) return "Agora";
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d`;
  return date.toLocaleDateString("pt-BR");
}

export default function ConcorrentesPage() {
  const {
    competitors,
    isLoading,
    error,
    refresh,
    metrics,
    isLoadingMetrics,
    selectedCompetitor,
    selectedPosts,
    isLoadingDetail,
    selectCompetitor,
    refreshCompetitor,
    addCompetitor,
    clearSelection,
  } = useCompetitors();

  const [newHandle, setNewHandle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCompetitors = competitors.filter(
    (c) =>
      c.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleAddCompetitor(e: React.FormEvent) {
    e.preventDefault();
    if (!newHandle.trim()) return;

    setIsAdding(true);
    try {
      await addCompetitor(newHandle);
      setNewHandle("");
    } finally {
      setIsAdding(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <AgentLoadingAnimation />
      </div>
    );
  }

  if (error) {
    const isSetupError = error.includes("relation") || error.includes("does not exist") || error.includes("não existe");
    
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-muted-foreground max-w-md text-center">{error}</p>
        
        {isSetupError && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 max-w-md">
            <p className="text-sm text-amber-700 font-medium mb-2">⚠️ Configuração necessária</p>
            <p className="text-xs text-amber-600 mb-3">
              As tabelas do banco de dados não foram criadas. Você precisa executar a migration no Supabase.
            </p>
            <ol className="text-xs text-amber-600 list-decimal list-inside space-y-1">
              <li>Acesse o <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
              <li>Vá em SQL Editor → New Query</li>
              <li>Cole o conteúdo do arquivo <code>supabase/migrations/002_create_agentes_tables.sql</code></li>
              <li>Clique em Run</li>
            </ol>
          </div>
        )}
        
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Análise de Concorrentes</h1>
            <p className="text-sm text-muted-foreground">
              Monitore seus concorrentes no Instagram
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/agentes/concorrentes/importar">
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Importar
            </Button>
          </Link>
          
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-accent-500 hover:bg-accent-600">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Concorrente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCompetitor} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username do Instagram</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                    <Input
                      placeholder="xpinvestimentos"
                      value={newHandle}
                      onChange={(e) => setNewHandle(e.target.value)}
                      className="pl-8"
                      disabled={isAdding}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Digite o username sem o @. Os dados serão coletados automaticamente.
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-accent-500 hover:bg-accent-600"
                  disabled={isAdding || !newHandle.trim()}
                >
                  {isAdding ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar e Adicionar
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Métricas Gerais */}
      {!isLoadingMetrics && metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Concorrentes</span>
              </div>
              <p className="text-2xl font-bold">{metrics.summary.totalCompetitors}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Seguidores Totais</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(metrics.summary.totalFollowers)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Engajamento Médio</span>
              </div>
              <p className="text-2xl font-bold">{metrics.summary.avgEngagement.toFixed(1)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Instagram className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Posts Analisados</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(metrics.summary.totalPostsAnalyzed)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content */}
      <Tabs defaultValue="grid" className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar concorrente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Grid View */}
        <TabsContent value="grid" className="space-y-4">
          {filteredCompetitors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhum concorrente encontrado" : "Nenhum concorrente cadastrado"}
              </p>
              {!searchTerm && (
                <p className="text-sm text-muted-foreground mt-1">
                  Clique em "Adicionar" para começar
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompetitors.map((competitor) => (
                <Card
                  key={competitor.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => selectCompetitor(competitor.handle)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {competitor.profile_pic_url ? (
                          <img
                            src={competitor.profile_pic_url}
                            alt={competitor.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Instagram className="h-6 w-6 text-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{competitor.name}</h3>
                          {competitor.isStale && (
                            <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatRelativeDate(competitor.last_scraped_at)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{competitor.handle}</p>

                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="text-center">
                            <p className="text-lg font-bold">{formatNumber(competitor.followers_count)}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Seguidores</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold">{competitor.engagement_rate.toFixed(1)}%</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Engajamento</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold">{formatNumber(competitor.posts_count)}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Posts</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* List View */}
        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              {filteredCompetitors.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Nenhum concorrente encontrado</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredCompetitors.map((competitor) => (
                    <div
                      key={competitor.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => selectCompetitor(competitor.handle)}
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {competitor.profile_pic_url ? (
                          <img
                            src={competitor.profile_pic_url}
                            alt={competitor.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Instagram className="h-5 w-5 text-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{competitor.name}</p>
                        <p className="text-sm text-muted-foreground">@{competitor.handle}</p>
                      </div>

                      <div className="hidden sm:grid grid-cols-3 gap-8 text-center">
                        <div>
                          <p className="font-semibold">{formatNumber(competitor.followers_count)}</p>
                          <p className="text-xs text-muted-foreground">Seguidores</p>
                        </div>
                        <div>
                          <p className="font-semibold">{competitor.engagement_rate.toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">Engajamento</p>
                        </div>
                        <div>
                          <p className="font-semibold">{formatNumber(competitor.posts_count)}</p>
                          <p className="text-xs text-muted-foreground">Posts</p>
                        </div>
                      </div>

                      {competitor.isStale && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/30 hidden sm:flex">
                          <Clock className="h-3 w-3 mr-1" />
                          Desatualizado
                        </Badge>
                      )}

                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance View */}
        <TabsContent value="performance">
          {!isLoadingMetrics && metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance por Tipo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance por Tipo de Conteúdo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics.contentPerformance.map((item) => (
                      <div key={item.type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {item.type === "Carrossel" && <Layers className="h-4 w-4" />}
                            {item.type === "Reels" && <Film className="h-4 w-4" />}
                            {item.type === "Cards" && <Image className="h-4 w-4" />}
                            {item.type}
                          </span>
                          <span className="font-medium">{item.value}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full transition-all duration-500`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ranking de Concorrentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ranking por Engajamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...metrics.competitors]
                      .sort((a, b) => b.engagement - a.engagement)
                      .map((comp, index) => (
                        <div
                          key={comp.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => selectCompetitor(comp.handle)}
                        >
                          <span className="text-lg font-bold text-muted-foreground w-6">{index + 1}</span>
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {comp.profilePicUrl ? (
                              <img src={comp.profilePicUrl} alt={comp.name} className="h-full w-full object-cover" />
                            ) : (
                              <Instagram className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{comp.name}</p>
                            <p className="text-xs text-muted-foreground">@{comp.handle}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-accent-500">{comp.engagement.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground">Engajamento</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      {selectedCompetitor && (
        <Dialog open={!!selectedCompetitor} onOpenChange={(open) => !open && clearSelection()}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {selectedCompetitor.profile_pic_url ? (
                      <img
                        src={selectedCompetitor.profile_pic_url}
                        alt={selectedCompetitor.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Instagram className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedCompetitor.name}</DialogTitle>
                    <p className="text-muted-foreground">@{selectedCompetitor.handle}</p>
                    {selectedCompetitor.biography && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2 max-w-md">
                        {selectedCompetitor.biography}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedCompetitor.isStale && (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                      <Clock className="h-3 w-3 mr-1" />
                      Desatualizado
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshCompetitor(selectedCompetitor.handle)}
                    disabled={isLoadingDetail}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingDetail ? "animate-spin" : ""}`} />
                    Atualizar
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <AgentLoadingAnimation />
              </div>
            ) : (
              <div className="space-y-6 mt-4">
                {/* Métricas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">{formatNumber(selectedCompetitor.followers_count)}</p>
                      <p className="text-xs text-muted-foreground">Seguidores</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-accent-500">
                        {selectedCompetitor.engagement_rate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Engajamento</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">{formatNumber(selectedCompetitor.avg_likes)}</p>
                      <p className="text-xs text-muted-foreground">Média de Curtidas</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">{selectedCompetitor.posts_per_month}</p>
                      <p className="text-xs text-muted-foreground">Posts/Mês</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Breakdown de Conteúdo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Tipos de Conteúdo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Layers className="h-6 w-6 mx-auto mb-2 text-accent-500" />
                        <p className="text-xl font-bold">{selectedCompetitor.content_breakdown?.carousel || 0}</p>
                        <p className="text-xs text-muted-foreground">Carrosséis</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Film className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-xl font-bold">{selectedCompetitor.content_breakdown?.reels || 0}</p>
                        <p className="text-xs text-muted-foreground">Reels</p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <Image className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xl font-bold">{selectedCompetitor.content_breakdown?.image || 0}</p>
                        <p className="text-xs text-muted-foreground">Imagens</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts Recentes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Posts Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPosts.slice(0, 5).map((post) => (
                        <a
                          key={post.id}
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                        >
                          <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {post.thumbnail_url ? (
                              <img
                                src={post.thumbnail_url}
                                alt="Post"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Instagram className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm line-clamp-2 group-hover:text-accent-500 transition-colors">
                              {post.caption || "Sem legenda"}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {formatNumber(post.likes)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {formatNumber(post.comments)}
                              </span>
                              <Badge variant="secondary" className="text-[10px]">
                                {post.media_type === "carousel" && "Carrossel"}
                                {post.media_type === "reel" && "Reels"}
                                {post.media_type === "image" && "Imagem"}
                              </Badge>
                              {post.timestamp && (
                                <span>{formatRelativeDate(post.timestamp)}</span>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
