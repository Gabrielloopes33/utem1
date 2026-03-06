"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"login" | "loading">("login")

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

      // Login bem-sucedido - mostrar tela de carregamento
      setStep("loading")

      // Aguardar um momento para mostrar a mensagem, depois redirecionar
      setTimeout(() => {
        window.location.href = "/"
      }, 1500)

    } catch {
      toast.error("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  // Tela de carregando após login
  if (step === "loading") {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-accent-500 to-purple-600 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold">Entrando...</h2>
              <p className="text-sm text-muted-foreground">
                Redirecionando para o dashboard
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
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
