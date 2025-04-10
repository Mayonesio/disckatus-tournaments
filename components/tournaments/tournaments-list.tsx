"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Calendar, Edit, Info, MapPin, MoreHorizontal, Plus, Search, Trash, Users } from "lucide-react"
import { useSession } from "next-auth/react"
import type { Tournament } from "@/types/tournament"

interface TournamentsListProps {
  tournaments: Tournament[]
}

export function TournamentsList({ tournaments }: TournamentsListProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const isAdmin = session?.user?.role === "admin"

  // Función para formatear la fecha
  const formatDate = (dateString: string | Date) => {
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

  // Función para eliminar un torneo
  const handleDeleteTournament = async (id: string) => {
    setIsDeleting(id)

    try {
      const response = await fetch(`/api/tournaments/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar el torneo")
      }

      toast.success("Torneo eliminado correctamente")
      router.refresh()
    } catch (error) {
      console.error("Error al eliminar el torneo:", error)
      toast.error(error instanceof Error ? error.message : "Error al eliminar el torneo")
    } finally {
      setIsDeleting(null)
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

  // Filtrar torneos según búsqueda y tipo
  const filteredTournaments = tournaments.filter(
    (tournament) =>
      tournament.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (typeFilter === "all" || tournament.type === typeFilter),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-4 flex-wrap">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar torneos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de torneo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="Fun">Fun</SelectItem>
              <SelectItem value="Control">Control</SelectItem>
              <SelectItem value="CE">CE</SelectItem>
              <SelectItem value="Entrenamiento">Entrenamiento</SelectItem>
              <SelectItem value="Reunión">Reunión</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/tournaments/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Torneo
            </Link>
          </Button>
        )}
      </div>

      {filteredTournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No hay torneos</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            No se han encontrado torneos con los filtros actuales.
          </p>
          {isAdmin && (
            <Button asChild className="mt-4">
              <Link href="/tournaments/new">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Torneo
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTournaments.map((tournament) => (
            <Card key={tournament._id?.toString()} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant={getTypeBadgeVariant(tournament.type)}>{tournament.type}</Badge>
                  <Badge variant="outline" className={getGenderBadgeClass(tournament.genderRestriction)}>
                    {tournament.genderRestriction}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-1">{tournament.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {tournament.description || "Sin descripción"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(tournament.start)}</span>
                    {formatDate(tournament.start) !== formatDate(tournament.end) && (
                      <span className="text-xs text-muted-foreground ml-1">- {formatDate(tournament.end)}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{tournament.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      {tournament.registeredPlayers || 0}/{tournament.maxPlayers} jugadores
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
                      <span>{formatDate(tournament.registrationDeadline)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4 border-t">
                <Button variant="outline" asChild>
                  <Link href={`/tournaments/${tournament._id}`}>
                    <Info className="mr-2 h-4 w-4" />
                    Detalles
                  </Link>
                </Button>
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/tournaments/${tournament._id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
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
                              onClick={() => handleDeleteTournament(tournament._id?.toString() || "")}
                              disabled={isDeleting === tournament._id?.toString()}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting === tournament._id?.toString() ? "Eliminando..." : "Eliminar"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
