import { hash } from "bcrypt"
import { connectToDatabase } from "../lib/mongodb"

async function createAdmin() {
  try {
    console.log("Conectando a la base de datos...")
    const { db } = await connectToDatabase()
    
    console.log("Verificando si ya existe un administrador...")
    const existingAdmin = await db.collection("users").findOne({ role: "admin" })
    
    if (existingAdmin) {
      console.log("Ya existe un usuario administrador:", existingAdmin.email)
      return
    }
    
    console.log("Creando usuario administrador...")
    const adminData = {
      name: "presidente",
      email: "madrid@disckatus.com",
      password: await hash("Admin123!", 10),
      role: "admin",
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    const result = await db.collection("users").insertOne(adminData)
    
    console.log("Usuario administrador creado con éxito:", result.insertedId)
    console.log("Email:", adminData.email)
    console.log("Contraseña: Admin123!")
  } catch (error) {
    console.error("Error al crear el administrador:", error)
  }
}

createAdmin()
  .then(() => {
    console.log("Proceso completado")
    process.exit(0)
  })
  .catch(error => {
    console.error("Error en el proceso:", error)
    process.exit(1)
  })