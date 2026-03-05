import { getDashboardMetrics } from "../../../lib/data/dashboard"
import { DashboardClient } from "./dashboard-client"

/**
 * Dashboard Page - Server Component
 * Busca dados no servidor e renderiza HTML estático
 * Zero JavaScript de bundle para esta página
 */
export default async function DashboardPage() {
  // Buscar métricas no servidor (caching automático)
  const metrics = await getDashboardMetrics()

  // Renderizar Client Component com dados iniciais
  return <DashboardClient initialMetrics={metrics} />
}
