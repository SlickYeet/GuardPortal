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
import { getStaticPeerConfig } from "@/lib/wireguard"

const CONFIG_DETAILS = [
  { label: "Server", value: "vpn.famlam.ca:51820" },
  { label: "Allowed IPs", value: "10.0.0.0/32" },
  { label: "DNS", value: "192.168.0.200" },
]

export default async function VPNPage() {
  const wireguardConfig = await getStaticPeerConfig()

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
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
              <CardTitle>QR Code</CardTitle>
              <CardDescription>
                Scan this QR code with your WireGuard app to import the
                configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QRCodeDisplay value={wireguardConfig} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration Details</CardTitle>
              <CardDescription>
                Your WireGuard configuration details
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-full flex-col justify-between space-y-4">
              {CONFIG_DETAILS.map((detail) => (
                <div key={detail.label}>
                  <Label className="text-muted-foreground">
                    {detail.label}
                  </Label>
                  <p className="text-sm">{detail.value}</p>
                </div>
              ))}
              <DetailsCardButtons config={wireguardConfig} />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
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
