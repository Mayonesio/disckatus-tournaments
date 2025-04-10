import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { TournamentForm } from "@/components/tournaments/tournament-form"

export const metadata: Metadata = {
  title: "Nuevo Torneo | Disckatus Ultimate Madrid",
  description: "Crear un nuevo torneo para Disckatus Ultimate Madrid",
}

export default async function NewTournamentPage() {
  const session = await getServerSession(authOptions)

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
        <h1 className="text-3xl font-bold mb-6">Nuevo Torneo</h1>
        <TournamentForm />
      </div>
    </div>
  )
}
