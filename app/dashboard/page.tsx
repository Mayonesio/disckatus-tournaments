import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { UpcomingTournaments } from "@/components/dashboard/upcoming-tournaments"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export const metadata: Metadata = {
  title: "Dashboard | Disckatus Ultimate Madrid",
  description: "Panel de control de Disckatus Ultimate Madrid",
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/dashboard")
  }

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      <div className="space-y-6">
        <DashboardStats />
        <div className="grid gap-6 md:grid-cols-4">
          <UpcomingTournaments />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
