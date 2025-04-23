"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { Calendar, Home, Users, Trophy, Settings, UserCog, LogOut, Dumbbell, User } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user

  // Verificar si una ruta está activa
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") {
      return true
    }
    return path !== "/" && pathname?.startsWith(path)
  }

  // Verificar permisos del usuario (simplificado por ahora)
  const checkPermission = (permission: string) => {
    if (!user?.role) return false
    if (user.role === "admin") return true

    // Permisos específicos por rol
    const rolePermissions: Record<string, string[]> = {
      coach: ["manage_trainings", "view_players"],
      captain: ["view_trainings", "view_players"],
      player: ["view_trainings"],
    }

    return rolePermissions[user.role]?.includes(permission) || false
  }

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="flex flex-col items-center justify-center py-4">
        <Link href="/" className="flex flex-col items-center gap-2">
          <div className="relative h-16 w-16">
            <Image src="/images/logo-disckatus.png" alt="Disckatus Logo" fill className="object-contain" priority />
          </div>
          <span className="text-xl font-bold text-sidebar-primary">Disckatus</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/")} tooltip="Dashboard">
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/tournaments")} tooltip="Torneos">
                  <Link href="/tournaments">
                    <Trophy className="h-4 w-4" />
                    <span>Torneos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/calendar")} tooltip="Calendario">
                  <Link href="/calendar">
                    <Calendar className="h-4 w-4" />
                    <span>Calendario</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/players")} tooltip="Jugadores">
                  <Link href="/players">
                    <Users className="h-4 w-4" />
                    <span>Jugadores</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {checkPermission("manage_trainings") && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/trainings")} tooltip="Entrenamientos">
                    <Link href="/trainings">
                      <Dumbbell className="h-4 w-4" />
                      <span>Entrenamientos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Sección de administración */}
        {user?.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin/users")} tooltip="Usuarios">
                    <Link href="/admin/users">
                      <UserCog className="h-4 w-4" />
                      <span>Gestión de Usuarios</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin/settings")} tooltip="Configuración">
                    <Link href="/admin/settings">
                      <Settings className="h-4 w-4" />
                      <span>Configuración</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin/repair-database")} tooltip="Reparar BD">
                    <Link href="/admin/repair-database">
                      <Settings className="h-4 w-4" />
                      <span>Reparar Base de Datos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        {user ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || undefined} alt={user.name || "Usuario"} />
                <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.role || "usuario"}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
