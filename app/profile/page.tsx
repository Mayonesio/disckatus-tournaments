import type { Metadata } from "next"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToDatabase } from "@/lib/mongodb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Mi Perfil | Disckatus Ultimate Madrid",
  description: "Información de tu perfil",
}

export default async function ProfilePage() {
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

  try {
    const { db } = await connectToDatabase()

    // Buscar si el usuario tiene un perfil de jugador asociado
    const player = await db.collection("players").findOne({
      email: session.user.email,
    })

    if (player) {
      // En lugar de redireccionar, mostramos un enlace al perfil
      return (
        <div className="flex-1 p-4 md:p-8 pt-6">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Tu perfil de jugador</CardTitle>
              <CardDescription>Hemos encontrado un perfil de jugador asociado a tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Nombre: <strong>{player.name}</strong>
              </p>
              <p>Email: {player.email}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/players/${player._id}`}>
                  Ver mi perfil completo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    } else {
      // Si no existe un perfil de jugador, mostrar mensaje informativo
      return (
        <div className="flex-1 p-4 md:p-8 pt-6">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Perfil no encontrado</CardTitle>
              <CardDescription>No se encontró un perfil de jugador asociado a tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Tu cuenta de usuario no está vinculada a ningún perfil de jugador en el sistema.</p>
              <p className="text-sm text-muted-foreground">
                Si crees que esto es un error, por favor contacta con un administrador para que vincule tu cuenta con tu
                perfil de jugador.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Volver al inicio</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }
  } catch (error) {
    console.error("Error al buscar perfil de jugador:", error)
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Ocurrió un error al buscar tu perfil de jugador</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No pudimos recuperar la información de tu perfil. Por favor, intenta de nuevo más tarde.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
}

