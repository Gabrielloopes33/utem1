"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Card, CardContent } from "../../../components/ui/card"
import { createClient } from "../../../lib/supabase/client"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      // CORREÇÃO: Usa window.location.href em vez de router.push()
      // Isso força full page reload, buscando HTML fresco com manifest correto
      // Evita problema de chunks 404 quando o manifest cacheado é de build antigo
      window.location.href = "/dashboard"
    } catch {
      toast.error("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-accent-500 hover:bg-accent-600"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/register" className="text-accent-500 hover:underline">
            Criar conta
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
