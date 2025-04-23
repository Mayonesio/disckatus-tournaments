"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Mail, MapPin, Phone, Users, Edit, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

interface PlayerProfileProps {
  player: {
    _id?: string
    name: string
    email: string
    phone?: string
    gender: "Masculino" | "Femenino" | "Otro"
    birthdate: string | Date
    ultimateCentral?: string
    federationStatus: "Inscrito" | "Pendiente" | "No inscrito"
    notes?: string
    adminNotes?: string
    imageUrl?: string
    userId?: string // Referencia al usuario que puede editar este perfil
    position?: string // Posición que juega (handler, cutter, etc.)
    jerseyNumber?: number // Número de camiseta
    experience?: number // Años de experiencia
    height?: number // Altura en cm
    weight?: number // Peso en kg
    skills?: any[] // Habilidades del jugador
    achievements?: string[] // Logros del jugador
    teams?: string[] // Equipos en los que ha jugado
    createdAt?: Date
    updatedAt?: Date
  }
  canEdit: boolean
}

export function PlayerProfile({ player, canEdit }: PlayerProfileProps) {
  const router = useRouter()

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

  // Asegurarse de que skills sea un array
  const skills = Array.isArray(player.skills) ? player.skills : []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {player.imageUrl ? (
              <Avatar>
                <AvatarImage src={player.imageUrl || "/placeholder.svg"} alt={player.name} />
                <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar>
                <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            {player.name}
          </CardTitle>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/players/${player._id}/edit`)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
        <CardDescription>Información del jugador</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{player.email}</span>
          </div>
          {player.phone && (
            <div className="flex items-center">
              <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{player.phone}</span>
            </div>
          )}
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{formatDate(player.birthdate)}</span>
          </div>
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{player.gender}</span>
          </div>
          {player.position && (
            <div className="flex items-center">
              <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{player.position}</span>
            </div>
          )}
          {player.jerseyNumber && (
            <div className="flex items-center">
              <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>#{player.jerseyNumber}</span>
            </div>
          )}
          {player.height && (
            <div className="flex items-center">
              <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{player.height} cm</span>
            </div>
          )}
          {player.weight && (
            <div className="flex items-center">
              <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{player.weight} kg</span>
            </div>
          )}
          {player.experience && (
            <div className="flex items-center">
              <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{player.experience} años de experiencia</span>
            </div>
          )}
          {player.ultimateCentral && (
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <a href={player.ultimateCentral} target="_blank" rel="noopener noreferrer" className="underline">
                Ultimate Central
              </a>
            </div>
          )}
        </div>
        {skills && skills.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold">Habilidades</h3>
            <ul className="list-disc list-inside">
              {skills.map((skill: any) => (
                <li key={skill.name}>
                  {skill.name}: {skill.value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {canEdit && <Button onClick={() => router.push(`/players/${player._id}/skills`)}>Editar Habilidades</Button>}
      </CardFooter>
    </Card>
  )
}
