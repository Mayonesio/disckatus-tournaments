"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ActivityItem {
  type: string
  date: string
  player?: {
    _id: string
    name: string
    imageUrl?: string
  }
  tournament: {
    _id: string
    title: string
  }
  isCurrentUser?: boolean
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/dashboard/recent-activity")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error("Formato de datos inválido")
        }

        setActivities(data)
      } catch (err) {
        console.error("Error al cargar actividades:", err)
        setError(err instanceof Error ? err.message : "No se pudieron cargar las actividades recientes")
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [])

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return "Fecha desconocida"
      }

      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.round(diffMs / 60000)
      const diffHours = Math.round(diffMs / 3600000)
      const diffDays = Math.round(diffMs / 86400000)

      if (diffMins < 60) {
        return `hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`
      } else if (diffHours < 24) {
        return `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`
      } else if (diffDays < 7) {
        return `hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`
      } else {
        return date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        })
      }
    } catch (error) {
      console.error("Error al formatear fecha:", error)
      return "Fecha desconocida"
    }
  }

  // Función para obtener el mensaje de actividad
  const getActivityMessage = (activity: ActivityItem) => {
    try {
      switch (activity.type) {
        case "registration":
          if (activity.isCurrentUser) {
            return (
              <>
                Te has inscrito en{" "}
                <Link href={`/tournaments/${activity.tournament._id}`} className="font-medium hover:underline">
                  {activity.tournament.title}
                </Link>
              </>
            )
          } else {
            return (
              <>
                <Link
                  href={activity.player?._id ? `/players/${activity.player._id}` : "#"}
                  className="font-medium hover:underline"
                >
                  {activity.player?.name || "Usuario"}
                </Link>{" "}
                se ha inscrito en{" "}
                <Link href={`/tournaments/${activity.tournament._id}`} className="font-medium hover:underline">
                  {activity.tournament.title}
                </Link>
              </>
            )
          }
        case "tournament_completed":
          return (
            <>
              El torneo{" "}
              <Link href={`/tournaments/${activity.tournament._id}`} className="font-medium hover:underline">
                {activity.tournament.title}
              </Link>{" "}
              ha finalizado
            </>
          )
        default:
          return "Actividad desconocida"
      }
    } catch (error) {
      console.error("Error al generar mensaje de actividad:", error)
      return "Actividad desconocida"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Últimas actividades en la plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No hay actividad reciente para mostrar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4">
                {activity.player ? (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.player.imageUrl} alt={activity.player.name} />
                    <AvatarFallback>{activity.player.name?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-medium text-primary">T</span>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm">{getActivityMessage(activity)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
