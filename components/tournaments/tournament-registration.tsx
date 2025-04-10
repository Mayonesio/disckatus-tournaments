"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import type { Tournament } from "@/types/tournament"

interface TournamentRegistrationProps {
  tournament: Tournament
  isRegistered?: boolean
}

export function TournamentRegistration({ tournament, isRegistered = false }: TournamentRegistrationProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  // Verificar si el torneo está lleno
  const isFull = (tournament.registeredPlayers || 0) >= tournament.maxPlayers

  // Verificar si el torneo ya pasó
  const isPast = new Date(tournament.end) < new Date()

  // Verificar si el torneo está cancelado
  const isCancelled = tournament.status === "Cancelled"

  // Verificar si el usuario puede inscribirse
  const canRegister = !isRegistered && !isFull && !isPast && !isCancelled && session

  // Función para manejar la inscripción
  const handleRegister = async () => {
    if (!session) {
      toast.error("Debes iniciar sesión para inscribirte")
      return
    }

    setIsLoading(true)
    try {
      // Aquí implementaremos la lógica de inscripción
      // Por ahora, simularemos una inscripción exitosa
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simular una petición

      toast.success(`Te has inscrito correctamente a ${tournament.title}`)
      router.refresh() // Refrescar la página para mostrar la inscripción
    } catch (error) {
      console.error("Error al inscribirse:", error)
      toast.error("No se pudo completar la inscripción")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para manejar la cancelación de inscripción
  const handleCancelRegistration = async () => {
    if (!session) {
      toast.error("Debes iniciar sesión para cancelar tu inscripción")
      return
    }

    setIsLoading(true)
    try {
      // Aquí implementaremos la lógica de cancelación
      // Por ahora, simularemos una cancelación exitosa
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simular una petición

      toast.success(`Has cancelado tu inscripción a ${tournament.title}`)
      router.refresh() // Refrescar la página para mostrar la cancelación
    } catch (error) {
      console.error("Error al cancelar inscripción:", error)
      toast.error("No se pudo cancelar la inscripción")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inscripción al torneo</CardTitle>
        <CardDescription>
          {isRegistered
            ? "Ya estás inscrito en este torneo"
            : isFull
              ? "Este torneo está completo"
              : isPast
                ? "Este torneo ya ha finalizado"
                : isCancelled
                  ? "Este torneo ha sido cancelado"
                  : "Inscríbete para participar en este torneo"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estado:</span>
            <span className="font-medium">
              {isRegistered
                ? "Inscrito"
                : isFull
                  ? "Completo"
                  : isPast
                    ? "Finalizado"
                    : isCancelled
                      ? "Cancelado"
                      : "Abierto"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Jugadores:</span>
            <span className="font-medium">
              {tournament.registeredPlayers || 0}/{tournament.maxPlayers}
            </span>
          </div>
          {tournament.fee !== undefined && tournament.fee > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cuota:</span>
              <span className="font-medium">
                {tournament.fee} {tournament.currency || "EUR"}
              </span>
            </div>
          )}
          {tournament.registrationDeadline && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fecha límite:</span>
              <span className="font-medium">
                {new Date(tournament.registrationDeadline).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isRegistered ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCancelRegistration}
            disabled={isLoading || isPast}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPast ? "Torneo finalizado" : "Cancelar inscripción"}
          </Button>
        ) : (
          <Button className="w-full" onClick={handleRegister} disabled={isLoading || !canRegister}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!session
              ? "Inicia sesión para inscribirte"
              : isFull
                ? "Torneo completo"
                : isPast
                  ? "Torneo finalizado"
                  : isCancelled
                    ? "Torneo cancelado"
                    : "Inscribirse"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
