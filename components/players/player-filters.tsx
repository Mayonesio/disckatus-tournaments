"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export function PlayerFilters() {
  const router = useRouter()
  const [gender, setGender] = useState("all")
  const [federationStatus, setFederationStatus] = useState<string[]>([])
  const [participation, setParticipation] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Manejar cambio en el estado de federación
  const handleFederationStatusChange = (value: string, checked: boolean) => {
    setFederationStatus(checked ? [...federationStatus, value] : federationStatus.filter((item) => item !== value))
  }

  // Manejar cambio en la participación
  const handleParticipationChange = (value: string, checked: boolean) => {
    setParticipation(checked ? [...participation, value] : participation.filter((item) => item !== value))
  }

  // Aplicar filtros
  const applyFilters = async () => {
    setIsLoading(true)
    try {
      // Construir la URL con los parámetros de filtro
      const params = new URLSearchParams()

      if (gender !== "all") {
        params.append("gender", gender)
      }

      if (federationStatus.length > 0) {
        federationStatus.forEach((status) => {
          params.append("federationStatus", status)
        })
      }

      if (participation.length > 0) {
        participation.forEach((status) => {
          params.append("participation", status)
        })
      }

      // Navegar a la página con los filtros aplicados
      router.push(`/players?${params.toString()}`)
    } catch (error) {
      console.error("Error al aplicar filtros:", error)
      toast.error("Error al aplicar filtros")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
        <CardDescription>Filtra la lista de jugadores</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Género</h3>
          <RadioGroup defaultValue="all" value={gender} onValueChange={setGender}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="gender-all" />
              <Label htmlFor="gender-all">Todos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Masculino" id="gender-male" />
              <Label htmlFor="gender-male">Masculino</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Femenino" id="gender-female" />
              <Label htmlFor="gender-female">Femenino</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Otro" id="gender-other" />
              <Label htmlFor="gender-other">Otro</Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Estado Federación</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="federation-registered"
                checked={federationStatus.includes("Inscrito")}
                onCheckedChange={(checked) => handleFederationStatusChange("Inscrito", checked === true)}
              />
              <Label htmlFor="federation-registered">Inscrito</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="federation-pending"
                checked={federationStatus.includes("Pendiente")}
                onCheckedChange={(checked) => handleFederationStatusChange("Pendiente", checked === true)}
              />
              <Label htmlFor="federation-pending">Pendiente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="federation-none"
                checked={federationStatus.includes("No inscrito")}
                onCheckedChange={(checked) => handleFederationStatusChange("No inscrito", checked === true)}
              />
              <Label htmlFor="federation-none">No inscrito</Label>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Participación en torneos</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="participation-active"
                checked={participation.includes("active")}
                onCheckedChange={(checked) => handleParticipationChange("active", checked === true)}
              />
              <Label htmlFor="participation-active">Activos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="participation-inactive"
                checked={participation.includes("inactive")}
                onCheckedChange={(checked) => handleParticipationChange("inactive", checked === true)}
              />
              <Label htmlFor="participation-inactive">Inactivos</Label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={applyFilters} disabled={isLoading}>
          {isLoading ? "Aplicando..." : "Aplicar filtros"}
        </Button>
      </CardFooter>
    </Card>
  )
}

