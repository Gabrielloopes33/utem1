"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Target,
  BarChart3,
  FileText,
  Megaphone,
  SlidersHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { AutemLogo } from "@/components/shared/autem-logo"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavSubItem {
  name: string
  href: string
}

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  children?: NavSubItem[]
}

const mainNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
]

const agentesNav: NavItem[] = [
  {
    name: "Conteúdo Generalista",
    href: "/agentes/conteudo",
    icon: FileText,
    children: [{ name: "Histórico de Posts", href: "/agentes/conteudo/historico" }],
  },
  {
    name: "Campanhas",
    href: "/agentes/campanhas",
    icon: Megaphone,
    children: [{ name: "Histórico de Campanhas", href: "/agentes/campanhas/historico" }],
  },
  { name: "Ajustes dos Agentes", href: "/agentes/ajustes", icon: SlidersHorizontal },
  { name: "Análise de Concorrentes", href: "/agentes/concorrentes", icon: BarChart3 },
]

const workspaceNav: NavItem[] = [
  { name: "Campanhas", href: "/campanhas", icon: Target },
  { name: "Base de Conhecimento", href: "/knowledge", icon: BookOpen },
  { name: "Personas", href: "/personas", icon: Users },
]

interface NavItemProps {
  item: NavItem
  isCollapsed: boolean
  pathname: string
  isExpanded?: boolean
  onToggleExpand?: () => void
}

function NavItemComponent({ item, isCollapsed, pathname, isExpanded, onToggleExpand }: NavItemProps) {
  const hasChildren = !!(item.children?.length)
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
  const isChildActive = item.children?.some(
    (c) => pathname === c.href || pathname.startsWith(c.href + "/")
  )
  const isAnyActive = isActive || !!isChildActive

  const activeClass = "bg-[#1e3a5f] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
  const inactiveClass = "text-gray-400 hover:bg-[#0d2136] hover:text-white"

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "flex items-center justify-center h-11 w-11 mx-auto rounded-xl transition-all duration-200",
              isAnyActive ? activeClass : inactiveClass
            )}
          >
            <item.icon className="shrink-0 h-5 w-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-[#0d2136] text-white border-[#1e3a5f] px-3 py-2">
          <span className="font-medium">{item.name}</span>
        </TooltipContent>
      </Tooltip>
    )
  }

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
          isAnyActive ? activeClass : inactiveClass
        )}
      >
        <item.icon className="shrink-0 h-[18px] w-[18px]" />
        <span className="text-[13px] font-medium">{item.name}</span>
      </Link>
    )
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center rounded-xl transition-all duration-200",
          isAnyActive ? activeClass : inactiveClass
        )}
      >
        <Link 
          href={item.href} 
          className="flex items-center gap-3 flex-1 px-4 py-3 min-w-0"
          onClick={() => {
            // Expandir o submenu ao clicar no link (se tiver children)
            if (hasChildren && !isExpanded && onToggleExpand) {
              onToggleExpand()
            }
          }}
        >
          <item.icon className="shrink-0 h-[18px] w-[18px]" />
          <span className="flex-1 text-[13px] font-medium leading-snug">{item.name}</span>
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand?.()
          }}
          className="px-3 py-3 shrink-0 hover:bg-white/10 rounded-lg transition-colors"
          aria-label={isExpanded ? "Recolher submenu" : "Expandir submenu"}
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-1 ml-3 pl-3 border-l border-[#1a3a5c] space-y-0.5">
          {item.children!.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                "flex items-center py-2 px-3 rounded-lg text-[12px] transition-all duration-200",
                pathname === child.href
                  ? "text-white bg-[#1e3a5f]"
                  : "text-gray-500 hover:text-gray-300 hover:bg-[#0d2136]"
              )}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Auto-expandir menu quando estiver em uma página filha
  useEffect(() => {
    agentesNav.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(
          child => pathname === child.href || pathname.startsWith(child.href + "/")
        )
        if (isChildActive && !expandedItems.has(item.href)) {
          setExpandedItems(prev => new Set([...prev, item.href]))
        }
      }
    })
  }, [pathname])

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(href)) {
        next.delete(href)
      } else {
        next.add(href)
      }
      return next
    })
  }

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className="flex flex-col"
        style={{
          width: isCollapsed
            ? "var(--sidebar-width-collapsed)"
            : "var(--sidebar-width-expanded)",
          transition: "width 300ms ease-in-out",
        }}
      >
        {/* Container flutuante */}
        <div
          className={cn(
            "flex flex-col h-[calc(100vh-24px)] m-3 rounded-2xl bg-[#04132a]",
            "shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)]",
            "border border-[#0d2136] overflow-hidden"
          )}
        >
          {/* Header com Logo */}
          <div
            className={cn(
              "flex items-center justify-center p-4",
              isCollapsed && "p-3"
            )}
          >
            <AutemLogo
              className={cn(
                "object-contain",
                isCollapsed ? "h-20 w-20" : "h-24 w-auto"
              )}
            />
          </div>

          {/* Divider */}
          <div className="mx-4 h-px bg-[#0d2136]" />

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin">
            {/* Home / Dashboard */}
            <NavItemComponent
              item={mainNav[0]}
              isCollapsed={isCollapsed}
              pathname={pathname}
            />

            {/* Seção Agentes */}
            {!isCollapsed && (
              <p className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                Agentes
              </p>
            )}
            {isCollapsed && <div className="h-2" />}

            {agentesNav.map((item) => (
              <NavItemComponent
                key={item.href}
                item={item}
                isCollapsed={isCollapsed}
                pathname={pathname}
                isExpanded={expandedItems.has(item.href)}
                onToggleExpand={() => toggleExpand(item.href)}
              />
            ))}

            {/* Seção Workspace */}
            {!isCollapsed && (
              <p className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                Workspace
              </p>
            )}
            {isCollapsed && <div className="h-2" />}

            {workspaceNav.map((item) => (
              <NavItemComponent
                key={item.href}
                item={item}
                isCollapsed={isCollapsed}
                pathname={pathname}
              />
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-[#0d2136] p-2 space-y-1">
            {/* Configurações */}
            <NavItemComponent
              item={{ name: "Configurações", href: "/settings", icon: Settings }}
              isCollapsed={isCollapsed}
              pathname={pathname}
            />

            {/* Minha Conta / Avatar */}
            <Link
              href="/profile"
              className={cn(
                "flex items-center gap-3 rounded-xl transition-all duration-200",
                isCollapsed
                  ? "justify-center h-11 w-11 mx-auto"
                  : "px-3 py-2.5",
                pathname === "/profile"
                  ? "bg-[#1e3a5f] text-white"
                  : "text-gray-400 hover:bg-[#0d2136] hover:text-white"
              )}
            >
              <div className="flex shrink-0 items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-[#5B8DEF] to-[#8B5CF6] text-white text-xs font-semibold">
                GM
              </div>
              {!isCollapsed && (
                <span className="text-[13px] font-medium">Minha Conta</span>
              )}
            </Link>

            {/* Botão Recolher */}
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={cn(
                    "flex items-center gap-3 w-full rounded-xl transition-all duration-200",
                    "text-gray-500 hover:bg-[#0d2136] hover:text-gray-300",
                    isCollapsed
                      ? "justify-center h-11 w-11 mx-auto mt-2"
                      : "px-4 py-2.5 mt-1"
                  )}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <>
                      <ChevronLeft className="h-4 w-4" />
                      <span className="text-[13px]">Recolher</span>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-[#0d2136] text-white border-[#1e3a5f]"
              >
                <span>{isCollapsed ? "Expandir" : "Recolher"}</span>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
