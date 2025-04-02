// Cargar variables de entorno manualmente
const fs = require("fs")
const path = require("path")

// Función para cargar variables de entorno desde .env.local
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local")
    const envContent = fs.readFileSync(envPath, "utf8")

    envContent.split("\n").forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim()
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    })

    console.log("Variables de entorno cargadas correctamente")
  } catch (error) {
    console.warn("No se pudo cargar el archivo .env.local:", error.message)
    console.warn("Asegúrate de proporcionar las variables de entorno necesarias")
  }
}

// Cargar variables de entorno
loadEnv()

const bcryptjs = require("bcryptjs")
const { MongoClient } = require("mongodb")

// Función para conectar a la base de datos
async function connectToDatabase() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("MONGODB_URI no está definido en las variables de entorno")
  }

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(process.env.MONGODB_DB || "disckatus")
  return { client, db }
}

async function createAdmin() {
  let client
  try {
    console.log("Conectando a la base de datos...")
    const { client: mongoClient, db } = await connectToDatabase()
    client = mongoClient

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
      password: await bcryptjs.hash("Admin123!", 10),
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
  } finally {
    if (client) {
      await client.close()
    }
  }
}

createAdmin()
  .then(() => {
    console.log("Proceso completado")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Error en el proceso:", error)
    process.exit(1)
  })

