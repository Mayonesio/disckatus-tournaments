"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Player } from "@/types/player"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Calendar, Mail, Phone, Edit, ExternalLink, Upload, Trash, Award, Clock, Users, ArrowLeft } from "lucide-react"

interface PlayerProfileProps {
  player: Player
  canEdit: boolean
}

export function PlayerProfile({ player, canEdit }: PlayerProfileProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Perfil de Jugador</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Tarjeta de perfil */}
        <Card className="md:col-span-1">
          <CardHeader className="relative pb-0 text-center">
            <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-primary/10">
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
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Upload className="h-4 w-4" />
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
                {player.imageUrl && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
            <CardTitle className="text-2xl">{player.name}</CardTitle>
            <CardDescription>
              {player.position || "Jugador"} • {calculateAge(player.birthdate)} años
            </CardDescription>
            <div className="mt-2 flex justify-center">
              <Badge variant={getBadgeVariant(player.federationStatus)}>{player.federationStatus}</Badge>
            </div>
          </CardHeader>
          <CardContent className="mt-6 space-y-4">
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

            {player.jerseyNumber && (
              <div className="flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                  #{player.jerseyNumber}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {canEdit && (
              <Button asChild className="w-full">
                <Link href={`/players/${player._id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Perfil
                </Link>
              </Button>
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
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Información</TabsTrigger>
              <TabsTrigger value="tournaments">Torneos</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            </TabsList>

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
                    <Award className="h-5 w-5" />
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

            {/* Pestaña de estadísticas */}
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Estadísticas
                  </CardTitle>
                  <CardDescription>Estadísticas de rendimiento del jugador</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No hay estadísticas disponibles</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Las estadísticas del jugador aparecerán aquí cuando estén disponibles
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

