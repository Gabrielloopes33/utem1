import { Bot, Sparkles, Users, GitBranch } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between bg-ink-900 p-10 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500">
            <Bot className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-display text-xl font-bold">Time</span>
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-3xl font-bold leading-tight">
            Gerencie sua
            <br />
            AI Workforce.
          </h2>
          <p className="text-sm leading-relaxed text-white/60 max-w-[320px]">
            Crie agentes inteligentes, organize squads e automatize workflows
            com os melhores modelos de IA.
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
                <Users className="h-4 w-4 text-accent-500" />
              </div>
              <span>Squads colaborativos</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/8">
                <GitBranch className="h-4 w-4 text-accent-500" />
              </div>
              <span>Workflows automatizados</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-white/30">
          Time v0.1 &middot; NexIA Lab
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-2 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold">Time</h1>
            <p className="text-sm text-muted-foreground">AI Workforce Platform</p>
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
