import { AlertCircleIcon, BadgeAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SiteBannerProps {
  announcementEnabled: boolean
  announcementMessage: string
  maintenanceMode: boolean
}

export function SiteBanner({
  announcementEnabled,
  announcementMessage,
  maintenanceMode,
}: SiteBannerProps) {
  if (!announcementEnabled && !maintenanceMode) return null

  return (
    <div className="px-2 pt-3">
      <div className="mx-auto max-w-5xl">
        <Alert variant={maintenanceMode ? "warning" : "info"}>
          {maintenanceMode ? <BadgeAlertIcon /> : <AlertCircleIcon />}
          <AlertTitle>
            {maintenanceMode ? "Maintenance mode is enabled" : "Site update"}
          </AlertTitle>
          <AlertDescription>
            {announcementEnabled && announcementMessage
              ? announcementMessage
              : maintenanceMode
                ? "Site behavior may be temporarily limited while administrative changes are in progress."
                : ""}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
