"use client"

import { Loader2, RefreshCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import {
  deletePeerConfig,
  getPeerConfigsFromDB,
  updatePeerConfig,
} from "@/actions/wireguard"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn, parseConfigName } from "@/lib/utils"
import { ConfigSchema } from "@/schemas/config"
import type { PeerConfigWithUser } from "@/types"

import { AssigneeDetails } from "./assignee-details"
import { DeleteConfigDialog } from "./delete-config-dialog"
import { EditConfigDialog } from "./edit-config-dialog"

export function ConfigList({ defaultConfig }: { defaultConfig: string }) {
  const [configs, setConfigs] = useState<PeerConfigWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [configToDelete, setConfigToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [configToEdit, setConfigToEdit] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadConfigs()
  }, [])

  async function loadConfigs() {
    setIsLoading(true)
    try {
      const fetchedConfigs = await getPeerConfigsFromDB()
      setConfigs(fetchedConfigs as PeerConfigWithUser[])
    } catch (error) {
      console.error("Failed to load configs:", error)
      toast.error("Error", {
        description: `Failed to load configs: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteConfig() {
    if (!configToDelete) return
    setIsDeleting(true)

    try {
      await deletePeerConfig(configToDelete)
      toast.success("Config deleted successfully")
      loadConfigs()
    } catch (error) {
      console.error("Failed to delete config:", error)
      toast.error("Error", {
        description: `Failed to delete config: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsDeleting(false)
      setConfigToDelete(null)
    }
  }

  async function handleEditConfig(
    values: Partial<z.infer<typeof ConfigSchema>>,
  ) {
    if (!configToEdit) return
    setIsEditing(true)

    try {
      await updatePeerConfig(values)
      toast.success("Config updated successfully")
      loadConfigs()
    } catch (error) {
      console.error("Failed to edit config:", error)
      toast.error("Error", {
        description: `Failed to edit config: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsEditing(false)
      setConfigToEdit(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Peer Configs</h2>
        <Button disabled={isLoading} onClick={loadConfigs} variant="outline">
          <RefreshCcw
            className={cn("size-4", isLoading ? "animate-spin" : "")}
          />
          <span>Refresh</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : configs.length === 0 ? (
        <div className="text-muted-foreground p-8 text-center">
          <p>No peer configs found.</p>
          <p className="text-sm">Create a new config to get started.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Peer Name</TableHead>
                <TableHead>Server</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>DNS</TableHead>
                <TableHead>Configuration</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="truncate font-medium">
                    {parseConfigName(config.name) || "Unnamed Peer"}
                  </TableCell>
                  <TableCell>{`${config.endpoint}` || "N/A"}</TableCell>
                  <TableCell>{config.allowedIPs || "N/A"}</TableCell>
                  <TableCell>{config.dns || "N/A"}</TableCell>
                  <TableCell>
                    {config.configuration.name || "No configuration"}
                  </TableCell>
                  {config.user ? (
                    <AssigneeDetails user={config.user} />
                  ) : (
                    <TableCell className="text-muted-foreground">
                      No user assigned
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex justify-end space-x-2">
                      <EditConfigDialog
                        initConfig={config}
                        configToEdit={configToEdit}
                        setConfigToEdit={setConfigToEdit}
                        isEditing={isEditing}
                        handleEditConfig={handleEditConfig}
                        defaultConfig={defaultConfig}
                      />
                      <DeleteConfigDialog
                        config={config}
                        configToDelete={configToDelete}
                        setConfigToDelete={setConfigToDelete}
                        isDeleting={isDeleting}
                        handleDeleteConfig={handleDeleteConfig}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
