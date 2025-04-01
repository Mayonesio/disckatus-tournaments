"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Datos de ejemplo para los torneos
const tournamentsData = [
  {
    id: "1",
    name: "Torneo de Primavera",
    date: new Date(2025, 4, 15), // 15 Mayo, 2025
    location: "Madrid",
    type: "Fun",
    genderRestriction: "Mixto",
  },
  {
    id: "2",
    name: "Campeonato Regional",
    date: new Date(2025, 5, 10), // 10 Junio, 2025
    location: "Barcelona",
    type: "Control",
    genderRestriction: "Open",
  },
  {
    id: "3",
    name: "Torneo Internacional",
    date: new Date(2025, 6, 5), // 5 Julio, 2025
    location: "Valencia",
    type: "CE",
    genderRestriction: "Femenino",
  },
  {
    id: "4",
    name: "Torneo de Verano",
    date: new Date(2025, 7, 20), // 20 Agosto, 2025
    location: "Málaga",
    type: "Fun",
    genderRestriction: "Mixto",
  },
]

export function TournamentCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTournament, setSelectedTournament] = useState<any>(null)

  // Función para obtener los torneos de un día específico
  const getTournamentsForDay = (day: Date) => {
    return tournamentsData.filter(
      (tournament) =>
        tournament.date.getDate() === day.getDate() &&
        tournament.date.getMonth() === day.getMonth() &&
        tournament.date.getFullYear() === day.getFullYear(),
    )
  }

  // Función para renderizar el contenido del día en el calendario
  const renderDay = (day: Date) => {
    const tournamentsForDay = getTournamentsForDay(day)

    if (tournamentsForDay.length === 0) {
      return <div className="h-full w-full"></div>
    }

    return (
      <div className="h-full w-full flex items-center justify-center">
        <div
          className={`h-1.5 w-1.5 rounded-full ${
            tournamentsForDay[0].type === "Fun"
              ? "bg-green-500"
              : tournamentsForDay[0].type === "Control"
                ? "bg-blue-500"
                : "bg-amber-500"
          }`}
        />
      </div>
    )
  }

  // Función para manejar el cambio de día seleccionado
  const handleDaySelect = (day: Date | undefined) => {
    setDate(day)
    if (day) {
      const tournamentsForDay = getTournamentsForDay(day)
      setSelectedTournament(tournamentsForDay.length > 0 ? tournamentsForDay[0] : null)
    } else {
      setSelectedTournament(null)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Calendario de Torneos</CardTitle>
          <CardDescription>Visualiza todos los torneos programados</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDaySelect}
            className="rounded-md border"
            components={{
              DayContent: ({ date }) => renderDay(date),
            }}
          />
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm">Fun</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm">Control</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-sm">CE</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Torneo</CardTitle>
          <CardDescription>
            {selectedTournament
              ? `Información sobre ${selectedTournament.name}`
              : "Selecciona un día con torneo para ver detalles"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedTournament ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{selectedTournament.name}</h3>
                <Badge
                  variant={
                    selectedTournament.type === "Fun"
                      ? "default"
                      : selectedTournament.type === "Control"
                        ? "outline"
                        : "secondary"
                  }
                >
                  {selectedTournament.type}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {selectedTournament.date.toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ubicación:</span>
                  <span>{selectedTournament.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Categoría:</span>
                  <span>{selectedTournament.genderRestriction}</span>
                </div>
              </div>
              <div className="pt-4">
                <Link href={`/tournaments/${selectedTournament.id}`} className="text-primary hover:underline">
                  Ver detalles completos
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-center text-muted-foreground">
              No hay torneos seleccionados. Haz clic en un día marcado en el calendario para ver detalles.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

