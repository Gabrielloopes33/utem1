"use client"

import { Sidebar } from "./sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-[1200px] px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
