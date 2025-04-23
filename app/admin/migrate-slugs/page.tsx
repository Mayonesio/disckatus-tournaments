"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function MigrateSlugsPage() {
  const { data: session, status } = useSession()
  const [isMigrating, setIsMigrating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Verificar si el usuario es administrador
  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== "admin") {
    redirect("/")
  }

  const handleMigrate = async () => {
    setIsMigrating(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/admin/migrate-player-slugs", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al migrar slugs")
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Migración de Slugs de Jugadores</h1>

      <Card>
        <CardHeader>
          <CardTitle>Generar Slugs para Jugadores</CardTitle>
          <CardDescription>
            Esta herramienta genera slugs amigables para URLs basados en los nombres de los jugadores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Información</AlertTitle>
            <AlertDescription>
              Los slugs permiten URLs más amigables como /players/juan-perez en lugar de mostrar IDs de MongoDB.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert
              variant="default"
              className="mt-4 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
            >
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Migración completada</AlertTitle>
              <AlertDescription>
                <div className="mt-2">
                  <p>{result.message}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleMigrate} disabled={isMigrating}>
            {isMigrating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Migrando...
              </>
            ) : (
              "Iniciar migración"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
