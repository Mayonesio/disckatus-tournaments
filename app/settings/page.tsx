import type { Metadata } from "next"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Configuración | Disckatus Ultimate Madrid",
  description: "Configuración de tu cuenta",
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Acceso restringido</h2>
          <p className="mt-2">Debes iniciar sesión para acceder a esta página</p>
          <Button asChild className="mt-4">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Configuración</h1>

        <div className="bg-card rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Información de la cuenta</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre</p>
              <p>{session.user.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{session.user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rol</p>
              <p className="capitalize">{session.user.role}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Preferencias</h2>
          <p className="text-muted-foreground">Las opciones de configuración estarán disponibles próximamente.</p>
        </div>
      </div>
    </div>
  )
}

