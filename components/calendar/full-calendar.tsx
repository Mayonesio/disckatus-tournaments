"use client"

import { useState } from "react"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import "react-big-calendar/lib/css/react-big-calendar.css"
import format from "date-fns/format"
import parse from "date-fns/parse"
import startOfWeek from "date-fns/startOfWeek"
import getDay from "date-fns/getDay"
import es from "date-fns/locale/es"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MapPin, Users } from "lucide-react"
import Link from "next/link"

// Configuración del localizador para español
const locales = {
  es: es,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// Datos de ejemplo para los eventos del calendario
const eventsData = [
  {
    id: 1,
    title: "Torneo de Primavera",
    start: new Date(2025, 4, 15),
    end: new Date(2025, 4, 16),
    location: "Madrid",
    type: "Fun",
    genderRestriction: "Mixto",
    registeredPlayers: 25,
    maxPlayers: 30,
    description: "Torneo amistoso para preparar la temporada",
  },
  {
    id: 2,
    title: "Campeonato Regional",
    start: new Date(2025, 5, 10),
    end: new Date(2025, 5, 12),
    location: "Barcelona",
    type: "Control",
    genderRestriction: "Open",
    registeredPlayers: 18,
    maxPlayers: 25,
    description: "Torneo de preparación para el Campeonato de España",
  },
  {
    id: 3,
    title: "Torneo Internacional",
    start: new Date(2025, 6, 5),
    end: new Date(2025, 6, 7),
    location: "Valencia",
    type: "CE",
    genderRestriction: "Femenino",
    registeredPlayers: 12,
    maxPlayers: 20,
    description: "Campeonato oficial con equipos internacionales",
  },
  {
    id: 4,
    title: "Torneo de Verano",
    start: new Date(2025, 7, 20),
    end: new Date(2025, 7, 22),
    location: "Málaga",
    type: "Fun",
    genderRestriction: "Mixto",
    registeredPlayers: 15,
    maxPlayers: 30,
    description: "Torneo de playa para disfrutar del verano",
  },
  {
    id: 5,
    title: "Entrenamiento Especial",
    start: new Date(2025, 4, 5),
    end: new Date(2025, 4, 5),
    location: "Madrid",
    type: "Entrenamiento",
    genderRestriction: "Mixto",
    registeredPlayers: 30,
    maxPlayers: 40,
    description: "Entrenamiento especial de preparación para torneos",
  },
  {
    id: 6,
    title: "Reunión de Equipo",
    start: new Date(2025, 4, 10),
    end: new Date(2025, 4, 10),
    location: "Online",
    type: "Reunión",
    genderRestriction: "Mixto",
    registeredPlayers: 45,
    maxPlayers: 50,
    description: "Reunión para planificar la temporada",
  },
]

// Función para obtener el color del evento según su tipo
const getEventColor = (event: any) => {
  switch (event.type) {
    case "Fun":
      return "bg-green-500 text-white"
    case "Control":
      return "bg-blue-500 text-white"
    case "CE":
      return "bg-amber-500 text-white"
    case "Entrenamiento":
      return "bg-purple-500 text-white"
    case "Reunión":
      return "bg-gray-500 text-white"
    default:
      return "bg-primary text-primary-foreground"
  }
}

export function FullCalendar() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Función para manejar el clic en un evento
  const handleEventClick = (event: any) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }

  // Función para personalizar la apariencia de los eventos
  const eventPropGetter = (event: any) => {
    return {
      className: getEventColor(event),
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendario de Eventos</CardTitle>
        <CardDescription>Visualiza todos los torneos, entrenamientos y reuniones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[700px]">
          <Calendar
            localizer={localizer}
            events={eventsData}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            onSelectEvent={handleEventClick}
            eventPropGetter={eventPropGetter}
            views={["month", "week", "day", "agenda"]}
            messages={{
              month: "Mes",
              week: "Semana",
              day: "Día",
              agenda: "Agenda",
              previous: "Anterior",
              next: "Siguiente",
              today: "Hoy",
              showMore: (total) => `+ Ver ${total} más`,
            }}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {selectedEvent && (
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
                <DialogDescription>{selectedEvent.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      selectedEvent.type === "Fun" ||
                      selectedEvent.type === "Entrenamiento" ||
                      selectedEvent.type === "Reunión"
                        ? "default"
                        : selectedEvent.type === "Control"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {selectedEvent.type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      selectedEvent.genderRestriction === "Mixto"
                        ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                        : selectedEvent.genderRestriction === "Open"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
                          : "bg-pink-100 text-pink-800 dark:bg-pink-800/20 dark:text-pink-400"
                    }
                  >
                    {selectedEvent.genderRestriction}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fecha inicio:</span>
                    <span>{selectedEvent.start.toLocaleDateString("es-ES")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fecha fin:</span>
                    <span>{selectedEvent.end.toLocaleDateString("es-ES")}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvent.location}</span>
                  </div>
                  {selectedEvent.type !== "Reunión" && (
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {selectedEvent.registeredPlayers}/{selectedEvent.maxPlayers} jugadores
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                {selectedEvent.type === "Fun" || selectedEvent.type === "Control" || selectedEvent.type === "CE" ? (
                  <Button asChild>
                    <Link href={`/tournaments/${selectedEvent.id}`}>Ver detalles del torneo</Link>
                  </Button>
                ) : (
                  <Button onClick={() => setIsDialogOpen(false)}>Cerrar</Button>
                )}
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </CardContent>
    </Card>
  )
}

