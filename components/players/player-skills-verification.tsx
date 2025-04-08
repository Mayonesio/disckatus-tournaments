"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Loader2, Shield } from "lucide-react"
import type { PlayerSkill } from "@/types/player"

interface PlayerSkillsVerificationProps {
  playerId: string
  playerName: string
  skills: PlayerSkill[]
}

export function PlayerSkillsVerification({ playerId, playerName, skills }: PlayerSkillsVerificationProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  // Manejar la selección de habilidades
  const handleSkillToggle = (skillName: string) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skillName)) {
        return prev.filter((name) => name !== skillName)
      } else {
        return [...prev, skillName]
      }
    })
  }

  // Verificar las habilidades seleccionadas
  const handleVerifySkills = async () => {
    if (selectedSkills.length === 0) {
      toast.error("Selecciona al menos una habilidad para verificar")
      return
    }

    setIsLoading(true)

    try {
      // Realizar una solicitud para cada habilidad seleccionada
      const promises = selectedSkills.map((skillName) =>
        fetch(`/api/players/${playerId}/skills`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skillName,
            verified: true,
          }),
        }),
      )

      const results = await Promise.all(promises)

      // Verificar si todas las solicitudes fueron exitosas
      const allSuccessful = results.every((res) => res.ok)

      if (!allSuccessful) {
        throw new Error("No se pudieron verificar todas las habilidades")
      }

      toast.success("Habilidades verificadas correctamente")
      router.push(`/players/${playerId}`)
      router.refresh()
    } catch (error) {
      console.error("Error al verificar habilidades:", error)
      toast.error(error instanceof Error ? error.message : "Error al verificar las habilidades")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          Verificar Habilidades
        </CardTitle>
        <CardDescription>Verifica las habilidades de {playerName} como administrador</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {skills.map((skill, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`skill-${index}`}
                  checked={selectedSkills.includes(skill.name)}
                  onCheckedChange={() => handleSkillToggle(skill.name)}
                  disabled={skill.verified || isLoading}
                />
                <label htmlFor={`skill-${index}`} className="flex items-center gap-2 cursor-pointer">
                  <span className="font-medium">{skill.name}</span>
                  {skill.verified && (
                    <div className="relative group">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="absolute -top-8 left-0 hidden group-hover:block bg-black/80 text-white text-xs p-1 rounded whitespace-nowrap">
                        Ya verificada
                      </span>
                    </div>
                  )}
                </label>
              </div>
              <span className="font-bold">{skill.value}</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={skill.value} className="h-2" />
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleVerifySkills} disabled={isLoading || selectedSkills.length === 0}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verificar Seleccionadas
        </Button>
      </CardFooter>
    </Card>
  )
}

