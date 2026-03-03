// Força todas as rotas do app a serem dinâmicas - HTML sempre fresh
export const dynamic = 'force-dynamic'

import { AppShell } from "@/components/layout/app-shell"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
