"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { Loader2, Star } from "lucide-react"
import type { PlayerSkill } from "@/types/player"

// Esquema de validación para el formulario
const skillsFormSchema = z.object({
  skills: z.array(
    z.object({
      name: z.string(),
      value: z.number().min(0).max(100),
      verified: z.boolean().optional(),
      verifiedBy: z.string().optional(),
      verifiedAt: z.date().optional(),
    }),
  ),
})

type SkillsFormValues = z.infer<typeof skillsFormSchema>

interface PlayerSkillsFormProps {
  playerId: string
  initialSkills?: PlayerSkill[]
}

export function PlayerSkillsForm({ playerId, initialSkills }: PlayerSkillsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Habilidades predeterminadas si no se proporcionan
  const defaultSkills: PlayerSkill[] = [
    { name: "Lanzamiento", value: 50 },
    { name: "Recepción", value: 50 },
    { name: "Velocidad", value: 50 },
    { name: "Resistencia", value: 50 },
    { name: "Defensa", value: 50 },
    { name: "Visión de juego", value: 50 },
  ]

  // Inicializar el formulario con valores por defecto
  const form = useForm<SkillsFormValues>({
    resolver: zodResolver(skillsFormSchema),
    defaultValues: {
      skills: initialSkills || defaultSkills,
    },
  })

  // Manejar el envío del formulario
  async function onSubmit(data: SkillsFormValues) {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/players/${playerId}/skills`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar las habilidades")
      }

      toast.success("Habilidades actualizadas correctamente")
      router.push(`/players/${playerId}`)
      router.refresh()
    } catch (error) {
      console.error("Error al guardar habilidades:", error)
      toast.error(error instanceof Error ? error.message : "Error al guardar las habilidades")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500" />
          Editar Habilidades
        </CardTitle>
        <CardDescription>Actualiza tus niveles de habilidad en diferentes aspectos del juego</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {form.watch("skills").map((skill, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`skills.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>{skill.name}</FormLabel>
                      <span className="font-bold">{field.value}</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Mueve el deslizador para ajustar tu nivel en {skill.name.toLowerCase()}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Habilidades
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

