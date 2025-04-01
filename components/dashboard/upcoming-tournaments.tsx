"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Info, MapPin } from "lucide-react"
import Link from "next/link"

// Datos de ejemplo para los próximos torneos
const upcomingTournaments = [
  {
    id: "1",
    name: "Torneo de Primavera",
    date: "15 Mayo, 2025",
    location: "Madrid",
    type: "Fun",
    registrationDeadline: "1 Mayo, 2025",
    registeredPlayers: 25,
    maxPlayers: 30,
  },
  {
    id: "2",
    name: "Campeonato Regional",
    date: "10 Junio, 2025",
    location: "Barcelona",
    type: "Control",
    registrationDeadline: "25 Mayo, 2025",
    registeredPlayers: 18,
    maxPlayers: 25,
  },
  {
    id: "3",
    name: "Torneo Internacional",
    date: "5 Julio, 2025",
    location: "Valencia",
    type: "CE",
    registrationDeadline: "20 Junio, 2025",
    registeredPlayers: 12,
    maxPlayers: 20,
  },
]

export function UpcomingTournaments() {
  return (
    <div className="space-y-8">
      {upcomingTournaments.map((tournament) => (
        <div key={tournament.id} className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  tournament.type === "Fun"
                    ? "bg-green-500"
                    : tournament.type === "Control"
                      ? "bg-blue-500"
                      : "bg-amber-500"
                }`}
              />
              <h3 className="font-medium">{tournament.name}</h3>
              <span className="rounded-md bg-muted px-2 py-1 text-xs">{tournament.type}</span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/tournaments/${tournament.id}`}>
                <Info className="mr-2 h-4 w-4" />
                Detalles
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{tournament.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{tournament.location}</span>
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <span className="text-muted-foreground">Inscripción:</span>
              <span>
                {tournament.registeredPlayers}/{tournament.maxPlayers} jugadores
              </span>
              <span className="text-muted-foreground ml-2">Cierre: {tournament.registrationDeadline}</span>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full ${
                tournament.type === "Fun"
                  ? "bg-green-500"
                  : tournament.type === "Control"
                    ? "bg-blue-500"
                    : "bg-amber-500"
              }`}
              style={{ width: `${(tournament.registeredPlayers / tournament.maxPlayers) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

