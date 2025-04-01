"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

export function PlayerFilters() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
        <CardDescription>Filtra la lista de jugadores</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Género</h3>
          <RadioGroup defaultValue="all">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="gender-all" />
              <Label htmlFor="gender-all">Todos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="gender-male" />
              <Label htmlFor="gender-male">Masculino</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="gender-female" />
              <Label htmlFor="gender-female">Femenino</Label>
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Estado Federación</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="federation-registered" />
              <Label htmlFor="federation-registered">Inscrito</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="federation-pending" />
              <Label htmlFor="federation-pending">Pendiente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="federation-none" />
              <Label htmlFor="federation-none">No inscrito</Label>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Participación en torneos</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="participation-active" />
              <Label htmlFor="participation-active">Activos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="participation-inactive" />
              <Label htmlFor="participation-inactive">Inactivos</Label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Aplicar filtros</Button>
      </CardFooter>
    </Card>
  )
}

