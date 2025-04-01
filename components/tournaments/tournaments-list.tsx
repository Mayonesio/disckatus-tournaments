"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Info, MapPin, Plus, Search, Users } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Datos de ejemplo para los torneos
const tournamentsData = [
  {
    id: "1",
    name: "Torneo de Primavera",
    date: "15 Mayo, 2025",
    location: "Madrid",
    type: "Fun",
    registrationDeadline: "1 Mayo, 2025",
    registeredPlayers: 25,
    maxPlayers: 30,
    playerFee: 20,
    teamFee: 150,
    whatsappGroup: "https://chat.whatsapp.com/example1",
    description: "Torneo amistoso para preparar la temporada",
    genderRestriction: "Mixto",
  },
  {
    id: "2",
    name: "Campeonato Regional",
    date: "10 Junio, 2025",
    location: "Barcelona",
    type: "Control",
    registrationDeadline: "25 Mayo, 2025",
    registeredPlayers: 18,
    maxPlayers: 25,
    playerFee: 30,
    teamFee: 200,
    whatsappGroup: "https://chat.whatsapp.com/example2",
    description: "Torneo de preparación para el Campeonato de España",
    genderRestriction: "Open",
  },
  {
    id: "3",
    name: "Torneo Internacional",
    date: "5 Julio, 2025",
    location: "Valencia",
    type: "CE",
    registrationDeadline: "20 Junio, 2025",
    registeredPlayers: 12,
    maxPlayers: 20,
    playerFee: 40,
    teamFee: 300,
    whatsappGroup: "https://chat.whatsapp.com/example3",
    description: "Campeonato oficial con equipos internacionales",
    genderRestriction: "Femenino",
  },
  {
    id: "4",
    name: "Torneo de Verano",
    date: "20 Agosto, 2025",
    location: "Málaga",
    type: "Fun",
    registrationDeadline: "5 Agosto, 2025",
    registeredPlayers: 15,
    maxPlayers: 30,
    playerFee: 25,
    teamFee: 180,
    whatsappGroup: "https://chat.whatsapp.com/example4",
    description: "Torneo de playa para disfrutar del verano",
    genderRestriction: "Mixto",
  },
]

export function TournamentsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredTournaments = tournamentsData.filter(
    (tournament) =>
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (typeFilter === "all" || tournament.type === typeFilter),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-4">
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
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link href="/tournaments/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Torneo
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTournaments.map((tournament) => (
          <Card key={tournament.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    tournament.type === "Fun" ? "default" : tournament.type === "Control" ? "outline" : "secondary"
                  }
                >
                  {tournament.type}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    tournament.genderRestriction === "Mixto"
                      ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                      : tournament.genderRestriction === "Open"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
                        : "bg-pink-100 text-pink-800 dark:bg-pink-800/20 dark:text-pink-400"
                  }
                >
                  {tournament.genderRestriction}
                </Badge>
              </div>
              <CardTitle>{tournament.name}</CardTitle>
              <CardDescription>{tournament.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{tournament.date}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{tournament.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {tournament.registeredPlayers}/{tournament.maxPlayers} jugadores
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cuota jugador:</span>
                  <span className="font-medium">{tournament.playerFee}€</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cuota equipo:</span>
                  <span className="font-medium">{tournament.teamFee}€</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fecha límite:</span>
                  <span>{tournament.registrationDeadline}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <a href={tournament.whatsappGroup} target="_blank" rel="noopener noreferrer">
                  Grupo WhatsApp
                </a>
              </Button>
              <Button asChild>
                <Link href={`/tournaments/${tournament.id}`}>
                  <Info className="mr-2 h-4 w-4" />
                  Detalles
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

