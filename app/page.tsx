import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, Trophy, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary text-secondary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Disckatus Ultimate Madrid
            </h1>
            <p className="mx-auto max-w-[700px] text-lg md:text-xl">
              Plataforma de gestión para el equipo de Ultimate Frisbee
            </p>
            <div className="space-x-4">
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/dashboard">Acceder al Dashboard</Link>
              </Button>
              <Button asChild  className="border-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/tournaments">Ver Torneos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Gestión de Jugadores</h3>
              <p className="text-muted-foreground">
                Administra los datos de todos los jugadores del equipo, incluyendo información de contacto y estado de
                inscripción.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Torneos</h3>
              <p className="text-muted-foreground">
                Organiza la participación en torneos, gestiona inscripciones y pagos, y mantén un registro de
                resultados.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CalendarDays className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Calendario</h3>
              <p className="text-muted-foreground">
                Visualiza todos los torneos en un calendario interactivo y recibe notificaciones de fechas importantes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

