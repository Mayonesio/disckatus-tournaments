"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Esquema de validación para el formulario
const playerFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(9, { message: "El teléfono debe tener al menos 9 dígitos" }),
  gender: z.enum(["Masculino", "Femenino", "Otro"], {
    required_error: "Por favor selecciona un género",
  }),
  birthdate: z.string().min(1, { message: "La fecha de nacimiento es obligatoria" }),
  ultimateCentral: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
  federationStatus: z.enum(["Inscrito", "Pendiente", "No inscrito"], {
    required_error: "Por favor selecciona un estado",
  }),
  position: z.string().optional().or(z.literal("")),
  jerseyNumber: z.coerce.number().optional().or(z.literal(0)),
  experience: z.coerce.number().optional().or(z.literal(0)),
  height: z.coerce.number().optional().or(z.literal(0)),
  weight: z.coerce.number().optional().or(z.literal(0)),
  notes: z.string().optional(),
  adminNotes: z.string().optional(),
})

type PlayerFormValues = z.infer<typeof playerFormSchema>

interface PlayerFormProps {
  playerId?: string
}

export function PlayerForm({ playerId }: PlayerFormProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [player, setPlayer] = useState<any>(null)
  const [permissionError, setPermissionError] = useState<string | null>(null)

  // Inicializar el formulario con valores por defecto
  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      gender: "Masculino",
      birthdate: "",
      ultimateCentral: "",
      federationStatus: "No inscrito",
      position: "",
      jerseyNumber: undefined,
      experience: undefined,
      height: undefined,
      weight: undefined,
      notes: "",
      adminNotes: "",
    },
  })

  // Cargar datos del jugador si estamos en modo edición
  useEffect(() => {
    if (playerId) {
      setIsEditing(true)
      setIsLoading(true)

      fetch(`/api/players/${playerId}`)
        .then((res) => res.json())
        .then((data) => {
          // Formatear la fecha para el input date
          const birthdate = data.birthdate ? new Date(data.birthdate).toISOString().split("T")[0] : ""

          form.reset({
            name: data.name,
            email: data.email,
            phone: data.phone || "",
            gender: data.gender,
            birthdate: birthdate,
            ultimateCentral: data.ultimateCentral || "",
            federationStatus: data.federationStatus,
            position: data.position || "",
            jerseyNumber: data.jerseyNumber || undefined,
            experience: data.experience || undefined,
            height: data.height || undefined,
            weight: data.weight || undefined,
            notes: data.notes || "",
            adminNotes: data.adminNotes || "",
          })
          setPlayer(data)
          setIsLoading(false)

          // Verificar permisos después de cargar los datos
          checkPermissions(data)
        })
        .catch((error) => {
          console.error("Error al cargar datos del jugador:", error)
          toast.error("No se pudo cargar la información del jugador")
          setIsLoading(false)
        })
    }
  }, [playerId, form, session])

  // Función para verificar permisos
  const checkPermissions = (playerData: any) => {
    if (!session) {
      setPermissionError("No hay sesión activa")
      return false
    }

    // Los administradores siempre pueden editar
    if (session.user.role === "admin") {
      setPermissionError(null)
      return true
    }

    // Si estamos creando un nuevo jugador, solo los administradores pueden hacerlo
    if (!isEditing) {
      setPermissionError("Solo los administradores pueden crear nuevos jugadores")
      return false
    }

    // Verificar si el email del jugador coincide con el email del usuario
    if (session.user.email === playerData.email) {
      setPermissionError(null)
      return true
    }

    // Si estamos editando, verificar si el usuario es el propietario del perfil
    if (playerData?.userId === session.user.id) {
      setPermissionError(null)
      return true
    }

    setPermissionError(
      `No eres el propietario de este perfil. Tu ID: ${session.user.id}, ID del propietario: ${playerData?.userId || "No asignado"}, Tu email: ${session.user.email}, Email del jugador: ${playerData.email}`,
    )
    return false
  }

  // Función para verificar si el usuario puede editar
  const canEdit = () => {
    if (!session) return false

    // Los administradores siempre pueden editar
    if (session.user.role === "admin") return true

    // Si estamos creando un nuevo jugador, solo los administradores pueden hacerlo
    if (!isEditing) return false

    // Verificar si el email del jugador coincide con el email del usuario
    if (session.user.email === player?.email) return true

    // Si estamos editando, verificar si el usuario es el propietario del perfil
    return player?.userId === session.user.id
  }

  // Si la sesión está cargando, mostrar un indicador de carga
  if (status === "loading") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando...</CardTitle>
          <CardDescription>Verificando permisos</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  // Si no tiene permisos, mostrar mensaje de error
  if (!canEdit()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acceso denegado</CardTitle>
          <CardDescription>No tienes permisos para realizar esta acción</CardDescription>
        </CardHeader>
        <CardContent>
          {permissionError && (
            <div className="p-4 bg-red-50 text-red-800 rounded-md">
              <p className="font-medium">Información de depuración:</p>
              <p>{permissionError}</p>
              <p className="mt-2">Estado de sesión: {status}</p>
              <p>Rol de usuario: {session?.user?.role || "No disponible"}</p>
              <p>ID de usuario: {session?.user?.id || "No disponible"}</p>
              <p>Email de usuario: {session?.user?.email || "No disponible"}</p>
              <p>ID de jugador: {player?._id || "No disponible"}</p>
              <p>Email de jugador: {player?.email || "No disponible"}</p>
              <p>ID de propietario: {player?.userId || "No asignado"}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Determinar qué campos puede editar el usuario
  const isAdmin = session?.user?.role === "admin"
  const isOwner = player?.userId === session?.user?.id || session?.user?.email === player?.email

  // Manejar el envío del formulario
  async function onSubmit(data: PlayerFormValues) {
    setIsLoading(true)

    try {
      // Convertir la fecha de nacimiento a formato ISO
      const formattedData = {
        ...data,
        birthdate: new Date(data.birthdate).toISOString(),
      }

      const url = isEditing ? `/api/players/${playerId}` : "/api/players"
      const method = isEditing ? "PUT" : "POST"

      // No intentamos asignar el userId aquí, lo haremos en el servidor
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar el jugador")
      }

      toast.success(isEditing ? "Jugador actualizado correctamente" : "Jugador creado correctamente")

      router.push(isEditing ? `/players/${playerId}` : "/players")
      router.refresh()
    } catch (error) {
      console.error("Error al guardar jugador:", error)
      toast.error(error instanceof Error ? error.message : "Error al guardar el jugador")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Jugador" : "Nuevo Jugador"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza la información del jugador"
            : "Completa el formulario para añadir un nuevo jugador al equipo"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre y apellidos"
                        {...field}
                        disabled={isLoading || (!isAdmin && !isOwner)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@ejemplo.com"
                        {...field}
                        disabled={isLoading || (!isAdmin && !isOwner)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="600123456" {...field} disabled={isLoading || (!isAdmin && !isOwner)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Género</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading || (!isAdmin && !isOwner)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un género" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthdate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de nacimiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isLoading || (!isAdmin && !isOwner)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posición</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Handler, Cutter, etc."
                        {...field}
                        disabled={isLoading || (!isAdmin && !isOwner)}
                      />
                    </FormControl>
                    <FormDescription>Posición que juega habitualmente</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jerseyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de camiseta</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} disabled={isLoading || (!isAdmin && !isOwner)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Años de experiencia</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} disabled={isLoading || (!isAdmin && !isOwner)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altura (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="175"
                        {...field}
                        disabled={isLoading || (!isAdmin && !isOwner)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="70" {...field} disabled={isLoading || (!isAdmin && !isOwner)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ultimateCentral"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil Ultimate Central</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://ultimatecentral.com/u/username"
                        {...field}
                        disabled={isLoading || (!isAdmin && !isOwner)}
                      />
                    </FormControl>
                    <FormDescription>URL del perfil en Ultimate Central (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="federationStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado Federación</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || !isAdmin}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Inscrito">Inscrito</SelectItem>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="No inscrito">No inscrito</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Solo los administradores pueden cambiar este campo</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Información adicional sobre el jugador"
                      className="min-h-[100px]"
                      {...field}
                      disabled={isLoading || (!isAdmin && !isOwner)}
                    />
                  </FormControl>
                  <FormDescription>Información adicional relevante (opcional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isAdmin && (
              <FormField
                control={form.control}
                name="adminNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas administrativas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notas solo visibles para administradores"
                        className="min-h-[100px]"
                        {...field}
                        disabled={isLoading || !isAdmin}
                      />
                    </FormControl>
                    <FormDescription>Notas internas solo visibles para administradores</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Actualizar Jugador" : "Crear Jugador"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
