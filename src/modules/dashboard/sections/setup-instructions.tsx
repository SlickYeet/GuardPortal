import { SettingsIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SetupInstructionsSection() {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>
          <SettingsIcon className="mr-2 inline-block size-4" />
          Setup Instructions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-inside list-decimal space-y-2 text-muted-foreground text-sm">
          <li>Download and install the WireGuard app on your device</li>
          <li>
            Open the app and tap the &quot;+&quot; button to add a new tunnel
          </li>
          <li>
            Choose &quot;Create from QR code&quot; and scan the QR code above
          </li>
          <li>
            Or choose &quot;Create from file or archive&quot; and import the
            downloaded config file
          </li>
          <li>Toggle the connection on to connect to the VPN</li>
        </ol>
      </CardContent>
    </Card>
  )
}
