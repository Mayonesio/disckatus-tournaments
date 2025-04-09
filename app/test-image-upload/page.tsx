"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { Upload, Loader2 } from "lucide-react"

export default function TestImageUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [playerId, setPlayerId] = useState("") // El usuario debe proporcionar un ID válido

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Crear una URL para previsualizar la imagen
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  const handleImageUpload = async () => {
    if (!playerId) {
      toast.error("Por favor, ingresa un ID de jugador válido")
      return
    }

    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      toast.error("Por favor, selecciona una imagen primero")
      return
    }

    setIsUploading(true)
    setUploadResult(null)

    try {
      console.log("Test: Iniciando subida de imagen:", file.name, file.type, file.size)

      // Crear un FormData para enviar la imagen
      const formData = new FormData()
      formData.append("image", file)

      console.log("Test: FormData creado, enviando solicitud...")

      // Enviar la imagen al servidor
      const response = await fetch(`/api/players/${playerId}/image`, {
        method: "POST",
        body: formData,
      })

      console.log("Test: Respuesta recibida, status:", response.status)

      const data = await response.json()
      console.log("Test: Datos de respuesta:", data)

      setUploadResult(data)

      if (!response.ok) {
        throw new Error(data.error || "Error al subir la imagen")
      }

      toast.success("Imagen subida correctamente")
    } catch (error) {
      console.error("Test: Error detallado al subir la imagen:", error)
      toast.error(error instanceof Error ? error.message : "Error al subir la imagen")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Prueba de Subida de Imagen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="playerId" className="block text-sm font-medium mb-1">
              ID del jugador:
            </label>
            <div className="flex gap-2">
              <input
                id="playerId"
                type="text"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Ingresa el ID del jugador"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Ingresa un ID válido de un jugador existente en la base de datos.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" disabled={isUploading}>
              <Upload className="mr-2 h-4 w-4" />
              Seleccionar Imagen
            </Button>
          </div>

          {imagePreview && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Vista previa:</p>
              <div className="relative h-40 w-40 mx-auto overflow-hidden rounded-md border">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Vista previa"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleImageUpload} disabled={isUploading || !imagePreview || !playerId} className="w-full">
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              "Subir Imagen"
            )}
          </Button>
        </CardFooter>

        {uploadResult && (
          <CardContent>
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Resultado:</p>
              <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
                {JSON.stringify(uploadResult, null, 2)}
              </pre>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
