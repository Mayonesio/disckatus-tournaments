"use client"

import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, MoreHorizontal, Plus, Search, Trash } from "lucide-react"
import Link from "next/link"

// Datos de ejemplo para los jugadores
const playersData = [
  {
    id: "1",
    name: "Carlos Pérez",
    email: "carlos@example.com",
    phone: "600123456",
    gender: "Masculino",
    birthdate: "15/05/1990",
    ultimateCentral: "https://ultimatecentral.com/u/carlosperez",
    federationStatus: "Inscrito",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Laura García",
    email: "laura@example.com",
    phone: "600789123",
    gender: "Femenino",
    birthdate: "22/08/1992",
    ultimateCentral: "https://ultimatecentral.com/u/lauragarcia",
    federationStatus: "Inscrito",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Miguel Rodríguez",
    email: "miguel@example.com",
    phone: "600456789",
    gender: "Masculino",
    birthdate: "10/03/1988",
    ultimateCentral: "https://ultimatecentral.com/u/miguelrodriguez",
    federationStatus: "Pendiente",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Ana Martínez",
    email: "ana@example.com",
    phone: "600321654",
    gender: "Femenino",
    birthdate: "05/11/1995",
    ultimateCentral: "https://ultimatecentral.com/u/anamartinez",
    federationStatus: "No inscrito",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "Javier López",
    email: "javier@example.com",
    phone: "600987654",
    gender: "Masculino",
    birthdate: "18/07/1993",
    ultimateCentral: "https://ultimatecentral.com/u/javierlopez",
    federationStatus: "Inscrito",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export function PlayersList() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPlayers = playersData.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
          />
        </div>
        <Button asChild>
          <Link href="/players/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Jugador
          </Link>
        </Button>
      </div>
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
              <TableRow key={player.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={player.avatar} alt={player.name} />
                      <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{player.name}</span>
                      <span className="text-xs text-muted-foreground">{player.birthdate}</span>
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
                  <Badge
                    variant={
                      player.federationStatus === "Inscrito"
                        ? "default"
                        : player.federationStatus === "Pendiente"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {player.federationStatus}
                  </Badge>
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
                      <DropdownMenuItem asChild>
                        <Link href={`/players/${player.id}`}>Ver detalles</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={player.ultimateCentral} target="_blank">
                          Ultimate Central
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/players/${player.id}/edit`} className="flex items-center">
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive flex items-center">
                        <Trash className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

