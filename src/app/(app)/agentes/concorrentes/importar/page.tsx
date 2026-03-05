"use client";

import { useState } from "react";
import { ArrowLeft, Database, Upload, Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import Link from "next/link";

export default function ImportarPage() {
  const [datasetId, setDatasetId] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; data: { handle: string; followers: number; posts: number } } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!datasetId || !username) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/concorrentes/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId, username: username.replace("@", "") }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/agentes/concorrentes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Importar do Apify</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Importar Dataset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleImport} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="datasetId">Dataset ID do Apify</Label>
              <Input
                id="datasetId"
                placeholder="Ex: dI4NZqGJ4r8fFCKa7"
                value={datasetId}
                onChange={(e) => setDatasetId(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Encontre em: Apify Console → Storage → Datasets
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username do Instagram</Label>
              <Input
                id="username"
                placeholder="Ex: xpinvestimentos"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-accent-500 hover:bg-accent-600"
              disabled={isLoading || !datasetId || !username}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Dados
                </>
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-700">Erro na importação</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-700">Importação concluída!</p>
                <p className="text-sm text-green-600">
                  <strong>@{result.data.handle}</strong> foi importado com sucesso.
                </p>
                <ul className="text-sm text-green-600 mt-2 space-y-1">
                  <li>• {result.data.followers.toLocaleString()} seguidores</li>
                  <li>• {result.data.posts} posts importados</li>
                </ul>
                <Link href="/agentes/concorrentes">
                  <Button variant="link" className="text-green-700 p-0 h-auto mt-2">
                    Ver concorrentes →
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Importar em Lote */}
      <Card className="bg-accent-500/5 border-accent-500/20">
        <CardHeader>
          <CardTitle className="text-sm">Importar Vários de Uma Vez</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Tem múltiplos datasets? Importe todos de uma vez.
          </p>
          <Link href="/agentes/concorrentes/importar/lote">
            <Button variant="outline" className="w-full border-accent-500/30">
              <Upload className="h-4 w-4 mr-2" />
              Importar em Lote
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Como encontrar o Dataset ID</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ol className="list-decimal list-inside space-y-1">
            <li>Acesse <a href="https://console.apify.com" target="_blank" rel="noopener noreferrer" className="text-accent-500 hover:underline">console.apify.com</a></li>
            <li>No menu lateral, clique em <strong>Storage</strong></li>
            <li>Selecione <strong>Datasets</strong></li>
            <li>Clique no dataset que contém seus dados</li>
            <li>Copie o ID (ex: <code>dI4NZqGJ4r8fFCKa7</code>)</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
