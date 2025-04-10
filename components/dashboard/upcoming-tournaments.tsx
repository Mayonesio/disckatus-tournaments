"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, MapPin, ExternalLink } from "lucide-react"

interface Tournament {
  _id: string
  title: string
  location: string
  start: string
  end: string
  type: string
  genderRestriction: string
  isRegistered: boolean
}

export function UpcomingTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch("/api/dashboard/upcoming-tournaments")
        if (!response.ok) {
          throw new Error("Error al cargar torneos")
        }
        const data = await response.json()
        setTournaments(data)
      } catch (err) {
        console.error("Error al cargar torneos:", err)
        setError("No se pudieron cargar los próximos torneos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTournaments()
  }, [])

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    } catch (error) {
      return "Fecha no disponible"
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximos Torneos</CardTitle>
          <CardDescription>Error: {error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Próximos Torneos</CardTitle>
        <CardDescription>Torneos programados para las próximas semanas</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No hay torneos próximos</h3>
            <p className="mt-2 text-sm text-muted-foreground">No hay torneos programados para las próximas semanas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <div key={tournament._id} className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getTypeBadgeVariant(tournament.type)}>{tournament.type}</Badge>
                    <h3 className="font-medium">{tournament.title}</h3>
                  </div>
                  {tournament.isRegistered && (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Inscrito
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      {formatDate(tournament.start)} - {formatDate(tournament.end)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{tournament.location}</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/tournaments/${tournament._id}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver detalles
                    </Link>
                  </Button>
                </div>
                <div className="border-t my-2" />
              </div>
            ))}
            <div className="flex justify-center pt-2">
              <Button variant="outline" asChild>
                <Link href="/tournaments">Ver todos los torneos</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
