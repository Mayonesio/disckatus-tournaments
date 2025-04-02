// Cargar variables de entorno manualmente
const fs = require("fs")
const path = require("path")
const { ObjectId } = require("mongodb")

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

async function fixPlayerUserLinks() {
  let client
  try {
    console.log("Conectando a la base de datos...")
    const { client: mongoClient, db } = await connectToDatabase()
    client = mongoClient

    console.log("Obteniendo usuarios y jugadores...")
    const users = await db.collection("users").find({}).toArray()
    const players = await db.collection("players").find({}).toArray()

    console.log(`Encontrados ${users.length} usuarios y ${players.length} jugadores`)

    let linkedCount = 0
    let updatedCount = 0
    let notFoundCount = 0

    // Para cada usuario, buscar un jugador con el mismo email
    for (const user of users) {
      if (!user.email) continue

      const matchingPlayer = players.find((player) => player.email === user.email)

      if (matchingPlayer) {
        // Verificar si el userId es una cadena o un ObjectId
        const currentUserId = matchingPlayer.userId ? matchingPlayer.userId.toString() : null
        const newUserId = user._id.toString()

        if (!currentUserId) {
          console.log(`Vinculando usuario ${user.email} con jugador ${matchingPlayer.name}`)

          // Actualizar el jugador con el ID del usuario
          await db.collection("players").updateOne(
            { _id: matchingPlayer._id },
            {
              $set: {
                userId: newUserId,
                updatedAt: new Date(),
              },
            },
          )

          linkedCount++
        } else if (currentUserId !== newUserId) {
          console.log(`Actualizando vínculo para ${user.email}: ${currentUserId} -> ${newUserId}`)

          // Actualizar el jugador con el ID correcto del usuario
          await db.collection("players").updateOne(
            { _id: matchingPlayer._id },
            {
              $set: {
                userId: newUserId,
                updatedAt: new Date(),
              },
            },
          )

          updatedCount++
        } else {
          console.log(`El jugador ${matchingPlayer.name} ya está correctamente vinculado a ${user.email}`)
        }
      } else {
        console.log(`No se encontró un jugador para el usuario ${user.email}`)
        notFoundCount++
      }
    }

    console.log(
      `Proceso completado: ${linkedCount} jugadores vinculados, ${updatedCount} vínculos actualizados, ${notFoundCount} usuarios sin jugador asociado`,
    )
  } catch (error) {
    console.error("Error al vincular usuarios con jugadores:", error)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

fixPlayerUserLinks()
  .then(() => {
    console.log("Proceso completado")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Error en el proceso:", error)
    process.exit(1)
  })

