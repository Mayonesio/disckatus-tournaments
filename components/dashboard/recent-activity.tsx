"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

// Datos de ejemplo para la actividad reciente
const recentActivity = [
  {
    id: "1",
    type: "registration",
    user: {
      name: "Carlos Pérez",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    tournament: "Torneo de Primavera",
    timestamp: "Hace 2 horas",
    status: "pending",
  },
  {
    id: "2",
    type: "payment",
    user: {
      name: "Laura García",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    tournament: "Campeonato Regional",
    timestamp: "Hace 5 horas",
    status: "completed",
  },
  {
    id: "3",
    type: "registration",
    user: {
      name: "Miguel Rodríguez",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    tournament: "Torneo Internacional",
    timestamp: "Hace 1 día",
    status: "pending",
  },
  {
    id: "4",
    type: "payment",
    user: {
      name: "Ana Martínez",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    tournament: "Torneo de Primavera",
    timestamp: "Hace 2 días",
    status: "completed",
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {recentActivity.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.user.name}</p>
            <p className="text-sm text-muted-foreground">
              {activity.type === "registration"
                ? `Se ha inscrito en ${activity.tournament}`
                : `Ha realizado el pago para ${activity.tournament}`}
            </p>
            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {activity.status === "pending" && activity.type === "registration" && (
              <>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            {activity.status === "completed" && (
              <span className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-800/20 dark:text-green-400">
                Completado
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

