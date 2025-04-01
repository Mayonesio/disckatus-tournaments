import type { Metadata } from "next"
import { PlayersList } from "@/components/players/players-list"
import { PlayerFilters } from "@/components/players/player-filters"

export const metadata: Metadata = {
  title: "Jugadores | Disckatus Ultimate Madrid",
  description: "Gestión de jugadores del equipo",
}

export default function PlayersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Jugadores</h2>
      </div>
      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="md:w-1/4">
          <PlayerFilters />
        </div>
        <div className="md:w-3/4">
          <PlayersList />
        </div>
      </div>
    </div>
  )
}

