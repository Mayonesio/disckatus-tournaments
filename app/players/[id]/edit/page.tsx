import type { Metadata } from "next"
import { PlayerForm } from "@/components/players/player-form"

export const metadata: Metadata = {
  title: "Editar Jugador | Disckatus Ultimate Madrid",
  description: "Editar información de un jugador",
}

interface EditPlayerPageProps {
  params: {
    id: string
  }
}

export default function EditPlayerPage({ params }: EditPlayerPageProps) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Editar Jugador</h2>
      </div>
      <PlayerForm playerId={params.id} />
    </div>
  )
}

