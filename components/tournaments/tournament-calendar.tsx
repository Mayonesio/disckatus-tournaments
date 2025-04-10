"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, MapPin, Users, ExternalLink, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import type { Tournament } from "@/types/tournament"

interface TournamentCalendarProps {
  initialTournaments?: Tournament[]
}

export function TournamentCalendar({ initialTournaments = [] }: TournamentCalendarProps) {
  const router = useRouter()
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  // Cargar torneos si no se proporcionan inicialmente
  useEffect(() => {
    if (initialTournaments.length === 0) {
      loadTournaments()
    } else {
      // Convertir las fechas de string a Date para los torneos iniciales
      const formattedTournaments = initialTournaments.map((tournament) => ({
        ...tournament,
        start: new Date(tournament.start),
        end: new Date(tournament.end),
      }))
      setTournaments(formattedTournaments)
    }
  }, [initialTournaments])

  // Verificar si el usuario está inscrito cuando se selecciona un torneo
  useEffect(() => {
    if (selectedTournament) {
      checkRegistrationStatus(selectedTournament._id as string)
    }
  }, [selectedTournament])

  // Cargar torneos desde la API
  const loadTournaments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/tournaments")
      if (!response.ok) {
        throw new Error("Error al cargar los torneos")
      }
      const data = await response.json()

      // Convertir las fechas de string a Date
      const formattedTournaments = data.map((tournament: Tournament) => ({
        ...tournament,
        start: new Date(tournament.start),
        end: new Date(tournament.end),
      }))

      setTournaments(formattedTournaments)
    } catch (error) {
      console.error("Error al cargar torneos:", error)
      toast.error("No se pudieron cargar los torneos")
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar si el usuario está inscrito en el torneo seleccionado
  const checkRegistrationStatus = async (tournamentId: string) => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/register`)
      if (!response.ok) {
        throw new Error("Error al verificar inscripción")
      }
      const data = await response.json()
      setIsRegistered(data.isRegistered)
    } catch (error) {
      console.error("Error al verificar inscripción:", error)
      setIsRegistered(false)
    }
  }

  // Función para obtener los torneos de un día específico
  const getTournamentsForDay = (day: Date) => {
    return tournaments.filter((tournament) => {
      const startDate = new Date(tournament.start)
      const endDate = new Date(tournament.end)

      // Verificar si el día está dentro del rango del torneo
      return day >= new Date(startDate.setHours(0, 0, 0, 0)) && day <= new Date(endDate.setHours(23, 59, 59, 999))
    })
  }

  // Modificar la función renderDay para que siempre trate registeredPlayers como un número
  const renderDay = (day: Date) => {
    const tournamentsForDay = getTournamentsForDay(day)

    // Obtener el color según el tipo de torneo
    const getEventColor = (type: string) => {
      switch (type) {
        case "Fun":
          return "bg-green-500"
        case "Control":
          return "bg-blue-500"
        case "CE":
          return "bg-amber-500"
        case "Entrenamiento":
          return "bg-purple-500"
        case "Reunión":
          return "bg-gray-500"
        default:
          return "bg-primary"
      }
    }

    if (tournamentsForDay.length === 0) {
      return null // Devolver null para mostrar el contenido predeterminado del día
    }

    // Devolver un indicador de color sin afectar al número del día
    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1">
        <div className={`h-1.5 w-1.5 rounded-full ${getEventColor(tournamentsForDay[0].type)}`} />
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

  // Función para obtener el color del badge según el tipo de torneo
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "Fun":
        return "default"
      case "Control":
        return "outline"
      case "CE":
        return "secondary"
      case "Entrenamiento":
        return "default"
      case "Reunión":
        return "outline"
      default:
        return "default"
    }
  }

  // Función para obtener el color del badge según la restricción de género
  const getGenderBadgeClass = (gender: string) => {
    switch (gender) {
      case "Mixto":
        return "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
      case "Open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
      case "Femenino":
        return "bg-pink-100 text-pink-800 dark:bg-pink-800/20 dark:text-pink-400"
      default:
        return ""
    }
  }

  // Modificar la función handleRegisterForTournament para que siempre trate registeredPlayers como un número
  const handleRegisterForTournament = async () => {
    if (!selectedTournament) return

    setIsRegistering(true)
    try {
      const response = await fetch(`/api/tournaments/${selectedTournament._id}/register`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al inscribirse en el torneo")
      }

      toast.success(`Te has inscrito correctamente a ${selectedTournament.title}`)
      setIsDialogOpen(false)
      setIsRegistered(true)

      // Actualizar el contador de jugadores registrados
      setTournaments(
        tournaments.map((tournament) => {
          if (tournament._id === selectedTournament._id) {
            return {
              ...tournament,
              registeredPlayers: (tournament.registeredPlayers || 0) + 1,
            }
          }
          return tournament
        }),
      )

      // Redirigir a la página de detalles del torneo
      router.push(`/tournaments/${selectedTournament._id}`)
    } catch (error) {
      console.error("Error al inscribirse:", error)
      toast.error(error instanceof Error ? error.message : "No se pudo completar la inscripción")
    } finally {
      setIsRegistering(false)
    }
  }

  // Modificar la función handleCancelRegistration para que siempre trate registeredPlayers como un número
  const handleCancelRegistration = async () => {
    if (!selectedTournament) return

    setIsRegistering(true)
    try {
      const response = await fetch(`/api/tournaments/${selectedTournament._id}/register`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al cancelar la inscripción")
      }

      toast.success(`Has cancelado tu inscripción a ${selectedTournament.title}`)
      setIsRegistered(false)

      // Actualizar el contador de jugadores registrados
      setTournaments(
        tournaments.map((tournament) => {
          if (tournament._id === selectedTournament._id) {
            return {
              ...tournament,
              registeredPlayers: Math.max(0, (tournament.registeredPlayers || 0) - 1),
            }
          }
          return tournament
        }),
      )
    } catch (error) {
      console.error("Error al cancelar inscripción:", error)
      toast.error(error instanceof Error ? error.message : "No se pudo cancelar la inscripción")
    } finally {
      setIsRegistering(false)
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
          {isLoading ? (
            <div className="flex justify-center items-center h-[300px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDaySelect}
              className="rounded-md border"
              components={{
                DayContent: (props) => {
                  const { date: dayDate } = props
                  return (
                    <div className="relative h-full w-full flex items-center justify-center">
                      <div className="flex items-center justify-center">{dayDate.getDate()}</div>
                      {renderDay(dayDate)}
                    </div>
                  )
                },
              }}
            />
          )}
          <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
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
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              <span className="text-sm">Entrenamiento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-500" />
              <span className="text-sm">Reunión</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Torneo</CardTitle>
          <CardDescription>
            {selectedTournament
              ? `Información sobre ${selectedTournament.title}`
              : "Selecciona un día con torneo para ver detalles"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedTournament ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{selectedTournament.title}</h3>
                <div className="flex gap-2">
                  <Badge variant={getTypeBadgeVariant(selectedTournament.type)}>{selectedTournament.type}</Badge>
                  <Badge variant="outline" className={getGenderBadgeClass(selectedTournament.genderRestriction)}>
                    {selectedTournament.genderRestriction}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(selectedTournament.start).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {new Date(selectedTournament.start).toDateString() !==
                      new Date(selectedTournament.end).toDateString() && (
                      <span className="text-muted-foreground ml-1">
                        -{" "}
                        {new Date(selectedTournament.end).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{selectedTournament.location}</span>
                </div>
                {/* Modificar la parte del CardContent donde se muestra el número de jugadores */}
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {selectedTournament.registeredPlayers || 0}/{selectedTournament.maxPlayers} jugadores
                  </span>
                </div>
                {selectedTournament.fee !== undefined && selectedTournament.fee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cuota:</span>
                    <span className="font-medium">
                      {selectedTournament.fee} {selectedTournament.currency || "EUR"}
                    </span>
                  </div>
                )}
                {selectedTournament.whatsappGroup && (
                  <div className="pt-2">
                    <a
                      href={selectedTournament.whatsappGroup}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline flex items-center"
                    >
                      Grupo de WhatsApp
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
              {selectedTournament.description && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground line-clamp-3">{selectedTournament.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-center text-muted-foreground">
              No hay torneos seleccionados. Haz clic en un día marcado en el calendario para ver detalles.
            </div>
          )}
        </CardContent>
        {selectedTournament && (
          <CardFooter className="flex gap-2">
            {isRegistered ? (
              <Button variant="outline" className="flex-1" onClick={handleCancelRegistration} disabled={isRegistering}>
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Cancelar inscripción"
                )}
              </Button>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1">Inscribirse al torneo</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Inscripción al torneo</DialogTitle>
                    <DialogDescription>
                      Estás a punto de inscribirte en el torneo {selectedTournament.title}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Torneo:</span>
                        <span>{selectedTournament.title}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Fecha:</span>
                        <span>
                          {new Date(selectedTournament.start).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Ubicación:</span>
                        <span>{selectedTournament.location}</span>
                      </div>
                      {selectedTournament.fee !== undefined && selectedTournament.fee > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Cuota:</span>
                          <span>
                            {selectedTournament.fee} {selectedTournament.currency || "EUR"}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Al confirmar, aceptas participar en este torneo y cumplir con las normas establecidas.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleRegisterForTournament} disabled={isRegistering}>
                      {isRegistering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        "Confirmar inscripción"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Button variant="outline" asChild className="flex-1">
              <Link href={`/tournaments/${selectedTournament._id}`}>Ver detalles</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
