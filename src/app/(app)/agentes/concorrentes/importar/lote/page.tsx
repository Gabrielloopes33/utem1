"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Database, Check, AlertCircle, Loader2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../components/ui/card";
import { Button } from "../../../../../../components/ui/button";
import { Label } from "../../../../../../components/ui/label";
import { Checkbox } from "../../../../../../components/ui/checkbox";
import Link from "next/link";

interface Profile {
  username: string;
  fullName: string;
  followers: number;
  postsCount: number;
  profilePicUrl?: string;
}

export default function ImportarLotePage() {
  const [datasetIds, setDatasetIds] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Array<{ username: string; success: boolean; data?: Profile; error?: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  async function analyzeDatasets() {
    if (!datasetIds.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setProfiles([]);
    setResults([]);

    const ids = datasetIds.split("\n").map(id => id.trim()).filter(Boolean);
    const allProfiles: Profile[] = [];

    try {
      for (const datasetId of ids) {
        console.log(`Analisando dataset: ${datasetId}`);
        
        const response = await fetch("/api/concorrentes/import/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ datasetId }),
        });

        const data = await response.json();

        if (!data.success) {
          console.error(`Erro no dataset ${datasetId}:`, data.error);
          continue;
        }

        allProfiles.push(...data.data);
      }

      // Remover duplicados
      const uniqueProfiles = Array.from(
        new Map(allProfiles.map(p => [p.username, p])).values()
      );

      setProfiles(uniqueProfiles);
      setSelectedProfiles(new Set(uniqueProfiles.map(p => p.username)));

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao analisar datasets");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function importSelected() {
    if (selectedProfiles.size === 0) return;

    setIsImporting(true);
    setError(null);
    const importResults: Array<{ username: string; success: boolean; data?: Profile; error?: string }> = [];

    const ids = datasetIds.split("\n").map(id => id.trim()).filter(Boolean);

    for (const username of selectedProfiles) {
      try {
        // Tentar importar de cada dataset até encontrar
        for (const datasetId of ids) {
          const response = await fetch("/api/concorrentes/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ datasetId, username }),
          });

          const data = await response.json();

          if (data.success) {
            importResults.push({ username, success: true, data: data.data });
            break;
          }
        }
      } catch (err) {
        importResults.push({ 
          username, 
          success: false, 
          error: err instanceof Error ? err.message : "Erro" 
        });
      }
    }

    setResults(importResults);
    setIsImporting(false);
  }

  const toggleProfile = (username: string) => {
    const newSelected = new Set(selectedProfiles);
    if (newSelected.has(username)) {
      newSelected.delete(username);
    } else {
      newSelected.add(username);
    }
    setSelectedProfiles(newSelected);
  };

  const selectAll = () => {
    setSelectedProfiles(new Set(profiles.map(p => p.username)));
  };

  const deselectAll = () => {
    setSelectedProfiles(new Set());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/agentes/concorrentes/importar">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Importar em Lote</h1>
      </div>

      {/* Input de Dataset IDs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dataset IDs do Apify
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Cole os Dataset IDs (um por linha)</Label>
            <textarea
              className="w-full h-32 p-3 rounded-md border bg-background text-sm font-mono"
              placeholder="Qjtjf2JhmLY6BV92W&#10;gAZSbm9HN6KzNTwD1&#10;GJtua5AbUmfCDYszs&#10;8rj8mLurnFe55ZcCG"
              value={datasetIds}
              onChange={(e) => setDatasetIds(e.target.value)}
              disabled={isAnalyzing || isImporting}
            />
            <p className="text-xs text-muted-foreground">
              Encontre em: Apify Console → Storage → Datasets
            </p>
          </div>

          <Button
            onClick={analyzeDatasets}
            className="w-full bg-accent-500 hover:bg-accent-600"
            disabled={isAnalyzing || !datasetIds.trim()}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Analisar Datasets
              </>
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Perfis */}
      {profiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {profiles.length} Perfis Encontrados
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Selecionar Todos
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Limpar
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedProfiles.size} selecionados para importação
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {profiles.map((profile) => (
                <div
                  key={profile.username}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedProfiles.has(profile.username)}
                    onCheckedChange={() => toggleProfile(profile.username)}
                  />
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                    {profile.profilePicUrl ? (
                      <Image
                        src={profile.profilePicUrl}
                        alt={profile.username}
                        width={40}
                        height={40}
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-white text-xs font-bold">
                        {profile.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{profile.fullName}</p>
                    <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{profile.followers.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">seguidores</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={importSelected}
              className="w-full mt-4 bg-accent-500 hover:bg-accent-600"
              disabled={isImporting || selectedProfiles.size === 0}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando {results.length}/{selectedProfiles.size}...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Importar {selectedProfiles.size} Perfis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Importação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={result.username}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    result.success ? "bg-green-500/10" : "bg-red-500/10"
                  }`}
                >
                  {result.success ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">@{result.username}</p>
                    {result.success && result.data ? (
                      <p className="text-sm text-green-600">
                        {result.data.followers.toLocaleString()} seguidores • {(result.data as Profile & { posts?: number }).posts ?? 0} posts
                      </p>
                    ) : (
                      <p className="text-sm text-red-600">{result.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Link href="/agentes/concorrentes">
              <Button className="w-full mt-4 bg-accent-500 hover:bg-accent-600">
                Ver Concorrentes Importados →
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
