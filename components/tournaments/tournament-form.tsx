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
const tournamentFormSchema = z.object({
  title: z.string().min(3, { message: "El título debe tener al menos 3 caracteres" }),
  description: z.string().optional(),
  location: z.string().min(2, { message: "La ubicación es obligatoria" }),
  start: z.string().min(1, { message: "La fecha de inicio es obligatoria" }),
  end: z.string().min(1, { message: "La fecha de fin es obligatoria" }),
  type: z.enum(["Fun", "Control", "CE", "Entrenamiento", "Reunión"], {
    required_error: "El tipo de torneo es obligatorio",
  }),
  genderRestriction: z.enum(["Mixto", "Open", "Femenino"], {
    required_error: "La restricción de género es obligatoria",
  }),
  maxPlayers: z.coerce.number().min(1, { message: "El número máximo de jugadores debe ser al menos 1" }),
  registrationDeadline: z.string().optional(),
  organizerName: z.string().optional(),
  organizerEmail: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  organizerPhone: z.string().optional(),
  fee: z.coerce.number().optional(),
  teamFee: z.coerce.number().optional(),
  currency: z.string().optional(),
  whatsappGroup: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
  website: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
  notes: z.string().optional(),
  adminNotes: z.string().optional(),
  status: z.enum(["Upcoming", "Ongoing", "Completed", "Cancelled"], {
    required_error: "El estado del torneo es obligatorio",
  }),
})

type TournamentFormValues = z.infer<typeof tournamentFormSchema>

interface TournamentFormProps {
  tournamentId?: string
}

export function TournamentForm({ tournamentId }: TournamentFormProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Inicializar el formulario con valores por defecto
  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      start: "",
      end: "",
      type: "Fun",
      genderRestriction: "Mixto",
      maxPlayers: 20,
      registrationDeadline: "",
      organizerName: "",
      organizerEmail: "",
      organizerPhone: "",
      fee: 0,
      teamFee: 0,
      currency: "EUR",
      whatsappGroup: "",
      website: "",
      notes: "",
      adminNotes: "",
      status: "Upcoming",
    },
  })

  // Cargar datos del torneo si estamos en modo edición
  useEffect(() => {
    if (tournamentId) {
      setIsEditing(true)
      setIsLoading(true)

      fetch(`/api/tournaments/${tournamentId}`)
        .then((res) => res.json())
        .then((data) => {
          // Formatear las fechas para el input date
          const startDate = data.start ? new Date(data.start).toISOString().split("T")[0] : ""
          const endDate = data.end ? new Date(data.end).toISOString().split("T")[0] : ""
          const deadlineDate = data.registrationDeadline
            ? new Date(data.registrationDeadline).toISOString().split("T")[0]
            : ""

          form.reset({
            title: data.title,
            description: data.description || "",
            location: data.location,
            start: startDate,
            end: endDate,
            type: data.type,
            genderRestriction: data.genderRestriction,
            maxPlayers: data.maxPlayers,
            registrationDeadline: deadlineDate,
            organizerName: data.organizerName || "",
            organizerEmail: data.organizerEmail || "",
            organizerPhone: data.organizerPhone || "",
            fee: data.fee || 0,
            teamFee: data.teamFee || 0,
            currency: data.currency || "EUR",
            whatsappGroup: data.whatsappGroup || "",
            website: data.website || "",
            notes: data.notes || "",
            adminNotes: data.adminNotes || "",
            status: data.status,
          })
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error al cargar datos del torneo:", error)
          toast.error("No se pudo cargar la información del torneo")
          setIsLoading(false)
        })
    }
  }, [tournamentId, form])

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

  // Verificar si el usuario está autenticado y es administrador
  if (!session || session.user.role !== "admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acceso denegado</CardTitle>
          <CardDescription>No tienes permisos para realizar esta acción</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Solo los administradores pueden crear o editar torneos.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Manejar el envío del formulario
  async function onSubmit(data: TournamentFormValues) {
    setIsLoading(true)

    try {
      // Convertir las fechas a formato ISO
      const formattedData = {
        ...data,
        start: new Date(data.start).toISOString(),
        end: new Date(data.end).toISOString(),
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline).toISOString() : undefined,
      }

      const url = isEditing ? `/api/tournaments/${tournamentId}` : "/api/tournaments"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar el torneo")
      }

      toast.success(isEditing ? "Torneo actualizado correctamente" : "Torneo creado correctamente")

      router.push(isEditing ? `/tournaments/${tournamentId}` : "/tournaments")
      router.refresh()
    } catch (error) {
      console.error("Error al guardar torneo:", error)
      toast.error(error instanceof Error ? error.message : "Error al guardar el torneo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Torneo" : "Nuevo Torneo"}</CardTitle>
        <CardDescription>
          {isEditing ? "Actualiza la información del torneo" : "Completa el formulario para añadir un nuevo torneo"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del torneo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del torneo" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Ciudad o lugar" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de inicio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de fin</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de torneo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Fun">Fun</SelectItem>
                        <SelectItem value="Control">Control</SelectItem>
                        <SelectItem value="CE">CE</SelectItem>
                        <SelectItem value="Entrenamiento">Entrenamiento</SelectItem>
                        <SelectItem value="Reunión">Reunión</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Fun: Amistoso, Control: Preparación, CE: Campeonato Oficial</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genderRestriction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mixto">Mixto</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxPlayers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máximo de jugadores</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha límite de inscripción</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado del torneo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Upcoming">Próximo</SelectItem>
                        <SelectItem value="Ongoing">En curso</SelectItem>
                        <SelectItem value="Completed">Completado</SelectItem>
                        <SelectItem value="Cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuota de jugador</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Dejar en 0 si es gratuito</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teamFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuota de equipo</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Dejar en 0 si es gratuito</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una moneda" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsappGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupo de WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="https://chat.whatsapp.com/..." {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Enlace al grupo de WhatsApp (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sitio web</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ejemplo.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Información sobre el torneo"
                        className="min-h-[100px]"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="organizerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del organizador</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email del organizador</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@ejemplo.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono del organizador</FormLabel>
                    <FormControl>
                      <Input placeholder="600123456" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
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
                  <FormLabel>Notas públicas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Información adicional para los participantes"
                      className="min-h-[100px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>Visible para todos los usuarios</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adminNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas administrativas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas internas para administradores"
                      className="min-h-[100px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>Solo visible para administradores</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Actualizar Torneo" : "Crear Torneo"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
