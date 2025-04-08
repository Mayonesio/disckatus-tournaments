import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Función para combinar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Otras utilidades compartidas que son seguras tanto para el cliente como para el servidor
// NO importar nada relacionado con MongoDB en este archivo
