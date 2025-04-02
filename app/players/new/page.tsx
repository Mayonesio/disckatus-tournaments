import type { Metadata } from "next"
import { PlayerForm } from "@/components/players/player-form"

export const metadata: Metadata = {
  title: "Nuevo Jugador | Disckatus Ultimate Madrid",
  description: "Añadir un nuevo jugador al equipo",
}

export default function NewPlayerPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Nuevo Jugador</h2>
      </div>
      <PlayerForm />
    </div>
  )
}
