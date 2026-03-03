// Força o Next.js a nunca pré-cachear o HTML das rotas do app
export const revalidate = 0

import { AppShell } from "@/components/layout/app-shell"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
