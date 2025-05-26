import {
  CloudCog,
  FileText,
  Globe,
  QrCode,
  Server,
  Settings,
  Settings2,
} from "lucide-react"

import { getPeerConfig } from "@/actions/wireguard"
import { DetailsCardButtons } from "@/app/vpn/_components/details-card-buttons"
import { SignOutForm } from "@/app/vpn/_components/sign-out-form"
import { QRCodeDisplay } from "@/components/qr-code-display"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { parseWireguardConfig } from "@/lib/wireguard"

export default async function VPNPage() {
  const wireguardConfig = await getPeerConfig()
  const details = parseWireguardConfig(wireguardConfig.config)

  const CONFIG_DETAILS = [
    { label: "Name", value: wireguardConfig.fileName, icon: FileText },
    { label: "Server", value: details.server, icon: Server },
    { label: "Allowed IPs", value: details.allowedIPs, icon: Globe },
    { label: "DNS", value: details.dns, icon: CloudCog },
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
          <SignOutForm />
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
              <QRCodeDisplay value={wireguardConfig.config} />
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
              <DetailsCardButtons config={wireguardConfig.config} />
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
