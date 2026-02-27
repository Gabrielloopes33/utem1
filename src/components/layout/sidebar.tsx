"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Bot,
  Users,
  GitBranch,
  BookOpen,
  Settings,
  MessageSquare,
  Wrench,
  ChevronDown,
  BarChart3,
  Key,
  MoreHorizontal,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  children?: { name: string; href: string; icon?: string }[]
}

const mainNav: NavItem[] = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chat", href: "/chat", icon: MessageSquare },
]

const workforceNav: NavItem[] = [
  {
    name: "Agentes",
    href: "/agents",
    icon: Bot,
  },
  { name: "Tools", href: "/tools", icon: Wrench },
  { name: "Squads", href: "/squads", icon: Users },
  { name: "Knowledge", href: "/knowledge", icon: BookOpen },
]

const automationNav: NavItem[] = [
  { name: "Workflows", href: "/workflows", icon: GitBranch },
]

const accountNav: NavItem[] = [
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "API Keys", href: "/settings", icon: Key },
  { name: "Configurações", href: "/settings", icon: Settings },
]

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string
  items: NavItem[]
  pathname: string
}) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  function toggleExpand(name: string) {
    setExpandedItems((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <div className="space-y-0.5">
      {label && (
        <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          {label}
        </p>
      )}
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/")
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = expandedItems[item.name] ?? isActive

        return (
          <div key={item.name}>
            <div className="flex items-center">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-1 items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0 opacity-70" />
                <span>{item.name}</span>
              </Link>
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(item.name)}
                  className="mr-1 rounded p-1 text-muted-foreground hover:bg-muted/60"
                >
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
              )}
            </div>
            {hasChildren && isExpanded && (
              <div className="ml-5 space-y-0.5 border-l border-sidebar-border pl-3 mt-0.5">
                {item.children!.map((child) => {
                  const childActive = pathname === child.href
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2.5 py-[5px] text-[13px] transition-colors",
                        childActive
                          ? "text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/70 hover:text-foreground"
                      )}
                    >
                      {child.icon && (
                        <span className="text-xs">{child.icon}</span>
                      )}
                      <span>{child.name}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-[240px] flex-col border-r border-sidebar-border bg-sidebar">
      {/* User / Org header */}
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-500">
            <Bot className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground leading-tight">
              Time
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              AI Workforce
            </span>
          </div>
        </Link>
        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4 scrollbar-thin">
        <NavSection label="" items={mainNav} pathname={pathname} />
        <NavSection label="Workforce" items={workforceNav} pathname={pathname} />
        <NavSection label="Automação" items={automationNav} pathname={pathname} />
        <NavSection label="Conta" items={accountNav} pathname={pathname} />
      </nav>

      {/* Bottom — More */}
      <div className="border-t border-sidebar-border px-2 py-2">
        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium text-sidebar-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
          <MoreHorizontal className="h-[18px] w-[18px] opacity-70" />
          <span>Mais</span>
        </button>
      </div>
    </aside>
  )
}
