"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  Calendar,
  Clock,
  Edit,
  ExternalLink,
  Globe,
  Info,
  Mail,
  MapPin,
  Phone,
  Trash,
  Users,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Clock3,
} from "lucide-react"
import { useSession } from "next-auth/react"
import type { Tournament } from "@/types/tournament"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// Actualizar la importación al inicio del archivo
import type { Registration } from "@/types/registration"

// Definir una interfaz para los registros de inscripción
/*
interface Registration {
  _id: string
  playerId: string
  tournamentId: string
  status: "pending" | "approved" | "rejected"
  paymentStatus: "pending" | "completed" | "refunded"
  createdAt: string
  updatedAt: string
  notes?: string
  player?: {
    _id: string
    name: string
    email: string
    imageUrl?: string
    gender?: string
    position?: string
    jerseyNumber?: number
  }
}
*/

// Luego actualizar la interfaz TournamentDetailProps
interface TournamentDetailProps {
  tournament: Tournament
  registrations?: Registration[] // Usar la interfaz Registration importada
}

export function TournamentDetail({ tournament, registrations = [] }: TournamentDetailProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [playerRegistrations, setPlayerRegistrations] = useState<Registration[]>([])
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false)
  const isAdmin = session?.user?.role === "admin"

  // Verificar si el usuario está inscrito cuando se carga el componente
  useEffect(() => {
    if (session) {
      checkRegistrationStatus()
    }
  }, [session, tournament._id])

  // Cargar los jugadores inscritos cuando se carga el componente
  useEffect(() => {
    if (registrations.length > 0) {
      setPlayerRegistrations(registrations)
    } else {
      loadRegisteredPlayers()
    }
  }, [tournament._id, registrations])

  // Cargar los jugadores inscritos desde la API
  const loadRegisteredPlayers = async () => {
    setIsLoadingPlayers(true)
    try {
      const response = await fetch(`/api/tournaments/${tournament._id}/registrations`)
      if (!response.ok) {
        throw new Error("Error al cargar los jugadores inscritos")
      }
      const data = await response.json()
      setPlayerRegistrations(data)
    } catch (error) {
      console.error("Error al cargar jugadores inscritos:", error)
      toast.error("No se pudieron cargar los jugadores inscritos")
    } finally {
      setIsLoadingPlayers(false)
    }
  }

  // Verificar si el usuario está inscrito en el torneo
  const checkRegistrationStatus = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournament._id}/register`)
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

  // Función para formatear la fecha
  const formatDate = (dateString: string | Date) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch (error) {
      return "Fecha no disponible"
    }
  }

  // Función para formatear la fecha con hora
  const formatDateTime = (dateString: string | Date) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Fecha no disponible"
    }
  }

  // Función para eliminar un torneo
  const handleDeleteTournament = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/tournaments/${tournament._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar el torneo")
      }

      toast.success("Torneo eliminado correctamente")
      router.push("/tournaments")
      router.refresh()
    } catch (error) {
      console.error("Error al eliminar el torneo:", error)
      toast.error(error instanceof Error ? error.message : "Error al eliminar el torneo")
    } finally {
      setIsDeleting(false)
    }
  }

  // Función para inscribirse al torneo
  const handleRegisterForTournament = async () => {
    setIsRegistering(true)
    try {
      const response = await fetch(`/api/tournaments/${tournament._id}/register`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al inscribirse en el torneo")
      }

      toast.success(`Te has inscrito correctamente a ${tournament.title}`)
      setIsDialogOpen(false)
      setIsRegistered(true)
      router.refresh() // Refrescar la página para mostrar la inscripción
      loadRegisteredPlayers() // Recargar la lista de jugadores
    } catch (error) {
      console.error("Error al inscribirse:", error)
      toast.error(error instanceof Error ? error.message : "No se pudo completar la inscripción")
    } finally {
      setIsRegistering(false)
    }
  }

  // Función para cancelar la inscripción
  const handleCancelRegistration = async () => {
    setIsRegistering(true)
    try {
      const response = await fetch(`/api/tournaments/${tournament._id}/register`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al cancelar la inscripción")
      }

      toast.success(`Has cancelado tu inscripción a ${tournament.title}`)
      setIsRegistered(false)
      router.refresh() // Refrescar la página para mostrar la cancelación
      loadRegisteredPlayers() // Recargar la lista de jugadores
    } catch (error) {
      console.error("Error al cancelar inscripción:", error)
      toast.error(error instanceof Error ? error.message : "No se pudo cancelar la inscripción")
    } finally {
      setIsRegistering(false)
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

  // Función para obtener el color del badge según el estado del torneo
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
      case "Ongoing":
        return "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
      case "Completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400"
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
      default:
        return ""
    }
  }

  // Función para obtener el texto del estado del torneo
  const getStatusText = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "Próximo"
      case "Ongoing":
        return "En curso"
      case "Completed":
        return "Completado"
      case "Cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  // Función para obtener el icono y color según el estado de la inscripción
  const getRegistrationStatusInfo = (status: string) => {
    switch (status) {
      case "approved":
        return { icon: <CheckCircle className="h-4 w-4 text-green-500" />, text: "Aprobada", color: "text-green-500" }
      case "rejected":
        return { icon: <XCircle className="h-4 w-4 text-red-500" />, text: "Rechazada", color: "text-red-500" }
      case "pending":
      default:
        return { icon: <Clock3 className="h-4 w-4 text-amber-500" />, text: "Pendiente", color: "text-amber-500" }
    }
  }

  // Función para obtener el icono y color según el estado del pago
  const getPaymentStatusInfo = (status: string) => {
    switch (status) {
      case "completed":
        return { icon: <CheckCircle className="h-4 w-4 text-green-500" />, text: "Pagado", color: "text-green-500" }
      case "refunded":
        return { icon: <XCircle className="h-4 w-4 text-blue-500" />, text: "Reembolsado", color: "text-blue-500" }
      case "pending":
      default:
        return { icon: <Clock3 className="h-4 w-4 text-amber-500" />, text: "Pendiente", color: "text-amber-500" }
    }
  }

  // Verificar si el torneo está lleno
  const isFull = (tournament.registeredPlayers || 0) >= tournament.maxPlayers

  // Verificar si el torneo ya pasó
  const isPast = new Date(tournament.end) < new Date()

  // Verificar si el torneo está cancelado
  const isCancelled = tournament.status === "Cancelled"

  // Verificar si el usuario puede inscribirse
  const canRegister = !isRegistered && !isFull && !isPast && !isCancelled && session

  return (
    <div className="space-y-6">
      {/* Encabezado y botones de acción */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{tournament.title}</h1>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/tournaments/${tournament._id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente el torneo y no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteTournament}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Tarjeta de información principal */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getTypeBadgeVariant(tournament.type)}>{tournament.type}</Badge>
                  <Badge variant="outline" className={getStatusBadgeVariant(tournament.status)}>
                    {getStatusText(tournament.status)}
                  </Badge>
                </div>
                <Badge variant="outline" className="w-fit">
                  {tournament.genderRestriction}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatDate(tournament.start)} - {formatDate(tournament.end)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{tournament.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {tournament.registeredPlayers || 0}/{tournament.maxPlayers} jugadores
                </span>
              </div>
              {tournament.registrationDeadline && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Inscripción hasta: {formatDate(tournament.registrationDeadline)}</span>
                </div>
              )}
              {tournament.fee !== undefined && tournament.fee > 0 && (
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Cuota: {tournament.fee} {tournament.currency || "EUR"}
                  </span>
                </div>
              )}
            </div>

            {(tournament.organizerName || tournament.organizerEmail || tournament.organizerPhone) && (
              <div className="border-t pt-4">
                <h3 className="mb-2 font-medium">Organizador</h3>
                <div className="space-y-2">
                  {tournament.organizerName && <p>{tournament.organizerName}</p>}
                  {tournament.organizerEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${tournament.organizerEmail}`} className="hover:underline">
                        {tournament.organizerEmail}
                      </a>
                    </div>
                  )}
                  {tournament.organizerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${tournament.organizerPhone}`} className="hover:underline">
                        {tournament.organizerPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tournament.website && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={tournament.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center"
                  >
                    Sitio web oficial
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {isRegistered ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCancelRegistration}
                disabled={isRegistering || isPast}
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : isPast ? (
                  "Torneo finalizado"
                ) : (
                  "Cancelar inscripción"
                )}
              </Button>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" disabled={!canRegister}>
                    {!session
                      ? "Inicia sesión para inscribirte"
                      : isFull
                        ? "Torneo completo"
                        : isPast
                          ? "Torneo finalizado"
                          : isCancelled
                            ? "Torneo cancelado"
                            : "Inscribirse al torneo"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Inscripción al torneo</DialogTitle>
                    <DialogDescription>Estás a punto de inscribirte en el torneo {tournament.title}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Torneo:</span>
                        <span>{tournament.title}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Fecha:</span>
                        <span>
                          {new Date(tournament.start).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Ubicación:</span>
                        <span>{tournament.location}</span>
                      </div>
                      {tournament.fee !== undefined && tournament.fee > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Cuota:</span>
                          <span>
                            {tournament.fee} {tournament.currency || "EUR"}
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
            <Button variant="outline" asChild className="w-full">
              <Link href="/calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Ver en Calendario
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Contenido detallado */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="players">Jugadores</TabsTrigger>
              <TabsTrigger value="admin">Administración</TabsTrigger>
            </TabsList>

            {/* Pestaña de información */}
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  {tournament.description ? (
                    <div className="prose max-w-none dark:prose-invert">
                      <p className="whitespace-pre-line">{tournament.description}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No hay descripción disponible para este torneo.</p>
                  )}
                </CardContent>
              </Card>

              {tournament.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notas adicionales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none dark:prose-invert">
                      <p className="whitespace-pre-line">{tournament.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Pestaña de jugadores */}
            <TabsContent value="players">
              <Card>
                <CardHeader>
                  <CardTitle>Jugadores inscritos</CardTitle>
                  <CardDescription>
                    {tournament.registeredPlayers || 0} de {tournament.maxPlayers} plazas ocupadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPlayers ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : playerRegistrations.length > 0 ? (
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Jugador</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Pago</TableHead>
                            <TableHead>Fecha</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {playerRegistrations.map((registration) => {
                            const registrationStatus = getRegistrationStatusInfo(registration.status)
                            const paymentStatus = getPaymentStatusInfo(registration.paymentStatus)

                            return (
                              <TableRow key={registration._id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      {registration.player?.imageUrl ? (
                                        <AvatarImage
                                          src={registration.player.imageUrl}
                                          alt={registration.player?.name || "Jugador"}
                                        />
                                      ) : (
                                        <AvatarFallback>{registration.player?.name?.charAt(0) || "?"}</AvatarFallback>
                                      )}
                                    </Avatar>
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {registration.player?.name || "Jugador desconocido"}
                                      </span>
                                      {registration.player?.position && (
                                        <span className="text-xs text-muted-foreground">
                                          {registration.player.position}
                                          {registration.player.jerseyNumber && ` #${registration.player.jerseyNumber}`}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {registrationStatus.icon}
                                    <span className={registrationStatus.color}>{registrationStatus.text}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {paymentStatus.icon}
                                    <span className={paymentStatus.color}>{paymentStatus.text}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {formatDateTime(registration.createdAt)}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-medium">No hay jugadores inscritos</h3>
                      <p className="mt-2 text-center text-sm text-muted-foreground">
                        Aún no hay jugadores inscritos en este torneo.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {isRegistered ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCancelRegistration}
                      disabled={isRegistering || isPast}
                    >
                      {isRegistering ? "Procesando..." : isPast ? "Torneo finalizado" : "Cancelar inscripción"}
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => setIsDialogOpen(true)} disabled={!canRegister}>
                      {!session
                        ? "Inicia sesión para inscribirte"
                        : isFull
                          ? "Torneo completo"
                          : isPast
                            ? "Torneo finalizado"
                            : isCancelled
                              ? "Torneo cancelado"
                              : "Inscribirse al torneo"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Pestaña de administración */}
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle>Administración del torneo</CardTitle>
                  <CardDescription>Opciones para administradores</CardDescription>
                </CardHeader>
                <CardContent>
                  {isAdmin ? (
                    <div className="space-y-4">
                      {tournament.adminNotes && (
                        <div className="rounded-md bg-muted p-4">
                          <h3 className="mb-2 font-medium">Notas administrativas:</h3>
                          <p className="whitespace-pre-line text-sm">{tournament.adminNotes}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Button asChild variant="outline" className="w-full">
                          <Link href={`/tournaments/${tournament._id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar torneo
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                          <Link href={`/tournaments/${tournament._id}/registrations`}>
                            <Users className="mr-2 h-4 w-4" />
                            Gestionar inscripciones
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full">
                              <Trash className="mr-2 h-4 w-4" />
                              Eliminar torneo
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará permanentemente el torneo y no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteTournament}
                                disabled={isDeleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {isDeleting ? "Eliminando..." : "Eliminar"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-center text-muted-foreground">
                        Solo los administradores pueden acceder a esta sección.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
