"use client"

import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [playerName, setPlayerName] = useState<string | null>(null)

  // Fetch player name if we're on a player page
  useEffect(() => {
    const fetchPlayerName = async () => {
      const paths = pathname?.split("/").filter(Boolean) || []
      if (paths[0] === "players" && paths[1]) {
        try {
          const response = await fetch(`/api/players/${paths[1]}/name`)
          if (response.ok) {
            const data = await response.json()
            setPlayerName(data.name)
          }
        } catch (error) {
          console.error("Error fetching player name:", error)
        }
      } else {
        setPlayerName(null)
      }
    }

    fetchPlayerName()
  }, [pathname])

  // Función para obtener el título y breadcrumbs de la página actual
  const getPageInfo = () => {
    const paths = pathname?.split("/").filter(Boolean) || []

    // Mapeo de rutas a títulos legibles
    const routeTitles: Record<string, string> = {
      "": "Dashboard",
      tournaments: "Torneos",
      calendar: "Calendario",
      players: "Jugadores",
      trainings: "Entrenamientos",
      admin: "Administración",
      users: "Usuarios",
      settings: "Configuración",
      profile: "Perfil",
    }

    // Construir breadcrumbs
    const breadcrumbs = paths.map((path, index) => {
      // Special case for player pages
      if (paths[0] === "players" && index === 1 && playerName) {
        return { title: playerName, href: `/${paths.slice(0, index + 1).join("/")}` }
      }

      const title = routeTitles[path] || path.charAt(0).toUpperCase() + path.slice(1)
      const href = `/${paths.slice(0, index + 1).join("/")}`
      return { title, href }
    })

    // Añadir Dashboard al inicio si no estamos en la página principal
    if (pathname !== "/") {
      breadcrumbs.unshift({ title: "Dashboard", href: "/" })
    }

    // Obtener el título de la página actual
    let pageTitle = "Dashboard"
    if (paths.length > 0) {
      if (paths[0] === "players" && paths.length > 1 && playerName) {
        pageTitle = playerName
      } else {
        pageTitle =
          routeTitles[paths[paths.length - 1]] ||
          paths[paths.length - 1].charAt(0).toUpperCase() + paths[paths.length - 1].slice(1)
      }
    }

    return { pageTitle, breadcrumbs }
  }

  const { pageTitle, breadcrumbs } = getPageInfo()

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex flex-col">
          <h1 className={cn("text-xl font-semibold tracking-tight")}>{pageTitle}</h1>
          {breadcrumbs.length > 1 && (
            <nav aria-label="Breadcrumb" className="hidden md:block">
              <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
                {breadcrumbs.map((crumb, index) => (
                  <li key={crumb.href} className="flex items-center">
                    {index > 0 && <ChevronRight className="mx-1 h-4 w-4" />}
                    {index < breadcrumbs.length - 1 ? (
                      <Link href={crumb.href} className="hover:text-secondary">
                        {crumb.title}
                      </Link>
                    ) : (
                      <span className="text-foreground">{crumb.title}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
