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
            width={240}
            height={72}
            className="h-20 w-auto"
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
              width={280}
              height={80}
              className="h-16 w-auto"
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
