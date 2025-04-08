"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Player, PlayerSkill } from "@/types/player"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
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
import { toast } from "sonner"
import {
  Calendar,
  Mail,
  Phone,
  Edit,
  ExternalLink,
  Upload,
  Trash,
  Award,
  Users,
  ArrowLeft,
  Shield,
  Star,
  Ruler,
  Weight,
  Trophy,
  CheckCircle,
} from "lucide-react"
import { useSession } from "next-auth/react"

interface PlayerProfileProps {
  player: Player
  canEdit: boolean
}

export function PlayerProfile({ player, canEdit }: PlayerProfileProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingPlayer, setIsDeletingPlayer] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"

  // Función para formatear la fecha
  const formatDate = (dateString: string | Date) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es })
    } catch (error) {
      return "Fecha no disponible"
    }
  }

  // Función para calcular la edad
  const calculateAge = (birthdate: string | Date) => {
    try {
      const today = new Date()
      const birth = new Date(birthdate)
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }

      return age
    } catch (error) {
      return "N/A"
    }
  }

  // Función para subir una imagen de perfil
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar el tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecciona una imagen válida")
      return
    }

    // Validar el tamaño del archivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5MB")
      return
    }

    setIsUploading(true)

    try {
      // Crear un FormData para enviar la imagen
      const formData = new FormData()
      formData.append("image", file)

      // Enviar la imagen al servidor
      const response = await fetch(`/api/players/${player._id}/image`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al subir la imagen")
      }

      const data = await response.json()

      toast.success("Imagen de perfil actualizada correctamente")
      router.refresh() // Recargar la página para mostrar la nueva imagen
    } catch (error) {
      console.error("Error al subir la imagen:", error)
      toast.error(error instanceof Error ? error.message : "Error al subir la imagen")
    } finally {
      setIsUploading(false)
    }
  }

  // Función para eliminar la imagen de perfil
  const handleDeleteImage = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/players/${player._id}/image`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar la imagen")
      }

      toast.success("Imagen de perfil eliminada correctamente")
      router.refresh() // Recargar la página para mostrar el avatar por defecto
    } catch (error) {
      console.error("Error al eliminar la imagen:", error)
      toast.error(error instanceof Error ? error.message : "Error al eliminar la imagen")
    } finally {
      setIsDeleting(false)
    }
  }

  // Función para eliminar el jugador (solo para administradores)
  const handleDeletePlayer = async () => {
    setIsDeletingPlayer(true)

    try {
      const response = await fetch(`/api/players/${player._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar el jugador")
      }

      toast.success("Jugador eliminado correctamente")
      router.push("/players") // Redirigir a la lista de jugadores
      router.refresh()
    } catch (error) {
      console.error("Error al eliminar el jugador:", error)
      toast.error(error instanceof Error ? error.message : "Error al eliminar el jugador")
    } finally {
      setIsDeletingPlayer(false)
    }
  }

  // Obtener el color del badge según el estado de federación
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

  // Habilidades predeterminadas si el jugador no tiene ninguna
  const defaultSkills: PlayerSkill[] = [
    { name: "Lanzamiento", value: 70 },
    { name: "Recepción", value: 75 },
    { name: "Velocidad", value: 80 },
    { name: "Resistencia", value: 65 },
    { name: "Defensa", value: 60 },
    { name: "Visión de juego", value: 85 },
  ]

  const skills = player.skills || defaultSkills

  // Función para que los administradores verifiquen las habilidades
  const handleVerifySkills = async () => {
    // Implementación para verificar habilidades
    router.push(`/players/${player._id}/verify-skills`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Perfil de Jugador</h1>
        </div>

        {isAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="mr-2 h-4 w-4" />
                Eliminar Jugador
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente el perfil del jugador y todos sus datos asociados. Esta acción
                  no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeletePlayer}
                  disabled={isDeletingPlayer}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeletingPlayer ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Tarjeta de perfil estilo FIFA */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="relative h-40 bg-gradient-to-r from-primary/80 to-primary">
            <div className="absolute -bottom-16 left-6 h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-xl">
              {player.imageUrl ? (
                <Image
                  src={player.imageUrl || "/placeholder.svg"}
                  alt={player.name}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Avatar className="h-full w-full">
                  <AvatarImage src="/placeholder-user.jpg" alt={player.name} />
                  <AvatarFallback className="text-4xl">{player.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
            </div>
            {canEdit && (
              <div className="absolute right-4 top-4 flex gap-2">
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-primary hover:bg-white"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </button>
                {player.imageUrl && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-destructive hover:bg-white">
                        <Trash className="h-4 w-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará la imagen de perfil actual.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteImage} disabled={isDeleting}>
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>

          <CardHeader className="pt-20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{player.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  {player.position || "Jugador"} • {calculateAge(player.birthdate)} años
                </CardDescription>
              </div>
              {player.jerseyNumber && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  #{player.jerseyNumber}
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={getBadgeVariant(player.federationStatus)}>{player.federationStatus}</Badge>
              {player.experience && (
                <Badge variant="outline" className="bg-amber-50">
                  <Star className="mr-1 h-3 w-3 text-amber-500" />
                  {player.experience} {player.experience === 1 ? "año" : "años"}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center rounded-lg bg-background p-3">
                <div className="mb-1 flex items-center text-muted-foreground">
                  <Ruler className="mr-1 h-4 w-4" />
                  <span className="text-xs">Altura</span>
                </div>
                <span className="text-lg font-semibold">{player.height || "--"} cm</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg bg-background p-3">
                <div className="mb-1 flex items-center text-muted-foreground">
                  <Weight className="mr-1 h-4 w-4" />
                  <span className="text-xs">Peso</span>
                </div>
                <span className="text-lg font-semibold">{player.weight || "--"} kg</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{player.email}</span>
              </div>
              {player.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{player.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(player.birthdate)}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            {canEdit && (
              <>
                <Button asChild className="w-full">
                  <Link href={`/players/${player._id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Perfil
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/players/${player._id}/skills`}>
                    <Star className="mr-2 h-4 w-4 text-amber-500" />
                    Editar Habilidades
                  </Link>
                </Button>
              </>
            )}
            {player.ultimateCentral && (
              <Button variant="outline" asChild className="w-full">
                <a href={player.ultimateCentral} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver en Ultimate Central
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Contenido principal */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="skills" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="skills">Habilidades</TabsTrigger>
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="tournaments">Torneos</TabsTrigger>
            </TabsList>

            {/* Pestaña de habilidades */}
            <TabsContent value="skills" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Habilidades
                  </CardTitle>
                  <CardDescription>Nivel de habilidad en diferentes aspectos del juego</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {skills.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{skill.name}</span>
                          {skill.verified && (
                            <div className="relative group">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="absolute -top-8 left-0 hidden group-hover:block bg-black/80 text-white text-xs p-1 rounded whitespace-nowrap">
                                Habilidad verificada
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="font-bold">{skill.value}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={skill.value} className="h-2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
                {canEdit && (
                  <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/players/${player._id}/skills`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Actualizar Habilidades
                      </Link>
                    </Button>
                  </CardFooter>
                )}
                {session?.user?.role === "admin" && (
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => handleVerifySkills()}>
                      <Shield className="mr-2 h-4 w-4 text-green-500" />
                      Verificar Habilidades
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            {/* Pestaña de información */}
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Género</h4>
                      <p>{player.gender}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Edad</h4>
                      <p>{calculateAge(player.birthdate)} años</p>
                    </div>
                    {player.position && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Posición</h4>
                        <p>{player.position}</p>
                      </div>
                    )}
                    {player.experience !== undefined && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Experiencia</h4>
                        <p>
                          {player.experience} {player.experience === 1 ? "año" : "años"}
                        </p>
                      </div>
                    )}
                  </div>

                  {player.notes && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Notas</h4>
                      <p className="whitespace-pre-line">{player.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Logros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {player.achievements && player.achievements.length > 0 ? (
                    <ul className="space-y-2 list-disc pl-5">
                      {player.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No hay logros registrados</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Estado Federativo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Badge variant={getBadgeVariant(player.federationStatus)}>
                        {player.federationStatus === "Inscrito"
                          ? "✓"
                          : player.federationStatus === "Pendiente"
                            ? "⋯"
                            : "✗"}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">{player.federationStatus}</p>
                      <p className="text-sm text-muted-foreground">
                        {player.federationStatus === "Inscrito"
                          ? "Jugador federado activo"
                          : player.federationStatus === "Pendiente"
                            ? "Proceso de federación en curso"
                            : "No inscrito en la federación"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pestaña de torneos */}
            <TabsContent value="tournaments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Participación en Torneos
                  </CardTitle>
                  <CardDescription>Historial de torneos en los que ha participado el jugador</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No hay datos de torneos disponibles</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Los torneos en los que participe el jugador aparecerán aquí
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
