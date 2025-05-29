import {
  CloudCog,
  FileText,
  Globe,
  QrCode,
  Server,
  Settings,
  Settings2,
} from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"

import { getPeerConfigByUserId } from "@/actions/wireguard"
import { DetailsCardButtons } from "@/app/vpn/_components/details-card-buttons"
import { QRCodeDisplay } from "@/components/qr-code-display"
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
import type { PeerConfigWithConfiguration } from "@/lib/wireguard"
import { auth } from "@/server/auth"

export default async function VPNPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const user = session?.user

  const isAdmin = isUserAdmin(session?.user)

  const wireguardConfig = await getPeerConfigByUserId(user!.id)

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
              <QRCodeDisplay
                config={wireguardConfig as PeerConfigWithConfiguration}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Settings2 className="mr-2 inline-block size-4" />
                Configuration Details
              </CardTitle>
              <CardDescription>
                Your WireGuard configuration details
              </CardDescription>
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
