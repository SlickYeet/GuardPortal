import {
  CloudCog,
  Edit,
  FileText,
  Globe,
  QrCode,
  Server,
  Settings,
  Settings2,
} from "lucide-react"
import { type Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"

import { isUserFirstLogin } from "@/actions/auth"
import { getPeerConfigByUserId } from "@/actions/wireguard"
import { DetailsCardButtons } from "@/app/vpn/_components/details-card-buttons"
import { FirstTimeLogin } from "@/components/first-time-login"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { UserMenu } from "@/components/user-menu"
import { isUserAdmin } from "@/lib/utils"
import { auth } from "@/server/auth"

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const user = session?.user

  if (!user) {
    return {
      title: "VPN Configuration",
      description: "Please log in to view your VPN configuration.",
    }
  }

  const isAdmin = isUserAdmin(user)

  const config = await getPeerConfigByUserId(user.id)
  if (!config) {
    return {
      title: `${user.name || user.email} - No VPN Configuration`,
      description: isAdmin
        ? "You have no VPN configuration set up yet."
        : "You have no VPN configuration set up yet. Please contact your administrator.",
    }
  }

  return {
    title: `${user.name || user.email} - ${config.name} VPN Configuration`,
    description: `Your VPN configuration for ${config.name}. Scan the QR code or download the config file to set up your VPN.`,
  }
}

export default async function VPNPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const user = session?.user

  if (!user) {
    return (
      <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-primary text-3xl font-bold">
            How did you get here?
          </h1>
          <p className="text-muted-foreground mt-2">
            This is not supposed to be possible. Please log in to access your
            VPN configuration.
          </p>
        </div>
      </div>
    )
  }

  const isAdmin = isUserAdmin(session.user)
  const isFirstLogin = await isUserFirstLogin(user.id)

  if (isFirstLogin) {
    return <FirstTimeLogin user={user} />
  }

  const wireguardConfig = await getPeerConfigByUserId(user.id)

  if (!wireguardConfig) {
    return (
      <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-primary text-3xl font-bold">
            No VPN configuration found
          </h1>
          <p className="text-muted-foreground mt-2">
            Please contact your administrator to set up your VPN.
            <br /> If you are the administrator,{" "}
            <Link
              href="/admin?tab=create-config"
              className="text-primary hover:underline"
            >
              go to the admin panel
            </Link>{" "}
            to create a new VPN configuration.
          </p>
        </div>
      </div>
    )
  }

  const CONFIG_DETAILS = [
    { label: "Name", value: wireguardConfig.name, icon: FileText },
    { label: "Server", value: wireguardConfig.endpoint, icon: Server },
    { label: "Allowed IPs", value: wireguardConfig.allowedIPs, icon: Globe },
    { label: "DNS", value: wireguardConfig.dns, icon: CloudCog },
  ]

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-y-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-primary text-3xl font-bold">
              Your VPN Configuration
            </h1>
            <p className="text-muted-foreground mt-2">
              Scan the QR code or download the configuration file
            </p>
          </div>
          <UserMenu user={session!.user} isAdmin={isAdmin} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <QrCode className="mr-2 inline-block size-4" />
                QR Code
              </CardTitle>
              <CardDescription>
                Scan this QR code with your WireGuard app to import the
                configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QRCodeDisplay config={wireguardConfig} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    <Settings2 className="mr-2 inline-block size-4" />
                    Configuration Details
                  </CardTitle>
                  <CardDescription>
                    Your WireGuard configuration details
                  </CardDescription>
                </div>
                {isAdmin && (
                  <Button size="icon" variant="outline" asChild>
                    <Link
                      href={`/admin?tab=manage-configs&id=${wireguardConfig.id}`}
                    >
                      <Edit className="size-4" />
                      <span className="sr-only">Edit Configuration</span>
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex h-full flex-col justify-between space-y-4">
              {CONFIG_DETAILS.map(({ label, value, icon: Icon }) => (
                <div key={label}>
                  <Label className="text-muted-foreground">
                    <Icon className="size-3.5" />
                    {label}
                  </Label>
                  <p className="text-sm">{value}</p>
                </div>
              ))}
              <DetailsCardButtons config={wireguardConfig} />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>
              <Settings className="mr-2 inline-block size-4" />
              Setup Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-muted-foreground list-inside list-decimal space-y-2 text-sm">
              <li>Download and install the WireGuard app on your device</li>
              <li>
                Open the app and tap the &quot;+&quot; button to add a new
                tunnel
              </li>
              <li>
                Choose &quot;Create from QR code&quot; and scan the QR code
                above
              </li>
              <li>
                Or choose &quot;Create from file or archive&quot; and import the
                downloaded config file
              </li>
              <li>Toggle the connection on to connect to the VPN</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
