import type { Metadata } from "next"
import { TournamentsList } from "@/components/tournaments/tournaments-list"
import { TournamentCalendar } from "@/components/tournaments/tournament-calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Torneos | Disckatus Ultimate Madrid",
  description: "Gestión de torneos del equipo",
}

export default function TournamentsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Torneos</h2>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4">
          <TournamentsList />
        </TabsContent>
        <TabsContent value="calendar" className="space-y-4">
          <TournamentCalendar />
        </TabsContent>
      </Tabs>
    </div>
  )
}

