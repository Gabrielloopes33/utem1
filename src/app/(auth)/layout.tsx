import { Sparkles, Users, BookOpen, GitBranch } from "lucide-react"
import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between bg-ink-900 p-10 text-white">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-autem.png"
            alt="AUTEM Investimentos"
            width={120}
            height={36}
            className="h-10 w-auto"
            priority
          />
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-3xl font-bold leading-tight">
            Planejador de Conteúdo
            <br />
            da Autem Investimentos
          </h2>
          <p className="text-sm leading-relaxed text-white/60 max-w-[320px]">
            Democratizando o acesso a investimentos de alto nível.
            Crie agentes inteligentes, organize campanhas e automatize workflows
            com IA.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-sm text-white/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8">
                <Sparkles className="h-4 w-4 text-accent-500" />
              </div>
              <span>Agentes com Claude e GPT</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8">
                <BookOpen className="h-4 w-4 text-accent-500" />
              </div>
              <span>Base de Conhecimento Inteligente</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8">
                <GitBranch className="h-4 w-4 text-accent-500" />
              </div>
              <span>Campanhas Automatizadas</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8">
                <Users className="h-4 w-4 text-accent-500" />
              </div>
              <span>Personas de Investidores</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-white/30">
          AUTEM Investimentos &middot; Democratizando o acesso a investimentos de alto nível
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-2 lg:hidden">
            <Image
              src="/logo-autem.png"
              alt="AUTEM Investimentos"
              width={140}
              height={40}
              className="h-12 w-auto"
              priority
            />
            <h1 className="font-display text-xl font-bold text-center">
              Planejador de Conteúdo
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              Democratizando o acesso a investimentos de alto nível
            </p>
          </div>
          <div className="hidden lg:block text-center">
            <h1 className="font-display text-2xl font-bold">Bem-vindo</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Entre na sua conta para continuar
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
