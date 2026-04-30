import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { APP_DESCRIPTION, APP_NAME } from "@/constants"
import { TRPCReactProvider } from "@/lib/api/client"
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

export const metadata: Metadata = {
  description: APP_DESCRIPTION,
  title: APP_NAME,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta content={APP_NAME} name="apple-mobile-web-app-title" />
        <meta content={APP_DESCRIPTION} name="description" />
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
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster closeButton richColors />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  )
}
