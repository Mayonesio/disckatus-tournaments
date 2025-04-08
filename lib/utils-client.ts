import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Función para combinar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Otras utilidades seguras para el cliente pueden ir aquí
// NO importar nada relacionado con MongoDB en este archivo
