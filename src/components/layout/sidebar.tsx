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
  Target,
  Lightbulb,
  BarChart3,
  FileText,
  Megaphone,
  Sparkles,
  ChevronDown,
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
}

// Menu principal - Agente de Tráfego (como na referência)
const mainNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
]

// Menu de Agentes
const agentesNav: NavItem[] = [
  { name: "Agente de Ideias", href: "/agentes/ideias", icon: Lightbulb },
  { name: "Agente de Conteúdo", href: "/agentes/conteudo", icon: FileText },
  { name: "Agente de Campanha", href: "/agentes/campanhas", icon: Megaphone },
  { name: "Análise de Concorrentes", href: "/agentes/concorrentes", icon: BarChart3 },
]

// Menu Workspace
const workspaceNav: NavItem[] = [
  { name: "Campanhas", href: "/campanhas", icon: Target },
  { name: "Base de Conhecimento", href: "/knowledge", icon: BookOpen },
  { name: "Personas", href: "/personas", icon: Users },
]

interface NavItemProps {
  item: NavItem
  isActive: boolean
  isCollapsed: boolean
}

function NavItemComponent({ item, isActive, isCollapsed }: NavItemProps) {
  const content = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-xl transition-all duration-200",
        isCollapsed 
          ? "justify-center h-11 w-11 mx-auto" 
          : "px-4 py-3",
        isActive
          ? "bg-[#1e3a5f] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          : "text-gray-400 hover:bg-[#0d2136] hover:text-white"
      )}
    >
      <item.icon className={cn(
        "shrink-0",
        isCollapsed ? "h-5 w-5" : "h-[18px] w-[18px]",
        isActive && "text-white"
      )} />
      {!isCollapsed && (
        <span className="text-[14px] font-medium">{item.name}</span>
      )}
    </Link>
  )

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent 
          side="right" 
          className="bg-[#0d2136] text-white border-[#1e3a5f] px-3 py-2"
        >
          <span className="font-medium">{item.name}</span>
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "flex flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[80px]" : "w-[280px]"
        )}
      >
        {/* Container flutuante */}
        <div className={cn(
          "flex flex-col h-[calc(100vh-24px)] m-3 rounded-2xl bg-[#04132a]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)]",
          "border border-[#0d2136] overflow-hidden"
        )}>
          {/* Header com Logo e Subtítulo */}
          <div className={cn(
            "flex items-center gap-3 p-4",
            isCollapsed && "justify-center p-3"
          )}>
            {/* Logo/Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B8DEF] to-[#3d7ae8] shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-semibold text-white leading-tight">
                  Autem
                </span>
                <span className="text-[12px] text-gray-400 leading-tight">
                  Marketing de Conteúdo
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mx-4 h-px bg-[#0d2136]" />

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin">
            {/* Home / Dashboard */}
            <NavItemComponent
              item={mainNav[0]}
              isActive={pathname === "/dashboard"}
              isCollapsed={isCollapsed}
            />

            {/* Divider entre seções */}
            {!isCollapsed && (
              <p className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                Agentes
              </p>
            )}
            {isCollapsed && <div className="h-2" />}

            {/* Agentes */}
            {agentesNav.map((item) => (
              <NavItemComponent
                key={item.name}
                item={item}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                isCollapsed={isCollapsed}
              />
            ))}

            {/* Divider entre seções */}
            {!isCollapsed && (
              <p className="px-4 py-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                Workspace
              </p>
            )}
            {isCollapsed && <div className="h-2" />}

            {/* Workspace */}
            {workspaceNav.map((item) => (
              <NavItemComponent
                key={item.name}
                item={item}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                isCollapsed={isCollapsed}
              />
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-[#0d2136] p-2 space-y-1">
            {/* Configurações */}
            <NavItemComponent
              item={{ name: "Configurações", href: "/settings", icon: Settings }}
              isActive={pathname === "/settings"}
              isCollapsed={isCollapsed}
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
              <div className={cn(
                "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5B8DEF] to-[#8B5CF6] text-white font-semibold",
                isCollapsed ? "h-8 w-8 text-xs" : "h-8 w-8 text-xs"
              )}>
                GM
              </div>
              {!isCollapsed && (
                <span className="text-[14px] font-medium">Minha Conta</span>
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
