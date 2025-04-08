import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { PlayerForm } from "@/components/players/player-form"

export const metadata: Metadata = {
  title: "Editar Jugador | Disckatus Ultimate Madrid",
  description: "Actualiza la información del jugador",
}

interface EditPlayerPageProps {
  params: {
    id: string
  }
}

export default async function EditPlayerPage({ params }: EditPlayerPageProps) {
  const session = await getServerSession(authOptions)
  const id = params.id

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Acceso restringido</h2>
          <p className="mt-2">Debes iniciar sesión para acceder a esta página</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Editar Jugador</h1>
        <PlayerForm playerId={id} />
      </div>
    </div>
  )
}
