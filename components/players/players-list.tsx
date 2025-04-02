"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, MoreHorizontal, Plus, Search, Trash, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Player {
  _id: string
  name: string
  email: string
  phone?: string
  gender: string
  birthdate: string
  ultimateCentral?: string
  federationStatus: string
  notes?: string
}

export function PlayersList() {
  const router = useRouter()
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null)

  // Cargar jugadores al montar el componente
  useEffect(() => {
    fetchPlayers()
  }, [])

  // Función para cargar jugadores
  const fetchPlayers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/players")
      if (!response.ok) {
        throw new Error("Error al cargar jugadores")
      }
      const data = await response.json()
      setPlayers(data)
    } catch (error) {
      console.error("Error al cargar jugadores:", error)
      toast.error("Error al cargar jugadores")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para buscar jugadores
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchPlayers()
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/players?query=${encodeURIComponent(searchTerm)}`)
      if (!response.ok) {
        throw new Error("Error al buscar jugadores")
      }
      const data = await response.json()
      setPlayers(data)
    } catch (error) {
      console.error("Error al buscar jugadores:", error)
      toast.error("Error al buscar jugadores")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para eliminar un jugador
  const deletePlayer = async () => {
    if (!playerToDelete) return

    try {
      const response = await fetch(`/api/players/${playerToDelete._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar el jugador")
      }

      // Actualizar la lista de jugadores
      setPlayers(players.filter((player) => player._id !== playerToDelete._id))
      toast.success("Jugador eliminado correctamente")
    } catch (error) {
      console.error("Error al eliminar jugador:", error)
      toast.error(error instanceof Error ? error.message : "Error al eliminar el jugador")
    } finally {
      setPlayerToDelete(null)
    }
  }

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES")
    } catch (error) {
      return "Fecha inválida"
    }
  }

  // Función para obtener el color del badge según el estado de federación
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Inscrito":
        return "default"
      case "Pendiente":
        return "outline"
      case "No inscrito":
        return "secondary"
      default:
        return "default"
    }
  }

  // Filtrar jugadores según el término de búsqueda (búsqueda local)
  const filteredPlayers = searchTerm
    ? players.filter(
        (player) =>
          player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : players

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando jugadores...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar jugadores..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        {session?.user?.role === "admin" && (
          <Button asChild>
            <Link href="/players/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Jugador
            </Link>
          </Button>
        )}
      </div>
      {filteredPlayers.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No se encontraron jugadores</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jugador</TableHead>
                <TableHead>Género</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado Federación</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.map((player) => (
                <TableRow key={player._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt={player.name} />
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{player.name}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(player.birthdate)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{player.gender}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{player.email}</span>
                      <span className="text-xs text-muted-foreground">{player.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(player.federationStatus)}>{player.federationStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        {player.ultimateCentral && (
                          <DropdownMenuItem asChild>
                            <a href={player.ultimateCentral} target="_blank" rel="noopener noreferrer">
                              Ultimate Central
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/players/${player._id}/edit`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        {session?.user?.role === "admin" && (
                          <DropdownMenuItem
                            onClick={() => setPlayerToDelete(player)}
                            className="text-destructive flex items-center"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Diálogo de confirmación para eliminar jugador */}
      <AlertDialog open={!!playerToDelete} onOpenChange={(open) => !open && setPlayerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el jugador{" "}
              <span className="font-semibold">{playerToDelete?.name}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deletePlayer} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

