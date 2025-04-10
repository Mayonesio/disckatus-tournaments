import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { hash } from "bcryptjs" // Usando bcryptjs en lugar de bcrypt
import { z } from "zod"

// Esquema de validación para el registro
const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar los datos de entrada
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.flatten()
      return NextResponse.json({ error: "Datos de registro inválidos", details: errors }, { status: 400 })
    }

    const { name, email, password } = body

    // Conectar a la base de datos
    const { db } = await connectToDatabase()

    // Verificar si el email ya existe
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 400 })
    }

    // Hashear la contraseña
    const hashedPassword = await hash(password, 10)

    // Crear el usuario
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: "player", // Rol por defecto según tu estructura
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Guardar el usuario en la base de datos
    const insertResult = await db.collection("users").insertOne(newUser)

    // Crear un perfil de jugador asociado al usuario
    const playerProfile = {
      name,
      email,
      userId: insertResult.insertedId.toString(),
      gender: "Masculino", // Valor por defecto
      birthdate: new Date(),
      federationStatus: "No inscrito",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("players").insertOne(playerProfile)

    return NextResponse.json({ success: true, message: "Usuario registrado correctamente" }, { status: 201 })
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 })
  }
}
