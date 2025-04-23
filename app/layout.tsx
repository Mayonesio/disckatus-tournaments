import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { cookies } from "next/headers"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar"
import { SessionProvider } from "@/components/session-provider"
import Header from "@/components/header"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Disckatus Ultimate Madrid",
  description: "Plataforma de gestión para Disckatus Ultimate Madrid",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SessionProvider session={session}>
            <SidebarProvider defaultOpen={defaultOpen}>
              <div className="flex min-h-screen bg-background">
                <AppSidebar />
                <SidebarInset className="flex w-full flex-1 flex-col">
                  <Header />
                  <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
                </SidebarInset>
              </div>
            </SidebarProvider>
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
