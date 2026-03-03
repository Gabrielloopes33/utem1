"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Bot,
  BookOpen,
  GitBranch,
  Settings,
  MessageSquare,
  ChevronDown,
  MoreHorizontal,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { AutemLogo } from "@/components/shared/autem-logo"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  children?: { name: string; href: string; icon?: string }[]
}

const mainNav: NavItem[] = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agentes", href: "/agents", icon: MessageSquare },
]

const workspaceNav: NavItem[] = [
  { name: "Base de Conhecimento", href: "/knowledge", icon: BookOpen },
  { name: "Campanhas", href: "/campanhas", icon: GitBranch },
  { name: "Personas", href: "/personas", icon: UserCircle },
]

const accountNav: NavItem[] = [
  { name: "Configurações", href: "/settings", icon: Settings },
]

interface NavSectionProps {
  label: string
  items: NavItem[]
  pathname: string
  isCollapsed: boolean
}

function NavSection({
  label,
  items,
  pathname,
  isCollapsed,
}: NavSectionProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  function toggleExpand(name: string) {
    setExpandedItems((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <div className={cn("space-y-0.5", isCollapsed && "space-y-1")}>
      {label && !isCollapsed && (
        <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
      )}
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/")
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = expandedItems[item.name] ?? isActive

        const linkContent = (
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg transition-colors",
              isCollapsed
                ? "justify-center px-2 py-2"
                : "flex-1 px-3 py-[7px]",
              isActive
                ? "bg-sidebar-accent text-white"
                : "text-gray-100 hover:bg-white/10 hover:text-white",
              !isCollapsed && "text-[13px] font-medium"
            )}
          >
            <item.icon className={cn(
              "shrink-0 opacity-70",
              isCollapsed ? "h-5 w-5" : "h-[18px] w-[18px]"
            )} />
            {!isCollapsed && <span>{item.name}</span>}
          </Link>
        )

        return (
          <div key={item.name}>
            {isCollapsed ? (
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-popover text-popover-foreground border">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center">
                {linkContent}
                {hasChildren && (
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className="mr-1 rounded p-1 text-gray-300 hover:bg-white/10 hover:text-white"
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
            )}
            {!isCollapsed && hasChildren && isExpanded && (
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
                          ? "text-white font-medium"
                          : "text-gray-300 hover:text-white"
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
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "flex flex-col border-r border-sidebar-border bg-sidebar font-sans transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[64px]" : "w-[240px]"
        )}
      >
        {/* Logo AUTEM */}
        <div className={cn(
          "flex h-16 items-center",
          isCollapsed ? "justify-center px-2" : "px-4"
        )}>
          <Link href="/dashboard" className="flex items-center">
            {isCollapsed ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <span className="text-sm font-bold text-white">A</span>
              </div>
            ) : (
              <AutemLogo className="h-20 w-auto" />
            )}
          </Link>
        </div>

        {/* Collapse Toggle Button - No meio superior */}
        <div className={cn(
          "flex justify-center py-2",
          isCollapsed ? "px-2" : "px-4"
        )}>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  "flex items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent/50 text-gray-300 transition-all hover:bg-sidebar-accent hover:text-white",
                  isCollapsed ? "h-8 w-8" : "h-7 w-full gap-2 px-3"
                )}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <>
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Recolher</span>
                  </>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover text-popover-foreground border">
              <span>{isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}</span>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 overflow-y-auto py-2 space-y-4 scrollbar-thin",
          isCollapsed ? "px-2" : "px-2"
        )}>
          <NavSection
            label=""
            items={mainNav}
            pathname={pathname}
            isCollapsed={isCollapsed}
          />
          <NavSection
            label={isCollapsed ? "" : "Workspace"}
            items={workspaceNav}
            pathname={pathname}
            isCollapsed={isCollapsed}
          />
          <NavSection
            label={isCollapsed ? "" : "Conta"}
            items={accountNav}
            pathname={pathname}
            isCollapsed={isCollapsed}
          />
        </nav>

        {/* Bottom — More */}
        <div className="border-t border-sidebar-border px-2 py-2">
          {isCollapsed ? (
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button className="flex w-full items-center justify-center rounded-lg px-2 py-2 text-gray-100 hover:bg-white/10 hover:text-white transition-colors">
                  <MoreHorizontal className="h-5 w-5 opacity-70" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover text-popover-foreground border">
                <span className="font-medium">Mais opções</span>
              </TooltipContent>
            </Tooltip>
          ) : (
            <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium text-gray-100 hover:bg-white/10 hover:text-white transition-colors">
              <MoreHorizontal className="h-[18px] w-[18px] opacity-70" />
              <span>Mais</span>
            </button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
