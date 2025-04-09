"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Loader2, ZoomIn, ZoomOut, RotateCw, Crop, AlertCircle } from "lucide-react"
import Cropper from "react-easy-crop"
import type { Area, Point } from "react-easy-crop"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Tamaño máximo permitido para imágenes (3MB)
const MAX_IMAGE_SIZE = 3 * 1024 * 1024
const MAX_IMAGE_DIMENSIONS = 2000 // píxeles (ancho o alto)

interface ProfileImageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (file: File) => Promise<boolean | void> // Actualizado para aceptar Promise<boolean | void>
  playerId: string
}

export function ProfileImageModal({ open, onOpenChange, onSave, playerId }: ProfileImageModalProps) {
  const [image, setImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setError(null)

      // Validar el tipo de archivo
      if (!file.type.startsWith("image/")) {
        setError("Por favor, selecciona una imagen válida (JPG, PNG, etc.)")
        return
      }

      // Validar el tamaño del archivo
      if (file.size > MAX_IMAGE_SIZE) {
        setError(`La imagen no debe superar los 3MB. Tu archivo tiene ${(file.size / (1024 * 1024)).toFixed(2)}MB`)
        return
      }

      // Verificar las dimensiones de la imagen
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(img.src)
        if (img.width > MAX_IMAGE_DIMENSIONS || img.height > MAX_IMAGE_DIMENSIONS) {
          setError(`La imagen no debe superar los ${MAX_IMAGE_DIMENSIONS}x${MAX_IMAGE_DIMENSIONS} píxeles`)
          return
        }

        // Si todo está bien, establecer la imagen
        const reader = new FileReader()
        reader.addEventListener("load", () => {
          setImage(reader.result as string)
        })
        reader.readAsDataURL(file)
      }
      img.onerror = () => {
        setError("No se pudo cargar la imagen. Por favor, intenta con otra.")
      }
      img.src = URL.createObjectURL(file)
    }
  }

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createCroppedImage = async () => {
    if (!image || !croppedAreaPixels) return null

    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return null

      const img = new Image()
      img.src = image

      await new Promise<void>((resolve) => {
        img.onload = () => resolve()
      })

      // Configurar el canvas con las dimensiones del área recortada
      canvas.width = croppedAreaPixels.width
      canvas.height = croppedAreaPixels.height

      // Aplicar rotación si es necesario
      if (rotation > 0) {
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.translate(-canvas.width / 2, -canvas.height / 2)
      }

      // Dibujar la imagen recortada en el canvas
      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      )

      if (rotation > 0) {
        ctx.restore()
      }

      // Convertir el canvas a un blob
      return new Promise<File>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setError("Error al procesar la imagen. Inténtalo de nuevo.")
              return null
            }
            const file = new File([blob], "profile-image.jpg", { type: "image/jpeg" })
            resolve(file)
          },
          "image/jpeg",
          0.9,
        )
      })
    } catch (e) {
      console.error("Error al crear la imagen recortada:", e)
      setError("Error al procesar la imagen. Inténtalo de nuevo.")
      return null
    }
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const croppedImage = await createCroppedImage()
      if (!croppedImage) {
        setError("No se pudo procesar la imagen. Inténtalo de nuevo.")
        setIsLoading(false)
        return
      }

      const result = await onSave(croppedImage)

      // Si onSave devuelve true o undefined/void, consideramos que fue exitoso
      if (result !== false) {
        resetModal()
      } else {
        // Si devuelve false explícitamente, mantenemos el modal abierto
        setError("No se pudo guardar la imagen. Inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("Error al guardar la imagen:", error)
      setError(error instanceof Error ? error.message : "Error al guardar la imagen")
    } finally {
      setIsLoading(false)
    }
  }

  const resetModal = () => {
    setImage(null)
    setZoom(1)
    setRotation(0)
    setCrop({ x: 0, y: 0 })
    setError(null)
    onOpenChange(false)
  }

  const handleSelectImage = () => {
    fileInputRef.current?.click()
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetModal()
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Actualizar foto de perfil</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4">
          {!image ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-muted-foreground/25 bg-muted/50">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <div className="flex flex-col items-center gap-2 text-center">
                <Crop className="h-10 w-10 text-muted-foreground" />
                <h3 className="font-semibold text-lg">Selecciona una imagen</h3>
                <p className="text-sm text-muted-foreground">Haz clic para seleccionar una imagen de tu dispositivo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tamaño máximo: 3MB. Dimensiones máximas: 2000x2000px
                </p>
                <Button onClick={handleSelectImage} className="mt-2">
                  Seleccionar imagen
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative w-full h-[300px] bg-black rounded-lg overflow-hidden">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  objectFit="contain"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ZoomOut className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[zoom]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={(value) => setZoom(value[0])}
                    className="flex-1"
                  />
                  <ZoomIn className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" size="icon" onClick={handleRotate}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={resetModal}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!image || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
