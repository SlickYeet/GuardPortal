import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import { SiteBanner } from "@/components/site-banner"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TRPCReactProvider } from "@/lib/api/client"
import { getSiteSettings } from "@/lib/site-settings"
import { cn } from "@/lib/utils"

import "@/styles/globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings()

  return {
    description: siteSettings.appDescription,
    title: siteSettings.appName,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteSettings = await getSiteSettings()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          content={siteSettings.appName}
          name="apple-mobile-web-app-title"
        />
        <meta content={siteSettings.appDescription} name="description" />
      </head>
      <body
        className={cn(
          "font-sans antialiased",
          inter.variable,
          geistMono.variable,
        )}
      >
        <TRPCReactProvider>
          <ThemeProvider>
            <TooltipProvider>
              <SiteBanner
                announcementEnabled={siteSettings.announcementEnabled}
                announcementMessage={siteSettings.announcementMessage}
                maintenanceMode={siteSettings.maintenanceMode}
              />
              {children}
              <Toaster closeButton richColors />
            </TooltipProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  )
}
